"use client";

import Link from 'next/link';
import '@/app/styles/planner.css'; // Ensure CSS is available if not globally loaded yet (though layout calls it mostly)

export default function FloatingPlannerButton() {
  return (
    <Link href="/planner" className="floating-planner-btn" style={{ bottom: '90px' }} title="Plan Your Trip">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            <path d="M12 2v20"></path>
        </svg>
        <span className="planner-btn-text">Plan Your Trip</span>
    </Link>
  );
}
