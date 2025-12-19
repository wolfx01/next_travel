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
  const [userName, setUserName] = useState(""); // We might get this from context or local storage
  
  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  useEffect(() => {
    // Get user from local storage (legacy compatibility) or API
    const storedUser = localStorage.getItem('userName');
    if (storedUser) setUserName(storedUser);

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
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '10px', textAlign: 'center' }}>
                 <p>Find the best flights to {place.name}</p>
                 <a href={`https://www.aviasales.com/search?origin=MAD&destination=${place.name}`} target="_blank" rel="noopener noreferrer" style={{
                     display: 'inline-block', padding: '10px 20px', background: '#32a8dd', color: 'white', textDecoration: 'none', borderRadius: '5px', marginTop: '10px'
                 }}>
                    Search Flights
                 </a>
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
