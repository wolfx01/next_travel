import { NextResponse } from 'next/server';
import curatedPlaces from '@/lib/data/places.json';

// Lazy initialization variables
let isInitialized = false;
let processedCities: any[] = [];
let curatedPlacesMap = new Map();
let countryNameMap = new Map();
let debugStats: any = {};

function initializeData() {
  if (isInitialized) return;

  try {
    console.log('Initializing places data...');

    // 1. Index Curated Places
    curatedPlaces.forEach((place: any) => {
        curatedPlacesMap.set(place.name.toLowerCase(), place);
    });

    // 2. Process All Cities
    let allCities = [];
    try {
        // @ts-ignore
        allCities = require('all-the-cities');
    } catch (err) {
        console.error("Failed to load all-the-cities:", err);
        allCities = [];
    }

    // Capture stats for debugging
    debugStats = {
        rawLength: allCities.length,
        hasAFInList: allCities.some((c:any) => c.country === 'AF'),
        sampleCity: allCities.length > 0 ? allCities[0] : null
    };

    // Filter for reasonably sized cities to keep memory usage sane
    // const relevantCities = allCities.filter((city: any) => city.population > 15000);
    const relevantCities = allCities; // DEBUG: NO FILTER

    // If all-the-cities failed, we should at least populate with curatedPlaces to avoid total blank
    const sourceCities = relevantCities.length > 0 ? relevantCities : curatedPlaces;

    processedCities = sourceCities.map((city: any, index: number) => {
        // Handle different structures
        const name = city.name;
        // Prefer countryCode (places.json) or country (all-the-cities ISO)
        const countryCode = city.countryCode || city.country || 'Unknown';
        const population = city.population || 0; 
        const id = city.cityId || city.id || index;
        
        return {
            id, 
            name,
            country: countryCode, // Internal ISO code
            population,
            loc: city.loc,
            curatedData: curatedPlacesMap.get(name.toLowerCase())
        };
    });

    // 3. Build Country Name Map (Full Name -> ISO Code)
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
        // Ignore invalid codes
      }
    });

    isInitialized = true;
    console.log(`Places data initialized. Loaded ${processedCities.length} cities.`);

  } catch (error) {
    console.error('Fatal error during initialization:', error);
    isInitialized = true; 
  }
}

export async function GET(request: Request) {
  try {
    initializeData();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const countryFilter = searchParams.get('country');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    // --- Filtering ---
    let filteredCities = processedCities;

    // 1. Country Filter
    if (countryFilter) {
      const lowerCountryFilter = countryFilter.toLowerCase();
      // Try to get code from map, or assume it might be a code
      let countryCode = countryNameMap.get(lowerCountryFilter);
      
      // Fallback: maybe user passed "US" directly?
      if (!countryCode && countryFilter.length === 2) {
          countryCode = countryFilter.toUpperCase();
      }

      if (countryCode) {
        filteredCities = filteredCities.filter((city: any) => city.country === countryCode);
      } else {
        filteredCities = []; 
      }
    }

    // 2. Search Filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredCities = filteredCities.filter((city: any) => city.name.toLowerCase().includes(lowerSearch));
    }

    // --- Sorting ---
    let resultList = [...filteredCities];

    if (sort === 'name') {
      resultList.sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else if (sort === 'rating') {
       resultList.sort((a: any, b: any) => {
           const ratingA = a.curatedData ? a.curatedData.rating : (a.population > 1000000 ? 4.5 : 3.5);
           const ratingB = b.curatedData ? b.curatedData.rating : (b.population > 1000000 ? 4.5 : 3.5);
           return ratingB - ratingA;
       });
    } else {
      // Default: Population
      resultList.sort((a: any, b: any) => b.population - a.population);
    }

    // --- Pagination ---
    const startIndex = (page - 1) * limit;
    const paginatedCities = resultList.slice(startIndex, startIndex + limit);

    // --- Formatting Response ---
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    const places = paginatedCities.map((city: any) => {
      const curated = city.curatedData;
      
      // Resolve full country name for display
      let countryDisplay = city.country;
      try {
          countryDisplay = regionNames.of(city.country) || city.country;
      } catch (e) {}

      function getStableRating(name: string) {
          let hash = 0;
          for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
          return ((Math.abs(hash) % 20) / 10 + 3).toFixed(1); 
      }

      return {
        id: city.id,
        name: city.name,
        country: countryDisplay, // Send Full Name to Frontend
        population: city.population,
        rating: curated ? curated.rating : getStableRating(city.name),
        image: curated?.image || 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400',
        description: curated
          ? curated.description
          : `A beautiful city in ${countryDisplay} with a population of ${city.population?.toLocaleString() || 'unknown'}.`,
      };
    });

    return NextResponse.json({
      places: places,
      total: resultList.length,
      hasMore: startIndex + limit < resultList.length,
      debug: {
          rawLength: debugStats.rawLength,
          processedCount: processedCities.length,
          filter: countryFilter,
          resolvedCode: countryFilter ? countryNameMap.get(countryFilter.toLowerCase()) : 'N/A',
          mapHasAfghanistan: countryNameMap.has('afghanistan'),
          hasAFInList: debugStats.hasAFInList,
          sampleCity: debugStats.sampleCity
      }
    });

  } catch (error) {
    console.error('API Error in /api/places:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
  }
}
