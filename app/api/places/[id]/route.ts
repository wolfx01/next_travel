import { NextResponse } from 'next/server';
import curatedPlaces from '@/lib/data/places.json';
import connectToDatabase from '@/lib/db';
import PlaceDetails from '@/lib/models/PlaceDetails';

// Shared Interface (matches simple usage)
interface GeminiDetails {
  language: string;
  currency: string;
  description: string;
}

// ---------------------------------------------------------
// Helper: Normalize Data (Same logic as list/search API)
// ---------------------------------------------------------
const placesList = curatedPlaces as any[];
const processedCities = placesList.map((city: any, index: number) => ({
  ...city,
  id: city.id !== undefined ? city.id : index,
  population: city.population || 100000,
  country: city.country || 'Unknown'
}));

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

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
    
    // Check Curated List
    let city = processedCities.find((c: any) => c.id === id);

    // If not found, check all-the-cities
    if (!city) {
      try {
         // @ts-ignore
         const allCities = require('all-the-cities');
         // We might need to guess the index if the ID is purely based on array index from the other route?
         // In /api/places, we did: id = city.cityId || city.id || index;
         // But all-the-cities objects have 'cityId'.
         
         const found = allCities.find((c: any) => c.cityId === id || c.id === id);
         
         if (found) {
            city = {
                id: found.cityId || found.id,
                name: found.name,
                country: found.country,
                population: found.population || 0,
                loc: found.loc,
                // Default image for non-curated
                image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800' // Use high-res default
            };
         }
      } catch (err) {
         console.error("Failed to load all-the-cities in detail view:", err);
      }
    }

    if (!city) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }

    let countryName = city.country;
    try {
        if (city.countryCode) {
            countryName = regionNames.of(city.countryCode) || city.country;
        } else if (city.country && city.country.length === 2) {
            countryName = regionNames.of(city.country) || city.country;
        }
    } catch (e) {
        // Fallback to whatever string is in city.country
        console.warn(`Could not resolve country name for ${city.country}`);
    }

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

    // Fetch Rating from DB
    const dbDoc = await PlaceDetails.findOne({ placeName: city.name, country: countryName });

    const placeDetails = {
      id: city.id,
      name: city.name,
      country: city.country,
      countryName: countryName,
      city: city.name, // Ensure city field exists for frontend
      population: city.population,
      rating: dbDoc && dbDoc.averageRating ? dbDoc.averageRating : (city.rating || getStableRating(city.name)),
      image: city.image || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
      description: safeDetails?.description || city.description || `A beautiful city in ${countryName} with a population of ${city.population.toLocaleString()}.`,
      currency: safeDetails?.currency || "Unknown",
      language: safeDetails?.language || "Unknown",
      reviewCount: dbDoc ? dbDoc.reviewCount : 0
    };

    return NextResponse.json(placeDetails);

  } catch (error) {
    console.error("Error fetching place details:", error);
    return NextResponse.json({ error: "Failed to fetch place details" }, { status: 500 });
  }
}
