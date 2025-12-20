import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { avatarUrl, coverUrl } = await request.json();
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

    await connectToDatabase();
    
    const updateData: any = {};
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (coverUrl) updateData.coverUrl = coverUrl;

    const user = await User.findByIdAndUpdate(
        decoded.id, 
        updateData,
        { new: true }
    );

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
        success: true, 
        avatarUrl: user.avatarUrl, 
        coverUrl: user.coverUrl 
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
