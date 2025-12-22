import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Post from '@/lib/models/Post';
import Notification from '@/lib/models/Notification';

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // 1. Verify Admin Status
        const adminUser = await User.findById(userId);
        if (!adminUser || !adminUser.isAdmin) {
             // For testing purposes, if no admins exist, maybe allow the first user? 
             // Or just strictly enforce true. Let's enforce true.
             // But wait, the user currently has isAdmin: false by default.
             // We return 403.
             return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
        }

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
