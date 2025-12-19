import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const FALLBACK_IMAGES = [
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', 
      'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?w=400', 
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
  ];

  try {
     // Fetch from Unsplash if key exists
     if (process.env.UNSPLASH_ACCESS_KEY) {
         const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&orientation=portrait&client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
         
         if (unsplashRes.ok) {
             const data = await unsplashRes.json();
             if (data.results && data.results.length > 0) {
                 const images = data.results.map((img: any) => img.urls.regular);
                 return NextResponse.json({ images });
             }
         }
     }
     
     return NextResponse.json({ images: FALLBACK_IMAGES });

  } catch (error) {
    return NextResponse.json({ images: FALLBACK_IMAGES }); // Fallback on error
  }
}
