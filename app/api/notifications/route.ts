import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User'; // Populate sender info

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        await connectToDatabase();

        // Fetch notifications, newest first, populate sender details
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('senderId', 'userName avatarUrl')
            .lean();

        // Count unread
        const unreadCount = await Notification.countDocuments({ recipientId: userId, read: false });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { notificationIds } = await request.json(); // Array of IDs to mark as read

        await connectToDatabase();

        if (notificationIds && notificationIds.length > 0) {
            await Notification.updateMany(
                { _id: { $in: notificationIds } },
                { $set: { read: true } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating notifications:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
