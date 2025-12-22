import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';

// Force dynamic if needed, though GET usually is by default if using request
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        
        const posts = await Post.find({})
            .populate('userId', 'userName avatarUrl')
            .sort({ createdAt: -1 });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("Admin Posts Error:", error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const idToDelete = searchParams.get('id');
        const adminId = searchParams.get('adminId');

        if (!idToDelete || !adminId) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Verify Admin
        const admin = await User.findById(adminId);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await Post.findByIdAndDelete(idToDelete);
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
