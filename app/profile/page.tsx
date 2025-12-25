"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/profile.css';
import CreatePost from '@/components/Social/CreatePost';
import PostCard from '@/components/Social/PostCard';
import ProfilePostsFeed from '@/components/Social/ProfilePostsFeed';

interface UserData {
  mongoId: string; // Added for social features
  userName: string;
  email: string;
  bio?: string;
  savedPlacesCount?: number;
  visitedPlaces?: any[]; // Array of visited places objects
  currentLocation?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // State for images
  const [coverImage, setCoverImage] = useState('/images/default_cover.png');
  const [avatarImage, setAvatarImage] = useState('/images/default_avatar.png');

  // State for Bio Editing
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("Travel enthusiast exploring the world one city at a time.");
  const [locationText, setLocationText] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // Refs for file inputs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/check-login')
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setUser({ 
            mongoId: data.mongoId || data.userId || data._id, // Handle potential field names
            userName: data.userName, 
            email: data.email, 
            bio: data.bio, 
            savedPlacesCount: data.savedPlacesCount,
            visitedPlaces: data.visitedPlaces
          });
          if (data.avatarUrl) setAvatarImage(data.avatarUrl);
          if (data.coverUrl) setCoverImage(data.coverUrl);
          // Use nullish coalescing to allow empty strings but fall back to current/default if undefined
          if (data.bio !== undefined) setBioText(data.bio);
          if (data.currentLocation) setLocationText(data.currentLocation);
        } else {
          router.push('/login');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        router.push('/login');
      });
  }, [router]);

  const handleSaveBio = async () => {
      try {
          const res = await fetch('/api/user/update-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bio: bioText })
          });

          if (res.ok) {
              setIsEditingBio(false);
          } else {
              alert("Failed to save bio");
          }
      } catch (err) {
          console.error("Error saving bio", err);
          alert("Error saving bio");
      }
  };

  const handleSaveLocation = async () => {
      try {
          const res = await fetch('/api/user/update-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentLocation: locationText })
          });

          if (res.ok) {
              setIsEditingLocation(false);
          } else {
              alert("Failed to save location");
          }
      } catch (err) {
          console.error("Error saving location", err);
          alert("Error saving location");
      }
  };

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200; // Limit width to 1200px
          const scaleSize = MAX_WIDTH / img.width;
          const newWidth = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
          const newHeight = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

          canvas.width = newWidth;
          canvas.height = newHeight;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Compress to JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    const file = event.target.files?.[0];
    if (file) {
      // 1. Show preview immediately
      const imageUrl = URL.createObjectURL(file);
      if (type === 'cover') {
        setCoverImage(imageUrl);
      } else {
        setAvatarImage(imageUrl);
      }

      // 2. Compress and Save
      try {
          const compressedBase64 = await compressImage(file);
          console.log(`Uploading ${type} (Size: ${compressedBase64.length} chars)`);

          const res = await fetch('/api/user/update-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  [type === 'cover' ? 'coverUrl' : 'avatarUrl']: compressedBase64
              })
          });
          
          if (!res.ok) {
              console.error('Failed to save image');
              alert('Failed to save image. Please try a smaller file.');
          } else {
              console.log('Image saved successfully!');
          }
      } catch (err) {
          console.error('Error saving image:', err);
          alert('An error occurred while saving the image.');
      }
    }
  };

  if (loading) {
    return <div className="loading-state">Loading Profile...</div>;
  }

  if (!user) return null;

  return (
    <main className="profile-container">
      
      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={coverInputRef} 
        onChange={(e) => handleFileChange(e, 'cover')} 
        style={{ display: 'none' }} 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={(e) => handleFileChange(e, 'avatar')} 
        style={{ display: 'none' }} 
        accept="image/*"
      />

      {/* Cover Photo */}
      <div className="cover-photo-container" style={{ backgroundImage: `url('${coverImage}')` }}>
          <div className="cover-overlay"></div>
          <button className="edit-cover-btn" onClick={handleCoverClick} aria-label="Edit Cover Photo">
              <i className="fas fa-camera"></i> Edit Cover
          </button>
      </div>
      
      {/* Profile Content */}
      <div className="profile-content-wrapper">
          
          <div className="profile-header-card">
              <div className="avatar-wrapper">
                  <div className="profile-avatar-large">
                      <img src={avatarImage} alt="Profile" className="avatar-img" />
                  </div>
                  <button className="edit-avatar-btn" onClick={handleAvatarClick} aria-label="Edit Profile Picture">
                      <i className="fas fa-camera"></i>
                  </button>
              </div>
              
              <div className="profile-info">
                  <div className="profile-name-row">
                    <h1>{user.userName}</h1>
                  </div>
                  <p className="email"><i className="fas fa-envelope"></i> {user.email}</p>
                  
                   <div className="location-section" style={{ marginTop: '10px' }}>
                    {isEditingLocation ? (
                       <div className="bio-edit-container">
                          <input 
                              type="text"
                              value={locationText} 
                              onChange={(e) => setLocationText(e.target.value)}
                              className="bio-input"
                              placeholder="City or IATA code (e.g. NYC, LON)"
                              style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
                          />
                          <div className="bio-actions">
                              <button onClick={handleSaveLocation} className="save-bio-btn">Save</button>
                              <button onClick={() => setIsEditingLocation(false)} className="cancel-bio-btn">Cancel</button>
                          </div>
                       </div>
                    ) : (
                       <div className="bio-display">
                           <p className="location" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}>
                                <i className="fas fa-map-marker-alt" style={{ color: '#e74c3c' }}></i> 
                                {locationText || "Set your location"}
                           </p>
                           <button onClick={() => setIsEditingLocation(true)} className="edit-bio-btn" aria-label="Edit Location" style={{ marginLeft: '10px' }}>
                               <i className="fas fa-pen"></i>
                           </button>
                       </div>
                    )}
                  </div>
                  
                  <div className="bio-section">
                    {isEditingBio ? (
                      <div className="bio-edit-container">
                          <textarea 
                              value={bioText} 
                              onChange={(e) => setBioText(e.target.value)}
                              className="bio-input"
                              rows={3}
                          />
                          <div className="bio-actions">
                              <button onClick={handleSaveBio} className="save-bio-btn">Save Bio</button>
                              <button onClick={() => setIsEditingBio(false)} className="cancel-bio-btn">Cancel</button>
                          </div>
                      </div>
                    ) : (
                      <div className="bio-display">
                          <p className="bio">"{bioText}"</p>
                          <button onClick={() => setIsEditingBio(true)} className="edit-bio-btn" aria-label="Edit Bio">
                              <i className="fas fa-pen"></i> Edit Bio
                          </button>
                      </div>
                    )}
                  </div>
              </div>
          </div>

          <div className="profile-stats-grid">
              <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-heart"></i></div>
                  <h3>Saved Places</h3>
                  <div className="count">{user.savedPlacesCount || 0}</div>
              </div>
              <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-star"></i></div>
                  <h3>Reviews</h3>
                  <div className="count">0</div>
              </div>
              <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-globe"></i></div>
                  <h3>Countries</h3>
                  <div className="count">0</div>
              </div>
          </div>

          {/* Social Section on Profile */}
          <div className="profile-social-section" style={{ marginTop: '40px', width: '100%' }}>
            
            {/* My Travel Journey (Visited Places) */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <i className="fas fa-globe-americas" style={{ marginRight: '10px', color: '#27ae60' }}></i>
                My Travel Journey
            </h2>
            
            <div className="visited-places-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                {user.visitedPlaces && user.visitedPlaces.length > 0 ? (
                    user.visitedPlaces.map((p: any, i: number) => (
                        <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', color: '#27ae60', marginBottom: '10px' }}><i className="fas fa-map-marker-alt"></i></div>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{p.placeName}</h4>
                            <small style={{ color: '#888' }}>{new Date(p.dateVisited).toLocaleDateString()}</small>
                        </div>
                    ))
                ) : (
                    <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                        No places marked as visited yet. Go explore!
                    </p>
                )}
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <i className="fas fa-feather-alt" style={{ marginRight: '10px', color: '#3498db' }}></i>
                My Travel Stories
            </h2>
            
            {/* Create Post Widget */}
            <CreatePost user={{ ...user, _id: user.mongoId }} />

            {/* User Posts Feed */}
            <div className="profile-posts-feed">
                <ProfilePostsFeed userId={user.mongoId} isOwnProfile={true} />
            </div>
          </div>

      </div>
    </main>
  );
}


