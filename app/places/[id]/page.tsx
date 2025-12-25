"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PlaceDetails() {
  const params = useParams();
  const id = params.id as string;
  
  const [place, setPlace] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(""); // MongoID for API calls
  const [userLocation, setUserLocation] = useState("");
  const [isVisited, setIsVisited] = useState(false);
  
  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  useEffect(() => {
    // Check login status to get full user details including ID
    fetch('/api/auth/check-login')
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                setUserName(data.userName);
                setUserId(data.mongoId || data.userId || data._id);
                if (data.currentLocation) setUserLocation(data.currentLocation);
                // Check if already visited in local state or fetch from API (optional enhancement)
                if (data.savedPlaces && data.savedPlaces.some((p: any) => p === id)) {
                    // Logic for saved places if needed
                }
            }
        });

    fetchPlaceDetails();
    fetchComments();
  }, [id]);

  useEffect(() => {
    if (place) {
      fetchGallery(place.name, place.countryName);
    }
  }, [place]);

  const fetchPlaceDetails = async () => {
    try {
      const res = await fetch(`/api/places/${id}`);
      if (!res.ok) throw new Error('Place not found');
      const data = await res.json();
      setPlace(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGallery = async (city: string, country: string) => {
    try {
      const query = `${city} ${country} landmark`;
      const res = await fetch(`/api/place-gallery?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.images) setGalleryImages(data.images);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName) {
      alert("Please log in to add a comment");
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: id,
          userName: userName,
          text: commentText
        })
      });
      
      if (res.ok) {
        setCommentText("");
        fetchComments(); // Refresh comments
      } else {
        alert("Failed to post comment");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleVisited = async () => {
      if (!userId) {
          alert("Please log in to mark place as visited");
          return;
      }

      try {
          const res = await fetch('/api/user/visited', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userId: userId,
                  placeId: id,
                  placeName: place.name
              })
          });

          if (res.ok) {
              setIsVisited(true);
              alert("Marked as visited! Added to your Travel Journey.");
          } else {
              const data = await res.json();
              if (data.message === "Already visited") {
                  setIsVisited(true);
                  alert("You have already visited this place!");
              } else {
                  alert("Something went wrong");
              }
          }
      } catch (error) {
          console.error(error);
      }
  };

  // Helper helper to dynamic image
  const [mainImage, setMainImage] = useState<string>('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200'); // Initialize with default

  useEffect(() => {
    if (place) {
      if (place.image) setMainImage(place.image);
      
      // Dynamic fetch
      fetch(`/api/city-image?city=${encodeURIComponent(place.name)}&country=${encodeURIComponent(place.countryName)}`)
          .then(res => res.json())
          .then(data => { if (data.imageUrl) setMainImage(data.imageUrl); })
          .catch(e => console.error(e));
    }
  }, [place]);

  if (loading) return <div style={{ marginTop: '100px', textAlign: 'center', fontSize: '1.5rem', color: '#666' }}>Loading details...</div>;
  if (!place) return <div style={{ marginTop: '100px', textAlign: 'center', fontSize: '1.5rem', color: '#666' }}>Place not found.</div>;

    return (
    <main className="place-details-container">
        <section className="hero-place">
            <img src={mainImage} alt={place.name} className="hero-image" />
            <div className="hero-text">
                <h1>{place.name}, {place.countryName}</h1>
                <p><i className="fas fa-map-marker-alt"></i> {place.city || place.name}, {place.countryName}</p>
                <button 
                    onClick={handleVisited}
                    style={{
                        marginTop: '15px',
                        padding: '10px 20px',
                        background: isVisited ? '#4caf50' : 'rgba(255,255,255,0.2)',
                        border: '2px solid white',
                        color: 'white',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        backdropFilter: 'blur(5px)',
                        transition: 'all 0.3s'
                    }}
                >
                    <i className={`fas ${isVisited ? 'fa-check-circle' : 'fa-map-pin'}`}></i> {isVisited ? 'Visited' : 'I Was Here'}
                </button>
            </div>
        </section>

        <section className="place-info-section">
            <div className="place-description">
                <h2>About</h2>
                <p>{place.description}</p>
            </div>

            <div className="place-meta">
                <h3>Details</h3>
                <ul>
                    <li><strong>Population:</strong> {place.population.toLocaleString()}</li>
                    <li><strong>Language:</strong> {place.language}</li>
                    <li><strong>Currency:</strong> {place.currency}</li>
                    <li><strong>Rating:</strong> <span style={{color: '#f1c40f'}}>★ {place.rating}</span></li>
                </ul>
            </div>
        </section>

        <section className="booking-section">
            <h2>Book Your Trip</h2>
            <div id="aviasales_container" style={{ minHeight: '100px', display: 'flex', justifyContent: 'center' }}>
                 <AviasalesSearchWidget destination={place.name} defaultOrigin={userLocation} />
            </div>
        </section>

        <section className="gallery-section">
            <h2>Gallery</h2>
            <div className="gallery-grid">
                <div className="gallery-track">
                    {/* Render images twice for continuous scroll effect */}
                    {galleryImages.length > 0 ? (
                        <>
                            {galleryImages.map((img, i) => (
                                <img key={`g1-${i}`} src={img} alt={`${place.name} ${i+1}`} loading="lazy" />
                            ))}
                            {galleryImages.map((img, i) => (
                                <img key={`g2-${i}`} src={img} alt={`${place.name} ${i+1} duplicate`} loading="lazy" aria-hidden="true" />
                            ))}
                        </>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', width: '100%' }}>Loading gallery...</div>
                    )}
                </div>
            </div>
        </section>

        <section className="reviews-section">
            <h2>Reviews & Comments</h2>
            
            <div className="comment-form-container">
                <h3>Leave a Comment</h3>
                <form id="commentForm" onSubmit={handleCommentSubmit}>
                    <div className="input-wrapper">
                        <textarea 
                           id="commentText" 
                           placeholder="Share your experience..." 
                           required
                           value={commentText}
                           onChange={(e) => setCommentText(e.target.value)}
                        ></textarea>
                        <button type="submit" className="icon-btn" disabled={!commentText.trim()}><i className="fas fa-paper-plane"></i></button>
                    </div>
                    {!userName && <p style={{fontSize: '0.8rem', color: 'red', marginTop: '5px'}}>Please log in to comment</p>}
                </form>
            </div>

        <div id="comments-list">
             {comments.length === 0 ? <p style={{textAlign: 'center', color: '#666'}}>No comments yet. Be the first to share your experience!</p> : (
                 comments.map((comment, i) => (
                     <div key={i} className="review-card">
                         <div className="review-header">
                             <div className="avatar">
                                {comment.userName.charAt(0).toUpperCase()}
                             </div>
                             <div className="author-info">
                                 <h4>{comment.userName} <span className="verified-badge"><i className="fas fa-check-circle"></i></span></h4>
                                 <small>{new Date(comment.date).toLocaleDateString()}</small>
                             </div>
                         </div>
                         <div className="review-body">
                            <p className="review-text">{comment.text}</p>
                         </div>
                     </div>
                 ))
             )}
        </div>
        </section>

        <section className="map-section">
            <h2>Location</h2>
            <div className="map-container">
                 <iframe 
                    width="100%" 
                    height="400" 
                    frameBorder="0" 
                    style={{ border: 0 }} 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(place.name + "," + place.countryName)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                 ></iframe>
            </div>
        </section>

    </main>
  );
}

function DynamicMainImage({ city, country }: { city: string, country: string }) {
    useEffect(() => {
        fetch(`/api/city-image?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`)
            .then(res => res.json())
            .then(data => {
                if (data.imageUrl) {
                    const img = document.getElementById('mainImage') as HTMLImageElement;
                    if (img) img.src = data.imageUrl;
                }
            })
            .catch(e => console.error(e));
    }, [city, country]);
    return null;
}

function AviasalesSearchWidget({ destination, defaultOrigin }: { destination: string, defaultOrigin?: string }) {
    const [origin, setOrigin] = useState(defaultOrigin || 'LON');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (defaultOrigin) setOrigin(defaultOrigin);
    }, [defaultOrigin]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Construct deep link
        const url = `https://www.aviasales.com/search?origin=${origin}&destination=${destination}&depart_date=${date}`;
        window.open(url, '_blank');
    };

    return (
        <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '800px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#32a8dd', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#32a8dd' }}>aviasales</span>
                </div>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>Cheap flights and airline tickets</span>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginBottom: '4px' }}>Origin</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', background: '#fff' }}>
                        <input 
                            type="text" 
                            value={origin} 
                            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', fontWeight: 500 }}
                        />
                        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>IATA</span>
                    </div>
                </div>

                <div style={{ flex: '1 1 200px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginBottom: '4px' }}>Destination</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', background: '#f5f5f5' }}>
                        <input 
                            type="text" 
                            value={destination} 
                            readOnly
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', fontWeight: 500, background: 'transparent', color: '#333' }}
                        />
                    </div>
                </div>

                <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginBottom: '4px' }}>Depart Date</label>
                    <div style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '10px', background: '#fff' }}>
                         <input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
                    <button type="submit" style={{
                        background: '#0fb8eb',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        height: '46px',
                        boxShadow: '0 2px 8px rgba(15, 184, 235, 0.3)'
                    }}>
                        Search
                    </button>
                </div>
            </form>
             <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#555', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ accentColor: '#0fb8eb' }} /> Show hotels
                </label>
            </div>
        </div>
    );
}
