import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, placeId, placeName, countryName } = body;

    if (!userId || !placeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if place is already visited
    const existingIndex = user.visitedPlaces.findIndex((p: any) => p.placeId === placeId);
    let action = "added";

    if (existingIndex > -1) {
       // Remove
       user.visitedPlaces.splice(existingIndex, 1);
       action = "removed";
    } else {
       // Add
       user.visitedPlaces.push({
         placeId,
         placeName: placeName || "Unknown Place",
         countryName: countryName || "Unknown Country",
         dateVisited: new Date()
       });
    }

    await user.save();

    return NextResponse.json({ 
        message: action === "added" ? "Added to visited places" : "Removed from visited places", 
        action: action,
        visitedPlaces: user.visitedPlaces 
    }, { status: 200 });

  } catch (error) {
    console.error("Error adding visited place:", error);
    return NextResponse.json({ error: "Failed to update visited places" }, { status: 500 });
  }
}

export async function GET(request: Request) {
    // Logic to get visited places for a user (query param userId)
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "UserId required" }, { status: 400 });
        }

        await connectToDatabase();
        const user = await User.findById(userId).select('visitedPlaces');
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.visitedPlaces);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch visited places" }, { status: 500 });
    }
}
