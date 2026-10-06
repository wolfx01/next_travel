import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(req: Request) {
    try {
        const session = await requireAdmin();
        if (session.error) return session.error;
        await connectToDatabase();
        
        const users = await User.find({}, 'userName email isAdmin createdAt').sort({ _id: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await requireAdmin();
        if (session.error) return session.error;
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const idToDelete = searchParams.get('id');
        const adminId = session.userId;

        if (!idToDelete || !adminId) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        // Verify Admin
        const admin = await User.findById(adminId);
        if (!admin || !admin.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Prevent self-deletion
        if (idToDelete === adminId) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await User.findByIdAndDelete(idToDelete);
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
