import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get('authToken')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || typeof payload.id !== 'string' || !/^[a-f\d]{24}$/i.test(payload.id)) return null;
    return payload.id;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const userId = await getSessionUserId();
  if (!userId) return { userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  await connectToDatabase();
  const user = await User.findById(userId).select('_id');
  if (!user) return { userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  return { userId, error: null };
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.error) return session;
  const user = await User.findById(session.userId).select('isAdmin');
  if (!user?.isAdmin) return { userId: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return session;
}
