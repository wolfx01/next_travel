import { NextResponse } from 'next/server';
import { fetchImage, getRandomFallback } from '@/lib/imageFetcher';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country');

  if (!country) {
    return NextResponse.json({ error: "Country name is required" }, { status: 400 });
  }

  try {
    const imageUrl = await fetchImage(`${country} landscape nature`);
    if (imageUrl) {
      return NextResponse.json({ imageUrl });
    }
    return NextResponse.json({ imageUrl: getRandomFallback() });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
