"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

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
    <main style={{ marginTop: '0', paddingTop: '0' }}> 
      <div className="countries-hero">
        <div className="hero-overlay"></div>
        <div className="countries-hero-content">
            <h1>Explore Countries</h1>
            <p>Discover exciting destinations and rich cultures across the globe.</p>
            
            <div className="search-container" style={{ marginTop: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search countries..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '12px 20px',
                        fontSize: '1rem',
                        borderRadius: '30px',
                        border: 'none',
                        width: '100%',
                        maxWidth: '500px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        outline: 'none'
                    }}
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
