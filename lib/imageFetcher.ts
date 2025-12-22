const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400', 
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400', 
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400', 
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400', 
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400', 
  'https://images.unsplash.com/photo-1499856871940-a09627c6dcf6?w=400', 
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', 
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=400', 
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400', 
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400'
];

let rateLimitResetTime = 0;

export function getRandomFallback() {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
}

async function fetchFromUnsplash(query: string) {
  if (!process.env.UNSPLASH_ACCESS_KEY) return null;
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1&client_id=${process.env.UNSPLASH_ACCESS_KEY}`);
    if (response.status === 403) {
        rateLimitResetTime = Date.now() + 60 * 60 * 1000;
        return null;
    }
    if (!response.ok) return null;
    const data = await response.json();
    return data.results && data.results.length > 0 ? data.results[0].urls.regular : null;
  } catch {
    return null;
  }
}

async function fetchFromPexels(query: string) {
  if (!process.env.PEXELS_API_KEY) return null;
  try {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
      headers: { Authorization: process.env.PEXELS_API_KEY! }
    });
    if (response.status === 429) return null;
    if (!response.ok) return null;
    const data = await response.json();
    return data.photos && data.photos.length > 0 ? data.photos[0].src.large : null;
  } catch {
    return null;
  }
}

async function fetchFromPixabay(query: string) {
  if (!process.env.PIXABAY_API_KEY) return null;
  try {
    const response = await fetch(`https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=3`);
    if (response.status === 429) return null;
    if (!response.ok) return null;
    const data = await response.json();
    return data.hits && data.hits.length > 0 ? data.hits[0].largeImageURL : null;
  } catch {
    return null;
  }
}

export async function fetchImage(query: string) {
  const unsplashAvailable = Date.now() > rateLimitResetTime;
  
  let providers = ['pexels', 'pixabay'];
  if (unsplashAvailable) providers.push('unsplash');
  
  providers = providers.sort(() => Math.random() - 0.5);

  for (const provider of providers) {
    let imageUrl = null;
    if (provider === 'unsplash') imageUrl = await fetchFromUnsplash(query);
    else if (provider === 'pexels') imageUrl = await fetchFromPexels(query);
    else if (provider === 'pixabay') imageUrl = await fetchFromPixabay(query);

    if (imageUrl) return imageUrl;
  }

  return null;
}
