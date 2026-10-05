const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 32 * 1024 * 1024 }, // 32MB
});

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const GOOGLE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1XLfNTP1_YYaybvOAjoprP0PZMpxxg7Dt';

let cachedAccessToken = null;
let tokenExpiry = 0;

async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && tokenExpiry > now + 60) {
    return cachedAccessToken;
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error('Google Drive API credentials are not configured in environment variables');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
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
// @desc    Upload image/video to Cloudinary (or Google Drive fallback)
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 1. Try Cloudinary (Primary Ultra-Fast CDN)
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = 'shopify_projects';

      const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
      const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');
      const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

      const formData = new FormData();
      formData.append('file', base64Data);
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', folder);
      formData.append('signature', signature);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
        method: 'POST',
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (cloudRes.ok && cloudData.secure_url) {
        let optimizedUrl = cloudData.secure_url;
        if (optimizedUrl.includes('/image/upload/')) {
          optimizedUrl = optimizedUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
        }
        console.log('✅ Uploaded to Cloudinary:', optimizedUrl);
        return res.json({ url: optimizedUrl, secureUrl: cloudData.secure_url, publicId: cloudData.public_id });
      }
    }

    // 2. Google Drive Fallback
    const accessToken = await getGoogleAccessToken();
    const metadata = {
      name: req.file.originalname || `shopify_${Date.now()}.png`,
      parents: [GOOGLE_FOLDER_ID],
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
      return res.status(400).json({ message: fileData.error?.message || 'Upload failed' });
    }

    const fileId = fileData.id;

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
