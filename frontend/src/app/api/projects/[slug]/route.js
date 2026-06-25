import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import { verifyAdmin } from '@/lib/auth';

// GET /api/projects/[slug] — public
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    console.log('📦 GET /api/projects/' + slug);
    const project = await Project.findOne({ slug });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err) {
    console.error('❌ GET project:', err.message);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/projects/[slug] — protected (using _id passed as slug param)
export async function PUT(request, { params }) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

  try {
    await dbConnect();
    const { slug } = await params;
    const body = await request.json();
    console.log('📦 PUT /api/projects/' + slug);
    const project = await Project.findByIdAndUpdate(slug, body, { new: true, runValidators: true });
    if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    console.log('✅ Project updated:', project.title);
    return NextResponse.json({ project });
  } catch (err) {
    console.error('❌ PUT project:', err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// DELETE /api/projects/[slug] — protected
export async function DELETE(request, { params }) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });

  try {
    await dbConnect();
    const { slug } = await params;
    console.log('📦 DELETE /api/projects/' + slug);
    const project = await Project.findByIdAndDelete(slug);
    if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    console.log('✅ Project deleted:', project.title);
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('❌ DELETE project:', err.message);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
