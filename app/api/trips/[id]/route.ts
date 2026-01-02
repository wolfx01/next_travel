import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Trip from '@/lib/models/Trip';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserIdFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken'); // Fixed cookie name

    if (!token) return null;

    try {
        const decoded: any = jwt.verify(token.value, JWT_SECRET);
        return decoded.id; // Fixed decoded field
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        await connectToDatabase();
        const trip = await Trip.findOne({ _id: id, userId });

        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        return NextResponse.json(trip);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await request.json();
        
        await connectToDatabase();
        const updatedTrip = await Trip.findOneAndUpdate(
            { _id: id, userId },
            { $set: body },
            { new: true }
        );

        if (!updatedTrip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        return NextResponse.json(updatedTrip);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        await connectToDatabase();
        const deletedTrip = await Trip.findOneAndDelete({ _id: id, userId });

        if (!deletedTrip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
