import crypto from 'crypto';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Upload an image or video buffer to Cloudinary
 * @param {Object} params
 * @param {Buffer} params.buffer - File buffer
 * @param {string} params.mimeType - MIME type (e.g. image/png, video/mp4)
 * @param {string} params.filename - Optional filename
 * @param {string} params.folder - Optional Cloudinary folder
 * @returns {Promise<{ url: string, publicId: string, secureUrl: string, resourceType: string }>}
 */
export async function uploadToCloudinary({ buffer, mimeType = 'image/png', filename = '', folder = 'shopify_projects' }) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured');
  }

  const isVideo = mimeType.startsWith('video/');
  const resourceType = isVideo ? 'video' : 'image';
  const timestamp = Math.floor(Date.now() / 1000);

  // Sign request
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const formData = new FormData();
  formData.append('file', base64Data);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', folder);
  formData.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.secure_url) {
    console.error('❌ Cloudinary upload error:', data);
    throw new Error(data.error?.message || 'Failed to upload file to Cloudinary');
  }

  // Optimize delivery with f_auto,q_auto
  let optimizedUrl = data.secure_url;
  if (optimizedUrl.includes('/image/upload/')) {
    optimizedUrl = optimizedUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
  } else if (optimizedUrl.includes('/video/upload/')) {
    optimizedUrl = optimizedUrl.replace('/video/upload/', '/video/upload/f_auto,q_auto/');
  }

  console.log(`✅ Uploaded to Cloudinary (${resourceType}) [${data.public_id}]:`, optimizedUrl);

  return {
    url: optimizedUrl,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    bytes: data.bytes,
  };
}
