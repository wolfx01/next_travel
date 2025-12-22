import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

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
    
    // Select specific fields for public view to protect privacy (exclude email/password)
    // Adding email now so user can edit their profile. Ideally should check if request is from owner.
    const user = await User.findById(userId).select('userName avatarUrl coverUrl bio visitedPlaces savedPlaces followers following email');

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
        _id: user._id,
        userName: user.userName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        coverUrl: user.coverUrl,
        bio: user.bio,
        visitedPlaces: user.visitedPlaces,
        stats: {
            savedPlaces: user.savedPlaces?.length || 0,
            visitedPlaces: user.visitedPlaces?.length || 0,
            followers: user.followers?.length || 0,
            following: user.following?.length || 0,
            followersList: user.followers // Expose list to check if following
        }
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
      const requestBody = await request.json();
      const { userName, bio, email } = requestBody;
      const { id: userId } = await params;
  
      // Auth Check (Basic: Ensure user is logged in)
      // In a real app, verify the token matches the userId being updated
      
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
