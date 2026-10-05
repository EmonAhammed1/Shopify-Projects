// Google Drive API Client for Image Uploads

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1XLfNTP1_YYaybvOAjoprP0PZMpxxg7Dt';

let cachedAccessToken = null;
let tokenExpiry = 0;

/**
 * Get valid Google OAuth2 Access Token using Refresh Token
 */
export async function getGoogleAccessToken() {
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
    console.error('❌ Google token refresh error:', data);
    throw new Error(data.error_description || data.error || 'Failed to refresh Google Drive token');
  }

  cachedAccessToken = data.access_token;
  tokenExpiry = now + (data.expires_in || 3600);
  return cachedAccessToken;
}

/**
 * Upload an image buffer/stream to Google Drive folder and make it publicly accessible
 * @param {Object} params
 * @param {string} params.name - Filename
 * @param {string} params.mimeType - Image MIME type (image/png, image/jpeg, etc.)
 * @param {Buffer} params.buffer - File buffer
 * @returns {Promise<{ url: string, fileId: string, webViewLink: string }>}
 */
export async function uploadImageToDrive({ name, mimeType, buffer }) {
  const accessToken = await getGoogleAccessToken();

  const metadata = {
    name: name || `shopify_${Date.now()}.png`,
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
        `Content-Type: ${mimeType || 'image/png'}\r\n\r\n`
    ),
    buffer,
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
    console.error('❌ Google Drive upload error:', fileData);
    throw new Error(fileData.error?.message || 'Failed to upload image to Google Drive');
  }

  const fileId = fileData.id;

  // Make file publicly readable
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (permErr) {
    console.warn('⚠️ Could not set public permission on Drive file:', permErr.message);
  }

  // Direct image URL for embedding
  const url = `https://drive.google.com/uc?export=view&id=${fileId}`;

  console.log(`✅ Image uploaded to Google Drive [${fileId}]:`, url);
  return {
    url,
    fileId,
    webViewLink: fileData.webViewLink,
  };
}
