"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import WorldMap to avoid SSR issues with Leaflet
const WorldMap = dynamic(() => import('./WorldMap'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      height: 'calc(100vh - 80px)', 
      width: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: '#f8f9fa' 
    }}>
      <p style={{ fontSize: '1.5rem', color: '#333' }}>Loading Map...</p>
    </div>
  ),
});

export default function WorldMapClient() {
  return <WorldMap />;
}
