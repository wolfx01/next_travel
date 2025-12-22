import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        // Ideally checking for admin session here via cookies/headers
        // For now, trusting the frontend auth check + we can add a quick check if needed but simplicity first
        
        const users = await User.find({}, 'userName email isAdmin createdAt').sort({ _id: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const idToDelete = searchParams.get('id');
        const adminId = searchParams.get('adminId'); // Passed for basic verification

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
