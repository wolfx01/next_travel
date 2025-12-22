import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Fetch users, selecting only necessary public fields
    // Limit to 100 for now to avoid huge payloads
    const users = await User.find({})
        .select('userName avatarUrl coverUrl bio visitedPlaces followers')
        .limit(100)
        .lean();

    return NextResponse.json(users);

  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
