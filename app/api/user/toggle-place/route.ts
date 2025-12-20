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

    const { placeId } = await request.json();
    if (!placeId) {
        return NextResponse.json({ error: "Place ID required" }, { status: 400 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    await connectToDatabase();
    
    const user = await User.findById(decoded.id);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const index = user.savedPlaces.indexOf(placeId.toString());
    let isSaved = false;

    if (index === -1) {
        // Add
        user.savedPlaces.push(placeId.toString());
        isSaved = true;
    } else {
        // Remove
        user.savedPlaces.splice(index, 1);
        isSaved = false;
    }

    await user.save();

    return NextResponse.json({ 
        success: true, 
        isSaved,
        savedPlacesCount: user.savedPlaces.length 
    });

  } catch (error) {
    console.error("Save place error:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
