import { requireSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const requestedLimit = Number(searchParams.get('limit') || 50);
    const limit = Number.isInteger(requestedLimit) ? Math.max(1, Math.min(100, requestedLimit)) : 50;

    await connectToDatabase();
    
    let query = {};
    if (userId) {
        query = { userId };
    }

    // Sort by newest first
    const posts = await Post.find(query).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
        const session = await requireSession();
        if (session.error) return session.error;
        const userId = session.userId;

    // 1. Verify User
    const body = await request.json();
    const { content, mediaUrl, location } = body;

    if (!userId || typeof content !== "string" || !content.trim() || content.length > 10000) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch user details to ensure valid user and get current avatar
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newPost = await Post.create({
      userId,
      userName: user.userName,
      userAvatar: user.avatarUrl,
      content,
      mediaUrl,
      location
    });

    return NextResponse.json(newPost, { status: 201 });

  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
