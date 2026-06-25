import jwt from 'jsonwebtoken';
import Admin from '@/models/Admin';
import dbConnect from '@/lib/dbConnect';

export async function verifyAdmin(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();
    const admin = await Admin.findById(decoded.id).select('-password');
    return admin;
  } catch {
    return null;
  }
}
