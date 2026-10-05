import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';
import { uploadImageToDrive } from '@/lib/googleDrive';

export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') || formData.get('file');

    if (!file) {
      return NextResponse.json({ message: 'No image file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadImageToDrive({
      name: file.name || `shopify_${Date.now()}.png`,
      mimeType: file.type || 'image/png',
      buffer,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      webViewLink: result.webViewLink,
    });
  } catch (err) {
    console.error('❌ Google Drive upload API error:', err.message);
    return NextResponse.json(
      { message: err.message || 'Google Drive upload failed' },
      { status: 500 }
    );
  }
}
