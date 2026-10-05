const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB
});

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1XLfNTP1_YYaybvOAjoprP0PZMpxxg7Dt';

let cachedAccessToken = null;
let tokenExpiry = 0;

async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && tokenExpiry > now + 60) {
    return cachedAccessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error('Google Drive API credentials are not configured in environment variables');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    console.error('❌ Google token refresh error in backend:', data);
    throw new Error(data.error_description || data.error || 'Failed to refresh Google Drive token');
  }

  cachedAccessToken = data.access_token;
  tokenExpiry = now + (data.expires_in || 3600);
  return cachedAccessToken;
}

// @route   POST /api/upload
// @desc    Upload image to Google Drive
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const accessToken = await getGoogleAccessToken();

    const metadata = {
      name: req.file.originalname || `shopify_${Date.now()}.png`,
      parents: [FOLDER_ID],
    };

    const boundary = 'gdrive_upload_' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const body = Buffer.concat([
      Buffer.from(
        delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          `Content-Type: ${req.file.mimetype || 'image/png'}\r\n\r\n`
      ),
      req.file.buffer,
      Buffer.from(closeDelimiter),
    ]);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      }
    );

    const fileData = await uploadRes.json();
    if (!uploadRes.ok || !fileData.id) {
      console.error('❌ Backend Google Drive upload error:', fileData);
      return res.status(400).json({ message: fileData.error?.message || 'Google Drive upload failed' });
    }

    const fileId = fileData.id;

    // Make public
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      });
    } catch (permErr) {
      console.warn('⚠️ Could not set public permission on Drive file:', permErr.message);
    }

    const url = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log('✅ Image uploaded to Google Drive:', url);

    return res.json({ url, fileId, webViewLink: fileData.webViewLink });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
});

module.exports = router;
