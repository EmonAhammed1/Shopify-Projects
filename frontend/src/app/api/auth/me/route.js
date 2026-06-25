import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

// GET /api/auth/me
export async function GET(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
  return NextResponse.json({ admin });
}
