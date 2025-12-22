import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Trip from '@/lib/models/Trip';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Fallback just in case

async function getUserIdFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken'); // Changed from 'token' to 'authToken'

    if (!token) return null;

    try {
        const decoded: any = jwt.verify(token.value, JWT_SECRET);
        return decoded.id; // Changed from 'userId' to 'id' matched check-login
    } catch (error) {
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const trips = await Trip.find({ userId }).sort({ startDate: 1 }); // Sort by upcoming

        return NextResponse.json(trips);
    } catch (error) {
        console.error("Error fetching trips:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { title, startDate, endDate, coverImage, budget } = body;

        if (!title || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const newTrip = await Trip.create({
            userId,
            title,
            startDate,
            endDate,
            coverImage, 
            budget,
            itinerary: []
        });

        return NextResponse.json(newTrip, { status: 201 });
    } catch (error) {
        console.error("Error creating trip:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
