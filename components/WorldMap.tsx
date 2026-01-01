"use client";

import { useEffect, useState, useRef } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Define type for Places
interface Place {
  id: number;
  name: string;
  country: string;
  description: string;
  image: string;
  coordinates: number[];
  population: number;
}

interface GlobeData {
  lat: number;
  lng: number;
  label: string;
  placeId: number;
  country: string;
  image: string;
  population: number;
}

export default function WorldMap() {
  const [places, setPlaces] = useState<GlobeData[]>([]);
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [hoveredPlace, setHoveredPlace] = useState<GlobeData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load places data
    import('@/lib/data/places.json').then((mod) => {
        const data = (mod.default || mod) as Place[];
        
        // Filter valid places
        const allPlaces = data
            .filter(p => p.coordinates && p.coordinates.length === 2);

        // Map data to Globe format
        const globeData = allPlaces.map(p => ({
            lng: p.coordinates[0],
            lat: p.coordinates[1],
            label: p.name,
            placeId: p.id,
            country: p.country,
            image: p.image,
            population: p.population
        }));
        setPlaces(globeData);
    });
  }, []);

  useEffect(() => {
    if (globeEl.current) {
        // Force disable auto-rotate
        const controls = globeEl.current.controls();
        if (controls) {
            controls.autoRotate = false;
            controls.enableDamping = true; 
            controls.dampingFactor = 0.1;
        }
        
        // Use a timeout to ensure it stays off if library overrides on init
        setTimeout(() => {
            if (globeEl.current) {
                const controls = globeEl.current.controls();
                if (controls) controls.autoRotate = false;
            }
        }, 1000);
    }
  }, []);

  const handleNavigate = (id: number) => {
      router.push(`/places/${id}`);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 80px)', background: '#050505' }}>
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // @ts-ignore
        htmlElementsData={places}
        htmlLat="lat"
        htmlLng="lng"
        htmlElement={(d: any) => {
            const el = document.createElement('div');
            
            // Check if this element is hovered
            const isHovered = hoveredPlace === d;

            el.innerHTML = `
                <div style="
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    cursor: pointer;
                    transform: translate(-50%, -50%);
                    z-index: ${isHovered ? 10 : 1};
                    pointer-events: auto; /* Ensure clicks are captured */
                ">
                    <!-- Marker Dot -->
                    <div style="
                        width: ${isHovered ? '24px' : '10px'}; 
                        height: ${isHovered ? '24px' : '10px'}; 
                        background: ${isHovered ? '#e74c3c' : 'rgba(255, 255, 255, 0.9)'}; 
                        border-radius: 50%; 
                        box-shadow: 0 0 ${isHovered ? '25px' : '8px'} rgba(${isHovered ? '231, 76, 60' : '255, 255, 255'}, ${isHovered ? '0.9' : '0.6'});
                        border: ${isHovered ? '3px solid white' : 'none'};
                        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    "></div>

                    <!-- Label -->
                    <div style="
                        margin-top: 8px;
                        background: rgba(0,0,0,0.85);
                        color: white;
                        padding: 4px 10px;
                        border-radius: 6px;
                        font-size: 13px;
                        font-weight: 600;
                        white-space: nowrap;
                        pointer-events: none;
                        display: ${isHovered ? 'block' : 'none'};
                        transform: translateY(${isHovered ? '0' : '10px'});
                        opacity: ${isHovered ? '1' : '0'};
                        transition: all 0.2s ease;
                        border: 1px solid rgba(255,255,255,0.2);
                        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    ">
                        ${d.label}
                    </div>
                </div>
            `;
            
            // Direct click handler on the element
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavigate(d.placeId);
            });
            
            // Interaction listeners
            el.onmouseenter = () => setHoveredPlace(d);
            el.onmouseleave = () => setHoveredPlace(null);

            return el;
        }}
        
        // Add invisible points for backup click detection
        pointsData={places}
        pointLat="lat"
        pointLng="lng"
        pointRadius={1.5} // Slightly larger than visual dot to capture clicks easily
        pointColor={() => 'rgba(0,0,0,0)'} // Invisible
        onPointClick={(d: any) => handleNavigate(d.placeId)}
        onPointHover={(d: any) => setHoveredPlace(d)}
        
        // Atmosphere
        atmosphereColor="#3a228a"
        atmosphereAltitude={0.15}
      />
      
       {/* Details Card (Visible on Hover) */}
       {hoveredPlace && (
           <div style={{
               position: 'absolute',
               bottom: '30px',
               left: '30px',
               width: '320px',
               background: 'rgba(20, 20, 20, 0.85)',
               backdropFilter: 'blur(12px)',
               borderRadius: '20px',
               padding: '20px',
               border: '1px solid rgba(255,255,255,0.1)',
               boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
               color: 'white',
               zIndex: 100,
               transition: 'all 0.3s ease',
               animation: 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
           }}>
               <div style={{ position: 'relative', height: '180px', marginBottom: '16px', overflow: 'hidden', borderRadius: '14px' }}>
                   <img src={hoveredPlace.image} alt={hoveredPlace.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   <div style={{ 
                       position: 'absolute', 
                       top: '12px', 
                       right: '12px', 
                       background: 'rgba(0,0,0,0.7)', 
                       padding: '6px 10px', 
                       borderRadius: '30px', 
                       fontSize: '0.85rem',
                       fontWeight: '500',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '6px'
                   }}>
                       <span>📍</span> {hoveredPlace.country}
                   </div>
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>{hoveredPlace.label}</h3>
               </div>
               
               <p style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontSize: '1.2em' }}>👥</span> 
                   {hoveredPlace.population?.toLocaleString()} inhabitants
               </p>
               
               <button 
                   onClick={() => handleNavigate(hoveredPlace.placeId)}
                   style={{
                       width: '100%',
                       padding: '14px',
                       background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                       color: 'white',
                       border: 'none',
                       borderRadius: '12px',
                       fontSize: '1rem',
                       fontWeight: '700',
                       cursor: 'pointer',
                       boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
                       transition: 'transform 0.2s, box-shadow 0.2s',
                       display: 'flex',
                       justifyContent: 'center',
                       alignItems: 'center',
                       gap: '8px'
                   }}
                   onMouseOver={(e) => {
                       e.currentTarget.style.transform = 'translateY(-2px)';
                       e.currentTarget.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.6)';
                   }}
                   onMouseOut={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.4)';
                   }}
               >
                   Explore City 
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                   </svg>
               </button>
           </div>
       )}

       {/* Tips Overlay */}
       <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.65)',
            padding: '16px',
            borderRadius: '16px',
            color: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
       }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>🖱️ Drag to rotate</p>
            <p style={{ margin: '8px 0 0', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>🔭 Scroll to zoom</p>
            <p style={{ margin: '8px 0 0', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' }}>✨ Click to explore</p>
       </div>
       
       <style jsx global>{`
           @keyframes fadeIn {
               from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
               to { opacity: 1; transform: translateY(0); filter: blur(0); }
           }
       `}</style>
    </div>
  );
}
