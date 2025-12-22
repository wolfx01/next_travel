import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST(request: Request) {
    try {
        const { currentUserId, targetUserId } = await request.json();

        if (!currentUserId || !targetUserId) {
            return NextResponse.json({ error: "Missing user IDs" }, { status: 400 });
        }

        if (currentUserId === targetUserId) {
            return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
        }

        await connectToDatabase();

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Initialize arrays if they don't exist
        if (!currentUser.following) currentUser.following = [];
        if (!targetUser.followers) targetUser.followers = [];

        const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter((id: any) => id.toString() !== targetUserId);
            targetUser.followers = targetUser.followers.filter((id: any) => id.toString() !== currentUserId);
        } else {
            // Follow
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);

            // Create Notification
            const Notification = (await import('@/lib/models/Notification')).default;
            await Notification.create({
                recipientId: targetUserId,
                senderId: currentUserId,
                type: 'follow'
            });
        }

        await currentUser.save();
        await targetUser.save();

        return NextResponse.json({ 
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length 
        });

    } catch (error) {
        console.error("Error in follow API:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
