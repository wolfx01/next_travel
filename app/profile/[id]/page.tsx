"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/app/styles/profile.css';
import ProfilePostsFeed from '@/components/Social/ProfilePostsFeed';
import FollowButton from '@/components/Social/FollowButton';
import { useParams } from 'next/navigation';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch Current User
    fetch('/api/auth/check-login')
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) setCurrentUser({ _id: data.mongoId });
      });

    if (!userId) return;

    fetch(`/api/users/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("User not found");
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <div className="loading-state">Loading Profile...</div>;
  if (error || !user) return <div className="error-state">{error || "User not found"}</div>;

  return (
    <main className="profile-container">
      {/* Cover Photo - Read Only */}
      <div className="cover-photo-container" style={{ backgroundImage: `url('${user.coverUrl || '/images/default_cover.png'}')` }}>
          <div className="cover-overlay"></div>
      </div>
      
      {/* Profile Content */}
      <div className="profile-content-wrapper">
          
          <div className="profile-header-card">
              <div className="avatar-wrapper">
                  <div className="profile-avatar-large">
                      <img src={user.avatarUrl || '/images/default_avatar.png'} alt="Profile" className="avatar-img" />
                  </div>
              </div>
              
              <div className="profile-info">
                  <div className="profile-name-row">
                    <h1>{user.userName}</h1>
                  </div>
                  
                  <div className="bio-section">
                      <div className="bio-display">
                          <p className="bio">"{user.bio || "No bio yet."}"</p>
                      </div>
                      
                      {/* Follow Button */}
                      {currentUser && user._id !== currentUser._id && (
                          <div style={{ marginTop: '15px' }}>
                              <FollowButton 
                                  targetUserId={user._id} 
                                  currentUserId={currentUser._id} 
                                  initialIsFollowing={user.stats.followersList?.includes(currentUser._id)} // Requires API update to send followers list or we assume false for now
                              />
                          </div>
                      )}
                  </div>
              </div>
          </div>

          <div className="profile-stats-grid">
              <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-heart"></i></div>
                  <h3>Saved Places</h3>
                  <div className="count">{user.stats?.savedPlaces || 0}</div>
              </div>
              <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-globe-americas"></i></div>
                  <h3>Visited</h3>
                  <div className="count">{user.stats?.visitedPlaces || 0}</div>
              </div>
              <div className="stat-card">
                  <div className="stat-icon"><i className="fas fa-users"></i></div>
                  <h3>Followers</h3>
                  <div className="count">{user.stats?.followers || 0}</div>
              </div>
          </div>

          <div className="profile-social-section" style={{ marginTop: '40px', width: '100%' }}>
            
            {/* Visited Places */}
            {user.visitedPlaces && user.visitedPlaces.length > 0 && (
                <>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                    <i className="fas fa-globe-americas" style={{ marginRight: '10px', color: '#27ae60' }}></i>
                    Travel Journey
                </h2>
                <div className="visited-places-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                    {user.visitedPlaces.map((p: any, i: number) => (
                        <Link href={`/places/${p.placeId}`} key={i} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ background: 'white', borderRadius: '10px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center', transition: 'transform 0.2s' }}>
                                <div style={{ fontSize: '2rem', color: '#27ae60', marginBottom: '10px' }}><i className="fas fa-map-marker-alt"></i></div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{p.placeName}</h4>
                                <small style={{ color: '#888' }}>{new Date(p.dateVisited).toLocaleDateString()}</small>
                            </div>
                        </Link>
                    ))}
                </div>
                </>
            )}

            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
                <i className="fas fa-feather-alt" style={{ marginRight: '10px', color: '#3498db' }}></i>
                Travel Stories
            </h2>
            
            <div className="profile-posts-feed">
                <ProfilePostsFeed userId={userId} />
            </div>
          </div>

      </div>
    </main>
  );
}
