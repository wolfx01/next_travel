import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, userId, text } = body;

    if (!postId || !userId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newComment = {
        userId,
        userName: user.userName,
        userAvatar: user.avatarUrl,
        text,
        createdAt: new Date()
    };

    console.log("Creating comment for post:", postId, "User:", userId, "Text:", text);

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: newComment } },
        { new: true }
    );

    if (!updatedPost) {
        console.error("Post not found for comment:", postId);
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    console.log("Comment added successfully. New count:", updatedPost.comments.length);

    // Create Notification
    const post = await Post.findById(postId); // Re-fetch to be safe or use updatedPost if populated
    if (post && post.userId.toString() !== userId) {
        const Notification = (await import('@/lib/models/Notification')).default;
        await Notification.create({
            recipientId: post.userId,
            senderId: userId,
            type: 'comment',
            postId: post._id
        });
    }

    return NextResponse.json({ comments: updatedPost.comments });

  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
