import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '81995afd703f5d59b1fca06f9266fd65';

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

    const imgbbFormData = new FormData();
    imgbbFormData.append('image', file);

    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const data = await imgbbRes.json();
    if (data.success && data.data?.url) {
      console.log('✅ Uploaded to ImgBB:', data.data.url);
      return NextResponse.json({
        success: true,
        url: data.data.url,
        display_url: data.data.display_url,
        delete_url: data.data.delete_url,
      });
    }

    console.error('❌ ImgBB upload error:', data);
    return NextResponse.json(
      { message: data.error?.message || 'ImgBB upload failed' },
      { status: data.status_code || 400 }
    );
  } catch (err) {
    console.error('❌ Upload API error:', err.message);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}
