"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/app/styles/people.css';
import '@/app/styles/hero.css';
import FollowButton from '@/components/Social/FollowButton';

interface User {
  _id: string;
  userName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  visitedPlaces?: any[];
  followers?: string[];
}

export default function PeoplePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Check login
    fetch('/api/auth/check-login')
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) setCurrentUser({ _id: data.mongoId });
        });

    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
          setFilteredUsers(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredUsers(users);
    } else {
      const lower = search.toLowerCase();
      setFilteredUsers(users.filter(u => 
        u.userName.toLowerCase().includes(lower) || 
        (u.bio && u.bio.toLowerCase().includes(lower))
      ));
    }
  }, [search, users]);

  // if (loading) return <div ...> (Removed for Skeleton)

  return (
    <main className="people-container">
      <div className="premium-hero" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=2070&auto=format&fit=crop')", marginBottom: '60px' }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
            <h1 className="hero-title">Meet the Community</h1>
            <p className="hero-subtitle">Connect with fellow travelers, share stories, and get inspired by people from around the world.</p>
            
            <div className="hero-search-container">
                <input 
                    type="text" 
                    placeholder="Find travelers..." 
                    className="hero-search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      <div className="people-grid">
        {loading && Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="user-card skeleton-card">
                <div className="user-card-header" style={{ background: 'transparent' }}>
                    <div className="skeleton skeleton-avatar" style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', border: '4px solid white', zIndex: 1 }}></div>
                </div>
                <div className="user-card-body" style={{ marginTop: '50px', width: '100%' }}>
                    <div className="skeleton skeleton-text" style={{ height: '20px', width: '60%', margin: '0 auto 10px' }}></div>
                    <div className="skeleton skeleton-text" style={{ height: '14px', width: '80%', margin: '0 auto' }}></div>
                </div>
            </div>
        ))}

        {!loading && filteredUsers.map(user => (
          <div key={user._id} className="user-card" style={{ cursor: 'default' }}>
          <Link href={`/profile/${user._id}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
                className="user-card-header" 
                style={{ backgroundImage: `url('${user.coverUrl || '/images/default_cover.png'}')` }}
            >
                <img src={user.avatarUrl || '/images/default_avatar.png'} alt={user.userName} className="user-card-avatar" />
            </div>
            <div className="user-card-body">
                <h3>{user.userName}</h3>
                <p className="bio">{user.bio || "No bio yet."}</p>
                <div className="user-stats">
                    <div className="stat">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{user.visitedPlaces?.length || 0} Places</span>
                    </div>
                </div>
            </div>
          </Link>
            
          {/* Follow Button outside Link to prevent navigation when clicking button */}
          <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'center' }}>
            {currentUser && currentUser._id !== user._id && (
                <FollowButton 
                    targetUserId={user._id} 
                    currentUserId={currentUser._id} 
                    initialIsFollowing={user.followers?.includes(currentUser._id)}
                />
            )}
          </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', marginTop: '40px' }}>
                No travelers found matching your search.
            </p>
        )}
      </div>
    </main>
  );
}
