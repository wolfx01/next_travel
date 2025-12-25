import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Comment from '@/lib/models/Comment';
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

    // Calculate Stats
    const reviewsCount = await Comment.countDocuments({ userId: user._id });
    
    // Unique countries count
    const uniqueCountries = new Set();
    console.log("DEBUG: visitedPlaces", JSON.stringify(user.visitedPlaces, null, 2));
    user.visitedPlaces.forEach((p: any) => {
        if (p.countryName) uniqueCountries.add(p.countryName);
    });
    const countriesCount = uniqueCountries.size;

    // Mock response for debugging
    const userData = {
      loggedIn: true,
      mongoId: user._id, // Return explicit ID for handy usage
      userId: user._id, // Also valid
      userName: user.userName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      coverUrl: user.coverUrl,
      bio: user.bio,
      currentLocation: user.currentLocation || "",
      savedPlaces: user.savedPlaces || [],
      savedPlacesCount: user.savedPlaces ? user.savedPlaces.length : 0,
      visitedPlaces: user.visitedPlaces || [],
      reviewsCount,
      countriesCount,
      followersCount: user.followers?.length || 0,
      profileRatingAvg: user.profileRatingAvg || 0, // Return profile rating
      isAdmin: user.isAdmin || false
    };
    // console.log("Check Login returning:", userData); // Uncomment if needed
    return NextResponse.json(userData);
  } catch (err) {
    console.error('Check-Login API Error:', err);
    return NextResponse.json({ loggedIn: false });
  }
}
