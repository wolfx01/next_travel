import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Post from '@/lib/models/Post';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, userId } = body;

    if (!postId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Find post to check if already liked
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isLiked = post.likes.includes(userId);
    let updatedPost;

    if (isLiked) {
        // Unlike
        updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: userId } },
            { new: true }
        );
    } else {
        // Like
        updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: userId } },
            { new: true }
        );

        // Create Notification
        if (post.userId.toString() !== userId) {
            const Notification = (await import('@/lib/models/Notification')).default;
            await Notification.create({
                recipientId: post.userId,
                senderId: userId,
                type: 'like',
                postId: post._id
            });
        }
    }

    return NextResponse.json({ likes: updatedPost.likes });

  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
