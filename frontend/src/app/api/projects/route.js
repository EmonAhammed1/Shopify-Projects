import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import { verifyAdmin } from '@/lib/auth';

// GET /api/projects — public
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const filter = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    console.log(`📦 GET /api/projects → ${projects.length} found`);
    return NextResponse.json({ projects });
  } catch (err) {
    console.error('❌ GET projects:', err.message);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// POST /api/projects — protected
export async function POST(request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

  try {
    await dbConnect();
    const body = await request.json();
    console.log('📦 POST /api/projects', body.title);
    const project = await Project.create(body);
    console.log('✅ Project created:', project.title);
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error('❌ POST project:', err.message);
    if (err.code === 11000) {
      return NextResponse.json({ message: 'Slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
