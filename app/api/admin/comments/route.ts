import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await requireAdmin();
        if (session.error) return session.error;
        await connectToDatabase();
        
        // Use aggregation to unwind comments and project them into a flat structure
        const comments = await Post.aggregate([
            { $unwind: "$comments" },
            { 
                $project: {
                    _id: "$comments._id",         // Comment ID
                    postId: "$_id",               // Original Post ID
                    postContent: "$content",      // Context: What post is this on?
                    text: "$comments.text",
                    userId: "$comments.userId",
                    userName: "$comments.userName",
                    createdAt: "$comments.createdAt"
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Admin Comments Error:", error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await requireAdmin();
        if (session.error) return session.error;
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get('postId');
        const commentId = searchParams.get('commentId');
        const adminId = session.userId;

        if (!postId || !commentId || !adminId) {
            return NextResponse.json({ error: 'Missing Required IDs' }, { status: 400 });
        }

        // Verify Admin
        const admin = await User.findById(adminId);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Remove the comment from the array using $pull
        await Post.findByIdAndUpdate(postId, {
            $pull: { comments: { _id: commentId } }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
