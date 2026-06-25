import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import { verifyAdmin } from '@/lib/auth';

// PATCH /api/contact/[id] — toggle read
export async function PATCH(request, { params }) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

  try {
    await dbConnect();
    const { id } = await params;
    const msg = await Message.findById(id);
    if (!msg) return NextResponse.json({ message: 'Message not found' }, { status: 404 });

    msg.read = !msg.read;
    await msg.save();
    console.log(`✅ Message ${id} → ${msg.read ? 'read' : 'unread'}`);
    return NextResponse.json({ message: msg });
  } catch (err) {
    console.error('❌ Toggle read:', err.message);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/contact/[id]
export async function DELETE(request, { params }) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

  try {
    await dbConnect();
    const { id } = await params;
    const msg = await Message.findByIdAndDelete(id);
    if (!msg) return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    console.log('✅ Message deleted:', id);
    return NextResponse.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('❌ Delete message:', err.message);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
