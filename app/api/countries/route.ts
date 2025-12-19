import { NextRequest, NextResponse } from 'next/server';
import countriesData from '@/lib/data/countries.json';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);

  // Sort alphabetically first (consistent order is crucial for pagination)
  // Casting to any because JSON import might be inferred loosely
  const sortedCountries = [...countriesData].sort((a: any, b: any) => 
    a.name.common.localeCompare(b.name.common)
  );

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCountries = sortedCountries.slice(startIndex, endIndex);

  // Assign random ratings if missing (consistent seed would be better but this is simple migration)
  // Note: In a real app better store this in DB. For static JSON, we re-calculate per request 
  // which might cause rating jitter on refresh but OK for now.
  paginatedCountries.forEach((country: any) => {
      if (!country.rating) {
          country.rating = (Math.random() * 2 + 3).toFixed(1);
      }
  });

  return NextResponse.json({
    countries: paginatedCountries,
    total: countriesData.length,
    hasMore: endIndex < countriesData.length
  });
}
