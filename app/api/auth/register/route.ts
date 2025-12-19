import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  console.log('Register API: Request received');
  try {
    const { username, email, password } = await request.json();
    console.log(`Register API: Data received for user: ${username}, email: ${email}`);

    if (!username || username.length < 3 || password.length < 8) {
      console.log('Register API: Validation failed');
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    console.log('Register API: Calling connectToDatabase');
    await connectToDatabase();
    console.log('Register API: connected');

    console.log('Register API: Checking for existing user');
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log('Register API: User already exists');
      return NextResponse.json({ success: false, message: "User already exists" });
    }

    console.log('Register API: Hashing Password');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Register API: Creating User Object');
    const newUser = new User({
      userName: username,
      email,
      password: hashedPassword,
    });

    console.log('Register API: Saving User');
    await newUser.save();
    console.log('Register API: User Saved successfully');

    if (!process.env.JWT_SECRET) {
        console.error('Register API Error: JWT_SECRET is missing');
        throw new Error("JWT_SECRET is missing");
    }

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET!, {
      expiresIn: "365d",
    });

    const response = NextResponse.json({ success: true, userName: newUser.userName });

    response.cookies.set("authToken", token, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Register API: Catch Block Error:', error);
    // @ts-ignore
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: "Email already exists" });
    }
    return NextResponse.json({ success: false, message: "Internal server error", error: String(error) }, { status: 500 });
  }
}
