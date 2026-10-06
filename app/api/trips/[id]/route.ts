import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Trip from '@/lib/models/Trip';
import { getSessionUserId as getUserIdFromToken } from '@/lib/auth';

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
        const allowed = ["title", "startDate", "endDate", "coverImage", "budget", "itinerary"];
        const update = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
        
        await connectToDatabase();
        const updatedTrip = await Trip.findOneAndUpdate(
            { _id: id, userId },
            { $set: update },
            { new: true, runValidators: true }
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
