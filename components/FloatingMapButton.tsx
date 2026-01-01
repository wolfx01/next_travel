"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/app/styles/planner.css'; 

export default function FloatingMapButton() {
  const pathname = usePathname();

  // Hide on Chat page to prevent overlap with input area, and on Map page itself
  if (pathname === '/chat' || pathname === '/map') return null;

  return (
    <Link href="/map" className="floating-map-btn" style={{ bottom: '160px' }} title="World Map">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
        </svg>
        <span className="map-btn-text">World Map</span>
    </Link>
  );
}
