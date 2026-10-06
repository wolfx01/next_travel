import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Post from '@/lib/models/Post';
import Notification from '@/lib/models/Notification';

export async function GET(req: Request) {
    try {
        const session = await requireAdmin();
        if (session.error) return session.error;
        await connectToDatabase();
        // 2. Aggregate Stats
        const usersCount = await User.countDocuments();
        const postsCount = await Post.countDocuments();
        // Approximate comments count if not stored directly effectively
        // Since comments are in arrays in Posts, we aggregate
        const commentsStats = await Post.aggregate([
            { $project: { count: { $size: { $ifNull: ["$comments", []] } } } },
            { $group: { _id: null, total: { $sum: "$count" } } }
        ]);
        const commentsCount = commentsStats.length > 0 ? commentsStats[0].total : 0;
        
        // Visits count (sum of all visitedPlaces arrays)
        const visitsStats = await User.aggregate([
            { $project: { count: { $size: { $ifNull: ["$visitedPlaces", []] } } } },
            { $group: { _id: null, total: { $sum: "$count" } } }
        ]);
        const visitsCount = visitsStats.length > 0 ? visitsStats[0].total : 0;

        return NextResponse.json({
            usersCount,
            postsCount,
            commentsCount,
            visitsCount
        });

    } catch (error) {
        console.error("Admin Stats Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
