import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { uploadImageToDrive } from '@/lib/googleDrive';

export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') || formData.get('file') || formData.get('video');

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';
    const filename = file.name || `upload_${Date.now()}`;

    // Prefer Cloudinary for ultra-fast CDN & auto WebP/video delivery
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const result = await uploadToCloudinary({
        buffer,
        mimeType,
        filename,
      });

      return NextResponse.json({
        success: true,
        url: result.url,
        secureUrl: result.secureUrl,
        publicId: result.publicId,
        provider: 'cloudinary',
      });
    }

    // Fallback to Google Drive
    const driveResult = await uploadImageToDrive({
      name: filename,
      mimeType,
      buffer,
    });

    return NextResponse.json({
      success: true,
      url: driveResult.url,
      fileId: driveResult.fileId,
      webViewLink: driveResult.webViewLink,
      provider: 'google_drive',
    });
  } catch (err) {
    console.error('❌ Upload API error:', err.message);
    return NextResponse.json(
      { message: err.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
