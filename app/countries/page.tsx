"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import '@/app/styles/hero.css';

export default function Countries() {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastCountryElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); // Reset to page 1 for new search
      setCountries([]); // Clear existing list
      fetchCountries(1, searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle pagination (only if scanning more pages of same search)
  useEffect(() => {
    if (page > 1) {
        fetchCountries(page, searchTerm);
    }
  }, [page]);

  const fetchCountries = async (pageNum: number, search: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/countries?page=${pageNum}&limit=12&search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      
      let data = await response.json();
      
      setCountries(prev => {
        if (pageNum === 1) return data.countries;
        // Basic deduplication check based on name
        const existingNames = new Set(prev.map(c => c.name.common));
        const newCountries = data.countries.filter((c: any) => !existingNames.has(c.name.common));
        return [...prev, ...newCountries];
      });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <main className="countries-main" style={{ marginTop: '0', paddingTop: '0' }}> 
      <div className="premium-hero" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')" }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
            <h1 className="hero-title">Explore the World</h1>
            <p className="hero-subtitle">Discover breathtaking destinations, vibrant cultures, and unforgettable adventures waiting for you.</p>
            
            <div className="hero-search-container">
                <input 
                    type="text" 
                    placeholder="Search for a country..." 
                    className="hero-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>
      <div className="countries-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {loading && countries.length === 0 && Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="country-card" style={{ height: '400px' }}>
                 <div className="skeleton" style={{ width: '100%', height: '200px' }}></div>
                 <div style={{ padding: '20px' }}>
                     <div className="skeleton skeleton-text" style={{ width: '60%', height: '28px', marginBottom: '15px' }}></div>
                     <div className="skeleton skeleton-text"></div>
                     <div className="skeleton skeleton-text"></div>
                     <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                 </div>
             </div>
        ))}

        {countries.map((country, idx) => {
            if (countries.length === idx + 1) {
                return (
                    <div ref={lastCountryElementRef} key={idx} className="country-card-wrapper">
                        <CountryCard country={country} />
                    </div>
                );
            } else {
                return <CountryCard key={idx} country={country} />;
            }
        })}
      </div>
      
      {loading && <div style={{ textAlign: 'center', margin: '20px' }}>Loading more countries...</div>}
      {!hasMore && countries.length > 0 && <div style={{ textAlign: 'center', margin: '20px' }}>No more countries to load.</div>}
    </main>
  );
}

function CountryCard({ country }: { country: any }) {
    const [image, setImage] = useState('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400');
    
    useEffect(() => {
        fetch(`/api/country-image?country=${encodeURIComponent(country.name.common)}`)
            .then(res => res.json())
            .then(data => { if(data.imageUrl) setImage(data.imageUrl); })
            .catch(e => console.error(e));
    }, [country.name.common]);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="country-card fade-in">
            <div className="country-image-container">
                <img src={image} alt={country.name.common} className="country-image" loading="lazy" />
            </div>
            <div className="country-info">
                <h3 className="country-name">{country.name.common}</h3>
                <div className="country-capital">Capital: {country.capital ? country.capital[0] : 'N/A'}</div>
                <div className="country-stats">
                    <div className="stat">
                        <div className="stat-label">Population</div>
                        <div className="stat-value">{formatNumber(country.population)}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-label">Area</div>
                        <div className="stat-value">{country.area ? formatNumber(country.area) + ' km²' : 'N/A'}</div>
                    </div>
                </div>
                <div className="country-rating" style={{ marginTop: '10px', color: '#f1c40f' }}>
                    <span className="stars">★</span>
                    <span className="rating-text">({country.rating}/5)</span>
                </div>
                <p className="country-description">Discover the beauty and culture of {country.name.common}.</p>
                <Link href={`/places?country=${encodeURIComponent(country.name.common)}`} className="explore-btn" style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                    Explore {country.name.common}
                </Link>
            </div>
        </div>
    );
}
