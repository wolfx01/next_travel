import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Comment from '@/lib/models/Comment';
import PlaceDetails from '@/lib/models/PlaceDetails';

export async function POST(request: Request) {
  try {
    const { placeId, userName, text, userId, rating, countryName, placeName } = await request.json();
    
    if (!placeId || !userName || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const newComment = new Comment({
      placeId,
      userId: userId || "anonymous", // Fallback for legacy or anonymous
      userName,
      text,
      rating: rating ? parseInt(rating) : undefined
    });

    await newComment.save();

    // Recalculate Average Rating for this Place
    // We filter by placeId. Note: placeId is a string in Comment schema.
    const stats = await Comment.aggregate([
        { $match: { placeId: placeId.toString() } },
        { $group: { _id: "$placeId", average: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0 && placeName && countryName) {
        const avg = stats[0].average || 0; // Handle null if no ratings exist
        const count = stats[0].count;

        // Update PlaceDetails
        const updated = await PlaceDetails.findOneAndUpdate(
            { placeName: placeName, country: countryName },
            { 
                averageRating: parseFloat(avg.toFixed(1)),
                reviewCount: count,
                lastUpdated: new Date()
            },
            { upsert: true, new: true }
        );
    }

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
