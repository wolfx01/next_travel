import { NextRequest, NextResponse } from 'next/server';
import countriesData from '@/lib/data/countries.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const search = searchParams.get('search') || '';

  let filteredCountries = [...countriesData];
  
  // 1. Filter by Search Term
  if (search) {
      const lowerSearch = search.toLowerCase();
      filteredCountries = filteredCountries.filter((country: any) => 
          country.name.common.toLowerCase().includes(lowerSearch)
      );
  }

  // 2. Sort alphabetically
  const sortedCountries = filteredCountries.sort((a: any, b: any) => 
    a.name.common.localeCompare(b.name.common)
  );

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCountries = sortedCountries.slice(startIndex, endIndex);

  // Assign random ratings if missing
  paginatedCountries.forEach((country: any) => {
      if (!country.rating) {
          country.rating = (Math.random() * 2 + 3).toFixed(1);
      }
  });

  return NextResponse.json({
    countries: paginatedCountries,
    total: sortedCountries.length,
    hasMore: endIndex < sortedCountries.length
  });
}
