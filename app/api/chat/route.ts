import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const currentUserId = searchParams.get('currentUserId');
        const contactId = searchParams.get('contactId');

        if (!currentUserId) {
            return NextResponse.json({ error: "Missing currentUserId" }, { status: 400 });
        }

        await connectToDatabase();

        if (contactId) {
            // Fetch conversation with specific user
            const messages = await Message.find({
                $or: [
                    { senderId: currentUserId, receiverId: contactId },
                    { senderId: contactId, receiverId: currentUserId }
                ]
            }).sort({ createdAt: 1 }); // Oldest first for chat history

            return NextResponse.json(messages);
        } else {
            // Fetch list of recent conversations (distinct users)
            const messages = await Message.find({
                $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
            }).sort({ createdAt: -1 }).populate('senderId receiverId', 'userName avatarUrl');

            const conversationsMap = new Map();
            messages.forEach((msg: any) => {
                const otherUser = msg.senderId._id.toString() === currentUserId ? msg.receiverId : msg.senderId;
                if (!conversationsMap.has(otherUser._id.toString())) {
                    conversationsMap.set(otherUser._id.toString(), {
                        user: otherUser,
                        lastMessage: msg.content,
                        timestamp: msg.createdAt,
                        unread: msg.receiverId._id.toString() === currentUserId && !msg.read
                    });
                }
            });

            // NEW: Also include users the current user follows (even if no messages yet)
            const currentUser = await User.findById(currentUserId);
            if (currentUser && currentUser.following && currentUser.following.length > 0) {
                // Since 'following' is just [String] in schema, we must manually fetch them
                const followedUsers = await User.find({
                    _id: { $in: currentUser.following }
                }).select('userName avatarUrl');

                followedUsers.forEach((followedUser: any) => {
                    const fId = followedUser._id.toString();
                    if (!conversationsMap.has(fId)) {
                        conversationsMap.set(fId, {
                            user: followedUser,
                            lastMessage: "Start a conversation 👋",
                            timestamp: new Date(0), // Old timestamp to put them at the bottom
                            unread: false
                        });
                    }
                });
            }

            // Convert to array and sort: Real messages first (recent), then "Start conversation" users
            const sortedConversations = Array.from(conversationsMap.values()).sort((a: any, b: any) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

            return NextResponse.json(sortedConversations);
        }

    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { senderId, receiverId, content } = body;

        if (!senderId || !receiverId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const newMessage = await Message.create({
            senderId,
            receiverId,
            content
        });

        return NextResponse.json(newMessage);

    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
