import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    return NextResponse.json({ loggedIn: false });
  }

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    
    await connectToDatabase();
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ loggedIn: false });
    }

    // Mock response for debugging
    return NextResponse.json({
      loggedIn: true,
      userName: user.userName,
      email: user.email
    });
  } catch (err) {
    console.error('Check-Login API Error:', err);
    return NextResponse.json({ loggedIn: false });
  }
}
