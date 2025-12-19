import { NextResponse } from 'next/server';
import cities from 'all-the-cities';
import connectToDatabase from '@/lib/db';
import PlaceDetails from '@/lib/models/PlaceDetails';
import path from 'path';
import fs from 'fs';

// Helper: Assign stable ID
cities.forEach((city: any, index: number) => {
  city.id = index;
});

// Load curated places
const placesPath = path.join(process.cwd(), 'lib/data/places.json');
const curatedPlaces = JSON.parse(fs.readFileSync(placesPath, 'utf8'));
const curatedPlacesMap = new Map(curatedPlaces.map((p: any) => [p.name.toLowerCase(), p]));

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

interface GeminiDetails {
  language: string;
  currency: string;
  description: string;
}

async function fetchPlaceDetailsFromGemini(city: string, country: string): Promise<GeminiDetails | { error: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "Missing API Key" };
  }

  // 1. Check MongoDB Cache
  try {
    const cachedDoc = await PlaceDetails.findOne({ placeName: city, country: country });
    if (cachedDoc) {
      return {
        description: cachedDoc.description || "",
        currency: cachedDoc.currency || "",
        language: cachedDoc.language || "",
      };
    }
  } catch (dbError) {
    console.error("DB Cache Read Error:", dbError);
  }

  // 2. Fetch from Gemini
  try {
    const prompt = `Provide the following details for ${city}, ${country} in JSON format:
    {
      "language": "The primary language spoken",
      "currency": "The currency used (e.g. Euro, USD)",
      "description": "A captivating 2-sentence travel description"
    }
    Only return the JSON object, no markdown.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const details = JSON.parse(jsonStr) as GeminiDetails;

    // 3. Save to MongoDB
    try {
      await PlaceDetails.findOneAndUpdate(
        { placeName: city, country: country },
        {
          placeName: city,
          country: country,
          description: details.description,
          currency: details.currency,
          language: details.language,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
    } catch (saveError) {
      console.error("DB Save Error:", saveError);
    }

    return details;

  } catch (error: any) {
    console.error("Gemini Fetch Error:", error);
    return { error: `Exception: ${error.message}` };
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const city = cities[id];

    if (!city) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    const curated = curatedPlacesMap.get(city.name.toLowerCase()) as any;
    const countryName = regionNames.of(city.country) || city.country;

    // Helper for stable random ratings
    function getStableRating(name: string) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return ((Math.abs(hash) % 21) / 10 + 3).toFixed(1);
    }

    // Fetch dynamic details
    const geminiDetails = await fetchPlaceDetailsFromGemini(city.name, countryName);
    const hasError = 'error' in geminiDetails;
    const safeDetails = !hasError ? (geminiDetails as GeminiDetails) : null;

    const placeDetails = {
      id: id,
      name: city.name,
      country: city.country,
      countryName: countryName,
      population: city.population,
      rating: curated ? curated.rating : getStableRating(city.name),
      image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
      description: safeDetails?.description || (curated ? curated.description : `A beautiful city in ${countryName} with a population of ${city.population.toLocaleString()}.`),
      currency: safeDetails?.currency || "Unknown",
      language: safeDetails?.language || "Unknown"
    };

    return NextResponse.json(placeDetails);

  } catch (error) {
    console.error("Error fetching place details:", error);
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 });
  }
}
