import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Comment from '@/lib/models/Comment';

export async function POST(request: Request) {
  try {
    const { placeId, userName, text } = await request.json();
    
    if (!placeId || !userName || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const newComment = new Comment({
      placeId,
      userName,
      text
    });

    await newComment.save();
    return NextResponse.json({ success: true, comment: newComment });

  } catch (error: any) {
    console.error("Error saving comment:", error);
    return NextResponse.json({ error: `Failed to save comment: ${error.message}` }, { status: 500 });
  }
}

export async function GET(request: Request) {
    // This supports fetching comments via query param ?placeId=...
    // Or we could make a dynamic route api/comments/[placeId]
    // The original app used GET /comments/:placeId
    // But since this is the root /comments route, let's support query param or we create a separate file.
    return NextResponse.json({ error: "Use /api/comments/[placeId] to fetch comments" }, { status: 400 });
}
