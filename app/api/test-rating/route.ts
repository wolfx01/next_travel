
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Comment from '@/lib/models/Comment';
import PlaceDetails from '@/lib/models/PlaceDetails';

export async function GET(request: Request) {
    await connectToDatabase();
    
    // 1. Create Dummy Comment
    const testId = "TEST_" + Date.now();
    const comment = new Comment({
        placeId: "99999",
        userId: "test_user",
        userName: "Test User",
        text: "Test review",
        rating: 4
    });
    await comment.save();
    
    // 2. Fetch it back
    const saved = await Comment.findById(comment._id);
    
    // 3. Aggregate
    const stats = await Comment.aggregate([
        { $match: { placeId: "99999" } },
        { $group: { _id: "$placeId", average: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    
    // 4. Update PlaceDetails
    const updateResult = await PlaceDetails.findOneAndUpdate(
        { placeName: "TestCity", country: "TestCountry" },
        { 
            placeName: "TestCity",
            country: "TestCountry",
            averageRating: stats[0]?.average,
            reviewCount: stats[0]?.count,
            lastUpdated: new Date()
        },
        { upsert: true, new: true }
    );
    
    // 5. Cleanup
    await Comment.deleteOne({ _id: comment._id });
    await PlaceDetails.deleteOne({ placeName: "TestCity" });

    return NextResponse.json({
        savedComment: saved,
        hasRatingField: saved.rating !== undefined,
        stats: stats,
        updateResult: updateResult
    });
}
