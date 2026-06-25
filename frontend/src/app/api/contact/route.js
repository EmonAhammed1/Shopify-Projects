import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Message from '@/models/Message';
import { verifyAdmin } from '@/lib/auth';

// POST /api/contact — public (submit contact form)
export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, subject, message } = await request.json();
    console.log('📬 New contact message from:', email);

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const msg = await Message.create({ name, email, subject, message });
    console.log('✅ Message saved:', msg._id);
    return NextResponse.json({ message: 'Message sent successfully!' }, { status: 201 });
  } catch (err) {
    console.error('❌ Contact submit error:', err.message);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// GET /api/contact — protected (admin inbox)
export async function GET(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

  try {
    await dbConnect();
    const messages = await Message.find().sort({ createdAt: -1 });
    const unreadCount = await Message.countDocuments({ read: false });
    console.log(`📬 ${messages.length} messages (${unreadCount} unread)`);
    return NextResponse.json({ messages, unreadCount });
  } catch (err) {
    console.error('❌ Get messages:', err.message);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
