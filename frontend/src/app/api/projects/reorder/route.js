import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import { verifyAdmin } from '@/lib/auth';

// POST or PUT /api/projects/reorder — protected
export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

  try {
    await dbConnect();
    const { orders } = await request.json();

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ message: 'Invalid orders array' }, { status: 400 });
    }

    console.log(`📦 Reordering ${orders.length} projects...`);
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id || item._id },
        update: { $set: { order: Number(item.order) } },
      },
    }));

    await Project.bulkWrite(bulkOps);
    console.log('✅ Projects reordered successfully');

    return NextResponse.json({ message: 'Projects reordered successfully' });
  } catch (err) {
    console.error('❌ Reorder projects error:', err.message);
    return NextResponse.json({ message: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  return POST(request);
}
