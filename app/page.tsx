"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [topDestinations, setTopDestinations] = useState<any[]>([]);
  const [topPlaces, setTopPlaces] = useState<any[]>([]);

  useEffect(() => {
    fetchTopDestinations();
    fetchTopPlaces();
  }, []);

  const fetchTopDestinations = async () => {
    try {
      const response = await fetch('/api/countries');
      if (!response.ok) throw new Error('Failed to fetch countries');
      
      let data = await response.json();
      let countries = data.countries || []; // Handle paginated response
      countries.forEach((country: any) => {
          if (!country.rating) {
              country.rating = (Math.random() * 2 + 3).toFixed(1);
          }
      });
      const top = countries.sort((a: any, b: any) => parseFloat(b.rating) - parseFloat(a.rating)).slice(0, 6);
      setTopDestinations(top);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopPlaces = async () => {
    try {
      const response = await fetch('/api/places?limit=6&sort=rating');
      // Read text first to debug
      const text = await response.text();
      
      if (!response.ok) {
         console.error('Fetch failed:', response.status, text);
         throw new Error('Failed to fetch places');
      }

      console.log('API Response:', text.substring(0, 200)); // Log first 200 chars

      try {
        const data = JSON.parse(text);
        setTopPlaces(data.places);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        console.error('Received content:', text);
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main style={{ marginTop: '0', paddingTop: '0' }}> {/* Helper: styles/styhom.css might handle hero, but let's reset or ensure padding if needed. Actually styhom.css might expect 0. Let's check if hero video needs to be behind navbar or below. Usually below. If navbar is transparent (rgba(255, 255, 255, 0)), hero should be BEHIND it. */ }
      {/* Wait, if navbar is transparent, we WANT the hero to be behind it. 
          The previous issue was "overlap" meaning text was covered?
          The screenshot uploaded_image_4 showed "Top Destination :" is obscured by the navbar? 
          No, looking closely at uploaded_image_4:
          The navbar is grey/transparent. The "Top Destination" text is visible but "Loading top destinations..." is shifted?
          Actually, looking at uploaded_image_4, the "Travel" logo and navbar items are there. 
          The "Top Destination" header seems to be below the hero video?
          Ah, app/page.tsx has:
          <section className="hero"><video...></section>
          <h1 className="top">Top Destination :</h1>
          
          If the hero video is NOT showing up or is too small, or if the navbar has a solid background that covers it?
          In log.css (old), header had background-color: rgba(255, 255, 255, 0).
          In my extracted Navbar.css, I kept it.
          
          However, in uploaded_image_4, I see a grey bar across the top. "Travel" logo on left.
          The content "Top Destination" seems to be right below it? No, it looks like there's a big empty space or the video is missing/white?
          Actually, I don't see the video in the screenshot. I see a white background.
          Maybe the video path is wrong? `/video/1851190-uhd_3840_2160_25fps.mp4`
          
          If the video fails to load, the hero section might be 0 height?
          I should check `app/styles/styhom.css` to see `.hero` styles.
      */}
      <section className="hero">
        <video className="vid" autoPlay loop muted src="/video/1851190-uhd_3840_2160_25fps.mp4"></video>
        <p className="home-hero-text">Travel beyond borders <br /> live beyond limits </p>
      </section>

      <h1 className="top">
        <svg xmlns="http://www.w3.org/2000/svg" width="40px" viewBox="0 0 640 640"><path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z"/></svg> 
        Top Destination : 
      </h1>
      
      <div className="places-grid" id="top-destinations-grid">
        {topDestinations.length === 0 ? (
          <div style={{ textAlign: 'center', width: '100%', gridColumn: '1/-1' }}>Loading top destinations...</div>
        ) : (
          topDestinations.map((country, idx) => (
            <CountryCard key={idx} country={country} />
          ))
        )}
      </div>

      <h1 className="top">
        <svg xmlns="http://www.w3.org/2000/svg" width="40px" viewBox="0 0 640 640"><path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z"/></svg> 
        Top Places : 
      </h1>

      <div className="places-grid" id="top-places-grid">
         {topPlaces.length === 0 ? (
          <div style={{ textAlign: 'center', width: '100%', gridColumn: '1/-1' }}>Loading top places...</div>
        ) : (
          topPlaces.map((place, idx) => (
            <PlaceCard key={idx} place={place} />
          ))
        )}
      </div>

      <section className="why-choose-us">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Discover why thousands of travelers love our platform</p>
          <div className="features">
            <div className="feature-card">
              <i className="fa-solid fa-compass"></i>
              <h3>Smart Recommendations</h3>
              <p>Get personalized travel suggestions based on your interests and mood.</p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-star"></i>
              <h3>Trusted Reviews</h3>
              <p>Read authentic reviews and experiences shared by real travelers.</p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-earth-americas"></i>
              <h3>Global Coverage</h3>
              <p>Access detailed information about top destinations worldwide.</p>
            </div>
            <div className="feature-card">
              <i className="fa-solid fa-robot"></i>
              <h3>AI Travel Assistant</h3>
              <p>Ask anything — our AI assistant helps you plan your perfect trip.</p>
            </div>
          </div>
        </div>
      </section>
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

function PlaceCard({ place }: { place: any }) {
    const [image, setImage] = useState(place.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400');
    const [opacity, setOpacity] = useState(1);

    const getCountryName = (code: string) => {
        try {
            return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
        } catch (error) {
            return code;
        }
    };

    useEffect(() => {
        // Since we don't have place.country code to name mapping here easily without Intl, 
        // we'll rely on the API. But wait, place object from /api/places already has 'country' as code.
        // We'll trust the API to return country name if possible, or just send empty string.
        // Actually, let's just pass place.name for now or correct it if we can.
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
                <div className="place-location">
                     <i className="fa-solid fa-location-dot" style={{ marginRight: '8px', color: '#00bcd4' }}></i>
                    {getCountryName(place.country)}
                </div>
                <div className="place-rating">
                    <span className="stars">★</span>
                    <span className="rating-text">({place.rating}/5)</span>
                </div>
                <Link href={`/places/${place.id}`} className="view-details-btn">View Details</Link>
            </div>
        </div>
    );
}