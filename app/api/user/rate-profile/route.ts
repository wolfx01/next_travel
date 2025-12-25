
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { targetUserId, raterId, rating } = await request.json();

    if (!targetUserId || !raterId || !rating) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (targetUserId === raterId) {
      return NextResponse.json({ error: "Cannot rate yourself" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize if missing
    if (!user.profileRatings) user.profileRatings = [];

    // Check if already rated
    const existingIndex = user.profileRatings.findIndex((r: any) => r.raterId === raterId);
    
    if (existingIndex > -1) {
        // Update existing rating
        user.profileRatings[existingIndex].rating = rating;
    } else {
        // Add new rating
        user.profileRatings.push({ raterId, rating });
    }

    // Recalculate Average
    const total = user.profileRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0);
    const avg = total / user.profileRatings.length;

    user.profileRatingAvg = parseFloat(avg.toFixed(1));
    user.profileRatingCount = user.profileRatings.length;

    await user.save();

    return NextResponse.json({ 
        success: true, 
        newAverage: user.profileRatingAvg,
        newCount: user.profileRatingCount 
    });

  } catch (error: any) {
    console.error("Error rating profile:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
