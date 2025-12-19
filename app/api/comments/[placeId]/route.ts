import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Comment from '@/lib/models/Comment';

export async function GET(request: Request, { params }: { params: Promise<{ placeId: string }> }) {
  try {
    const { placeId } = await params;
    await connectToDatabase();
    const comments = await Comment.find({ placeId }).sort({ date: -1 });
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}
