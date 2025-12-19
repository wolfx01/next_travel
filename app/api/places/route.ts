import { NextResponse } from 'next/server';
import curatedPlaces from '@/lib/data/places.json';

// Lazy initialization variables
let isInitialized = false;
let processedCities: any[] = [];
let curatedPlacesMap = new Map();
let countryNameMap = new Map();

function initializeData() {
  if (isInitialized) return;

  try {
    console.log('Initializing places data...');
    
    // Assign IDs if missing and ensure consistent structure
    // Casting sanitizedPlaces to avoid type issues if json is strict
    const placesList = curatedPlaces as any[];

    processedCities = placesList.map((city: any, index: number) => ({
      ...city,
      id: city.id !== undefined ? city.id : index,
      population: city.population || 100000, 
      country: city.country || 'Unknown' 
    }));

    curatedPlacesMap = new Map(processedCities.map((p: any) => [p.name.toLowerCase(), p]));

    // Process Country Codes 
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const uniqueCountryCodes = [...new Set(processedCities.map((c: any) => c.country))];
    
    uniqueCountryCodes.forEach((code: any) => {
      try {
        if (code && code.length <= 3) {
           const name = regionNames.of(code);
           if (name) {
             countryNameMap.set(name.toLowerCase(), code);
           }
        }
      } catch (e) {
        // Ignore
      }
    });

    isInitialized = true;
    console.log('Places data initialized successfully from JSON import.');

  } catch (error) {
    console.error('Fatal error during initialization:', error);
    isInitialized = true; 
  }
}

export async function GET(request: Request) {
  try {
    // Ensure data is initialized
    initializeData();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const countryFilter = searchParams.get('country');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    const startIndex = (page - 1) * limit;
    let filteredCities = processedCities;

    // Filter by country
    if (countryFilter) {
      const countryCode = countryNameMap.get(countryFilter.toLowerCase());
      if (countryCode) {
        filteredCities = processedCities.filter((city: any) => city.country === countryCode);
      } else {
        filteredCities = [];
      }
    }

    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredCities = filteredCities.filter((city: any) => city.name.toLowerCase().includes(lowerSearch));
    }

    const populationThreshold = countryFilter ? 10000 : 100000;
    let bigCities = filteredCities.filter((city: any) => city.population > populationThreshold);

    function getStableRating(name: string) {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return ((Math.abs(hash) % 21) / 10 + 3).toFixed(1);
    }

    let mappedCities = bigCities.map((city: any) => {
      const curated = curatedPlacesMap.get(city.name.toLowerCase()) as any;
      return {
        ...city,
        rating: curated ? curated.rating : getStableRating(city.name),
        isCurated: !!curated,
        curatedData: curated,
      };
    });

    // Sort
    if (sort === 'name') {
      mappedCities.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else if (sort === 'rating') {
      mappedCities.sort((a: any, b: any) => parseFloat(b.rating) - parseFloat(a.rating));
    } else {
      // population
      mappedCities.sort((a: any, b: any) => b.population - a.population);
    }

    const paginatedCities = mappedCities.slice(startIndex, startIndex + limit);

    const places = paginatedCities.map((city: any) => {
      return {
        id: city.id,
        name: city.name,
        country: city.country,
        population: city.population,
        rating: city.rating,
        image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
        description: city.isCurated
          ? city.curatedData.description
          : `A beautiful city in ${city.country} with a population of ${city.population.toLocaleString()}.`,
      };
    });

    return NextResponse.json({
      places: places,
      total: bigCities.length,
      hasMore: startIndex + limit < bigCities.length,
    });

  } catch (error) {
    console.error('API Error in /api/places:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
