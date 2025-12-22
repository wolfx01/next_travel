"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import '@/app/styles/hero.css';

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
  
  const [userSavedPlaces, setUserSavedPlaces] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    // Check login and get saved places
    fetch('/api/auth/check-login')
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                setIsLoggedIn(true);
                setUserSavedPlaces(data.savedPlaces || []);
            }
        })
        .catch(err => console.error(err));
  }, []);

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

  const handleToggleSave = async (placeId: string) => {
      if (!isLoggedIn) {
          alert("Please login to save places");
          return;
      }

      // Optimistic update
      const isSaved = userSavedPlaces.includes(placeId);
      let newSavedPlaces;
      if (isSaved) {
          newSavedPlaces = userSavedPlaces.filter(id => id !== placeId);
      } else {
          newSavedPlaces = [...userSavedPlaces, placeId];
      }
      setUserSavedPlaces(newSavedPlaces);

      try {
          const res = await fetch('/api/user/toggle-place', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ placeId })
          });
          if (!res.ok) {
              // Revert if failed
              setUserSavedPlaces(userSavedPlaces); 
              alert("Failed to save place");
          }
      } catch (err) {
          console.error(err);
          setUserSavedPlaces(userSavedPlaces);
      }
  };

  return (
    <main style={{ marginTop: '0', padding: '0' }}>
      <div className="premium-hero" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
            <h1 className="hero-title">{countryFilter ? `Treasures of ${countryFilter}` : 'Discover Hidden Gems'}</h1>
            <p className="hero-subtitle">From bustling cities to serene landscapes, find the perfect place for your next journey.</p>
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
        {loading && places.length === 0 && Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', height: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                 <div className="skeleton" style={{ width: '100%', height: '200px' }}></div>
                 <div style={{ padding: '15px' }}>
                     <div className="skeleton skeleton-text" style={{ width: '70%', height: '24px', marginBottom: '10px' }}></div>
                     <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                 </div>
             </div>
        ))}

        {places.map((place, index) => {
          const isSaved = userSavedPlaces.includes(place.id.toString());
          const key = place.id;
          const content = (
            <PlaceCard 
                place={place} 
                isSaved={isSaved} 
                onToggleSave={() => handleToggleSave(place.id.toString())} 
            />
          );

          if (places.length === index + 1) {
            return <div ref={lastPlaceElementRef} key={key}>{content}</div>;
          } else {
            return <div key={key}>{content}</div>;
          }
        })}
      </div>
      
      {loading && <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading more places...</div>}
      {!hasMore && places.length > 0 && <div style={{ textAlign: 'center', marginTop: '20px' }}>No more places to load.</div>}
      {!loading && places.length === 0 && <div style={{ textAlign: 'center', marginTop: '20px' }}>No places found.</div>}
    </main>
  );
}

function PlaceCard({ place, isSaved, onToggleSave }: { place: any, isSaved: boolean, onToggleSave: () => void }) {
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
        <div className="place-card fade-in" style={{ position: 'relative' }}>
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    onToggleSave();
                }}
                className="save-btn"
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255,255,255,0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '35px',
                    height: '35px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: isSaved ? '#e74c3c' : '#555',
                    transition: 'all 0.3s',
                    zIndex: 2
                }}
            >
                <i className={`${isSaved ? 'fas' : 'far'} fa-heart`}></i>
            </button>

            <img 
                src={image} 
                alt={place.name} 
                className="place-image" 
                loading="lazy" 
                style={{ opacity: opacity, transition: 'opacity 0.5s' }}
            />
            <div className="place-info">
                <h3 className="place-name">{place.name}</h3>
                <div className="place-location">{place.country}</div> 
                <div className="place-rating">
                    <span className="stars">★</span>
                    <span className="rating-text">({place.rating}/5)</span>
                </div>
                <Link href={`/places/${place.id}`} className="view-details-btn">View Details</Link>
            </div>
        </div>
    );
}
