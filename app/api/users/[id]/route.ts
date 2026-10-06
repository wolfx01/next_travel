import { requireSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Comment from '@/lib/models/Comment';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    if (!userId) {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Select specific fields for public view
    const user = await User.findById(userId).select('userName avatarUrl coverUrl bio visitedPlaces savedPlaces followers following email profileRatingAvg profileRatingCount isAdmin');

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate Reviews Count
    const reviewsCount = await Comment.countDocuments({ userId: user._id });

    return NextResponse.json({
        _id: user._id,
        userName: user.userName,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        bio: user.bio,
        visitedPlaces: user.visitedPlaces,
        stats: {
            savedPlaces: user.savedPlaces?.length || 0,
            visitedPlaces: user.visitedPlaces?.length || 0,
            followers: user.followers?.length || 0,
            following: user.following?.length || 0,
            followersList: user.followers
        },
        profileRatingAvg: user.profileRatingAvg || 0,
        profileRatingCount: user.profileRatingCount || 0,
        reviewsCount: reviewsCount
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const session = await requireSession();
      if (session.error) return session.error;
      const requestBody = await request.json();
      const { userName, bio, email } = requestBody;
      const { id: userId } = await params;
      if (userId !== session.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      if (typeof userName !== "string" || userName.trim().length < 3 || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || (bio !== undefined && typeof bio !== "string") || (requestBody.avatarUrl !== undefined && typeof requestBody.avatarUrl !== "string")) return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
      
      await connectToDatabase();
      
      // Update fields
      const updatedUser = await User.findByIdAndUpdate(
          userId, 
          { 
              userName, 
              bio,
              email,
              avatarUrl: requestBody.avatarUrl // Add avatarUrl update
          }, 
          { new: true, runValidators: true }
      ).select('userName bio email avatarUrl'); 
  
      if (!updatedUser) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      return NextResponse.json({ success: true, user: updatedUser });
  
    } catch (error: any) {
      console.error("Error updating user:", error);
      // Handle unique email error
      if (error.code === 11000) {
        return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
  }
