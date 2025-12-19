import { NextResponse } from 'next/server';
import { fetchImage, getRandomFallback } from '@/lib/imageFetcher';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const country = searchParams.get('country');

  if (!city) {
    return NextResponse.json({ error: "City name is required" }, { status: 400 });
  }

  try {
    const query = `${city} ${country || ''} landmark travel`;
    const imageUrl = await fetchImage(query);
    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    }
    return NextResponse.json({ imageUrl: getRandomFallback() });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
