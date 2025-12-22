
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    
    // Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        userId = decoded.id;
    } catch (e) {
        return NextResponse.json({ success: false, message: "Invalid session" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);

    if (!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Verify Current Password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
         return NextResponse.json({ success: false, message: "Incorrect current password" }, { status: 400 });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
