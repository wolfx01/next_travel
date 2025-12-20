"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Places() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '100px' }}>Loading places...</div>}>
      <PlacesContent />
    </Suspense>
  );
}

function PlacesContent() {
  const [places, setPlaces] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('population');
  
  const searchParams = useSearchParams();
  const countryFilter = searchParams.get('country') || '';

  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastPlaceElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    setPlaces([]);
    setPage(1);
    setHasMore(true);
  }, [search, sort, countryFilter]);

  useEffect(() => {
    fetchPlaces();
  }, [page, search, sort, countryFilter]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '6',
        sort: sort,
        search: search,
        country: countryFilter
      });

      const response = await fetch(`/api/places?${query.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch places');
      
      const data = await response.json();
      
      setPlaces(prev => {
          // Prevent duplicates if page 1 is re-fetched
          if (page === 1) return data.places;
          return [...prev, ...data.places];
      });
      setHasMore(data.hasMore);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ marginTop: '0', padding: '0' }}>
      <div className="places-hero">
        <div className="hero-overlay"></div>
        <div className="places-hero-content">
            <h1>{countryFilter ? `Places in ${countryFilter}` : 'Explore Places'}</h1>
            <p>Find the best tourist attractions and hidden gems.</p>
        </div>
      </div>

      <div className="filters-container" style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search places..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '300px' }}
          />
        </div>
        <div className="sort-box">
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="population">Sort by Population</option>
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>
      </div>

      <div className="places-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {places.map((place, index) => {
          if (places.length === index + 1) {
            return <div ref={lastPlaceElementRef} key={place.id}><PlaceCard place={place} /></div>;
          } else {
            return <div key={place.id}><PlaceCard place={place} /></div>;
          }
        })}
      </div>
      
      {loading && <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading more places...</div>}
      {!hasMore && places.length > 0 && <div style={{ textAlign: 'center', marginTop: '20px' }}>No more places to load.</div>}
      {!loading && places.length === 0 && <div style={{ textAlign: 'center', marginTop: '20px' }}>No places found.</div>}
    </main>
  );
}

function PlaceCard({ place }: { place: any }) {
    const [image, setImage] = useState(place.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400');
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        fetch(`/api/city-image?city=${encodeURIComponent(place.name)}&country=${encodeURIComponent(place.country)}`)
            .then(res => res.json())
            .then(data => { 
                if(data.imageUrl) {
                    setImage(data.imageUrl);
                    setOpacity(0);
                    setTimeout(() => setOpacity(1), 50);
                }
            })
            .catch(e => console.error(e));
    }, [place.name, place.country]);

    return (
        <div className="place-card fade-in">
            <img 
                src={image} 
                alt={place.name} 
                className="place-image" 
                loading="lazy" 
                style={{ opacity: opacity, transition: 'opacity 0.5s' }}
            />
            <div className="place-info">
                <h3 className="place-name">{place.name}</h3>
                <div className="place-location">{place.country}</div> {/* Country code mainly, could be improved */}
                <div className="place-rating">
                    <span className="stars">★</span>
                    <span className="rating-text">({place.rating}/5)</span>
                </div>
                <Link href={`/places/${place.id}`} className="view-details-btn">View Details</Link>
            </div>
        </div>
    );
}
