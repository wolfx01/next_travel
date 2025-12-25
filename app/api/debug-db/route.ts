import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import PlaceDetails from '@/lib/models/PlaceDetails';

export async function GET() {
    await connectToDatabase();
    const details = await PlaceDetails.find({});
    return NextResponse.json({ count: details.length, details });
}
