"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/profile.css';

interface UserData {
  userName: string;
  email: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // State for images
  const [coverImage, setCoverImage] = useState('/images/default_cover.png');
  const [avatarImage, setAvatarImage] = useState('/images/default_avatar.png');

  // Refs for file inputs
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user is logged in
    fetch('/api/auth/check-login')
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setUser({ userName: data.userName, email: data.email });
          if (data.avatarUrl) setAvatarImage(data.avatarUrl);
          if (data.coverUrl) setCoverImage(data.coverUrl);
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
          <button className="edit-cover-btn" onClick={handleCoverClick} aria-label="Edit Cover Photo">
              <i className="fas fa-camera"></i> Edit Cover
          </button>
      </div>
      
      {/* Profile Content (Overlapping) */}
      <div className="profile-content-wrapper">
          
          <div className="profile-header-section">
              <div className="avatar-wrapper">
                  <div className="profile-avatar-large">
                      <img src={avatarImage} alt="Profile" className="avatar-img" />
                  </div>
                  <button className="edit-avatar-btn" onClick={handleAvatarClick} aria-label="Edit Profile Picture">
                      <i className="fas fa-camera"></i>
                  </button>
              </div>
              
              <div className="profile-info">
                  <h1>{user.userName}</h1>
                  <p className="email">{user.email}</p>
                  <p className="bio">Travel enthusiast exploring the world one city at a time.</p>
              </div>
          </div>

          <div className="profile-stats-grid">
              <div className="stat-card">
                  <h3>Saved Places</h3>
                  <div className="count">0</div>
              </div>
              <div className="stat-card">
                  <h3>Reviews</h3>
                  <div className="count">0</div>
              </div>
              <div className="stat-card">
                  <h3>Countries</h3>
                  <div className="count">0</div>
              </div>
          </div>

      </div>
    </main>
  );
}
