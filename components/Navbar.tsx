"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import NotificationDropdown from './Social/NotificationDropdown';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; initial: string; _id: string; isAdmin: boolean } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    checkLoginStatus();
  }, [pathname]);

  const checkLoginStatus = async () => {
    try {
      const res = await fetch('/api/auth/check-login');
      const data = await res.json();
      if (data.loggedIn && data.userName) {
        setUser({ 
          name: data.userName, 
          initial: data.userName.charAt(0).toUpperCase(),
          _id: data.mongoId,
          isAdmin: data.isAdmin
        });
      }
    } catch (error) {
      console.error("Auth check failed", error);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.reload();
  };

  return (
    <header className={['/', '/countries', '/places', '/people'].includes(pathname) || pathname.startsWith('/places/') || pathname.startsWith('/profile/') ? 'home-nav' : ''}>
      <div id="divlogo">
        <Link href="/">
          <img src="/images/Travel.png" alt="Travel Logo" id="logo" style={{ cursor: 'pointer' }} />
        </Link>
      </div>
      
      <div id="button" className={isOpen ? 'active' : ''}>
        {/* Close Button for Sidebar */}
        <div className="close-btn" onClick={() => setIsOpen(false)}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </div>

        <Link href="/" className={`a ${pathname === '/' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
        </Link>
        <Link href="/countries" className={`a ${pathname === '/countries' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Countries
        </Link>
        <Link href="/places" className={`a ${pathname === '/places' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
            Places
        </Link>

        <Link href="/people" className={`a ${pathname === '/people' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            People
        </Link>
        <Link href="/chat" className={`a ${pathname === '/chat' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Chat
        </Link>
        {user?.isAdmin && (
            <Link href="/admin" className={`a ${pathname.startsWith('/admin') ? 'active' : ''}`} style={{ color: '#e74c3c' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Admin
            </Link>
        )}
        <Link href="/about" className={`a ${pathname === '/about' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '10px'}}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            About
        </Link>
        
        {/* Mobile Auth (Hidden on Desktop) */}
        <div className="mobile-auth">
          {!user ? (
            <div className="auth-links">
                <Link href="/login" className="alogin">Log in</Link>
                <Link href="/register" className="alogin">Sign Up</Link>
            </div>
          ) : (
            <>
              {/* Logout Button directly in mobile-auth */}
              <a href="#" className="logout-btn mobile-logout" onClick={handleLogout}>Logout</a>
            </>
          )}
        </div>
      </div>

      <div className="nav-controls">
        {/* Desktop Auth (Hidden on Mobile) */}
        <div className="desktop-auth" id="login">
          {!user ? (
            <>
              <div className="logdiv">
                <Link href="/login" className="alogin" id="log">Log in</Link>
              </div>
              <div className="logdiv" id="sin">
                <Link href="/register" className="alogin">Sign Up</Link>
              </div>
            </>
          ) : (
            <div className="logdiv" id="userInitial" style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
              {/* Notification Dropdown */}
              <NotificationDropdown userId={user._id} />

              {/* Profile Dropdown Trigger */}
              <div 
                className="profile-dropdown-trigger" 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span id="initialCircle">{user.initial}</span>
                <i className={`fas fa-chevron-down ${isProfileMenuOpen ? 'rotate-180' : ''}`} style={{ fontSize: '0.8rem', color: '#333', transition: 'transform 0.2s' }}></i>
              </div>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="profile-dropdown-menu">
                    <div className="dropdown-header">
                        <p className="user-name">{user.name}</p>
                        <p className="user-role">{user.isAdmin ? 'Administrator' : 'Explorer'}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link href="/profile" className="dropdown-item" onClick={() => setIsProfileMenuOpen(false)}>
                        <i className="fas fa-user"></i> My Profile
                    </Link>
                    <Link href="/settings" className="dropdown-item" onClick={() => setIsProfileMenuOpen(false)}>
                        <i className="fas fa-cog"></i> Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="dropdown-item logout" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Initial (Visible on Mobile Only) */}
        {user && (
            <div className="mobile-initial">
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                    <span className="initial-circle">{user.initial}</span>
                </Link>
            </div>
        )}

        <div className={`hamburger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
      </div>
    </header>
  );
}
