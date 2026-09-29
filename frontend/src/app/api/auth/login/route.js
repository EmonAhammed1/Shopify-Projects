import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';

// POST /api/auth/login
export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    console.log('🔐 Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json({ message: 'Please provide email and password' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const admin = await Admin.findOne({
      $or: [
        { email: cleanEmail },
        { email: new RegExp(`^${cleanEmail}$`, 'i') },
        { username: cleanEmail }
      ]
    });

    if (!admin) {
      console.log('❌ Admin not found for:', cleanEmail);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await admin.comparePassword(cleanPassword);
    if (!isMatch) {
      console.log('❌ Wrong password for:', cleanEmail);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    console.log('✅ Admin logged in:', email);
    return NextResponse.json({
      token,
      admin: { id: admin._id, username: admin.username, email: admin.email },
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
