import { Metadata } from 'next';
import WorldMapClient from '@/components/WorldMapClient';
import React from 'react';

export const metadata: Metadata = {
  title: 'World Map | Travel',
  description: 'Explore destinations around the globe on our interactive world map.',
};

export default function MapPage() {
  return (
    <main style={{ paddingTop: '80px' }}> {/* Adjust padding based on Navbar height */}
      <WorldMapClient />
    </main>
  );
}
