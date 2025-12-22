"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import '@/app/styles/planner.css';

interface ItineraryItem {
    _id?: string;
    placeName: string;
    dayIndex: number;
    notes?: string;
    time?: string;
    status: string;
}

interface Trip {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    coverImage?: string;
    itinerary: ItineraryItem[];
}

export default function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(0); // 0-based index for Day 1
    const [isAdding, setIsAdding] = useState(false);

    // Activity Form State
    const [actPlace, setActPlace] = useState('');
    const [actTime, setActTime] = useState('');
    const [actNotes, setActNotes] = useState('');

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            const res = await fetch(`/api/trips/${id}`);
            if (res.ok) {
                const data = await res.json();
                setTrip(data);
            } else {
                router.push('/planner'); // Redirect if not found
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trip) return;

        const newActivity: ItineraryItem = {
            placeName: actPlace,
            time: actTime,
            notes: actNotes,
            dayIndex: selectedDay,
            status: 'planned'
        };

        const updatedItinerary = [...trip.itinerary, newActivity];

        try {
            const res = await fetch(`/api/trips/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itinerary: updatedItinerary })
            });

            if (res.ok) {
                const updatedTrip = await res.json();
                setTrip(updatedTrip);
                setIsAdding(false);
                setActPlace('');
                setActTime('');
                setActNotes('');
            }
        } catch (error) {
            console.error("Failed to add activity", error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!trip) return null;

    // Calculate days
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const days = Array.from({ length: dayCount }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return { index: i, date: d };
    });

    const currentDayActivities = trip.itinerary
        .filter(item => item.dayIndex === selectedDay)
        .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />
            
            <div className="planner-container">
                <Link href="/planner" style={{ color: '#7f8c8d', textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    ← Back to My Trips
                </Link>

                {/* Trip Cover Header */}
                <div className="itinerary-cover">
                    <img src={trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop'} alt="Trip Cover" />
                    <div className="itinerary-title-section">
                        <h1 style={{ fontSize: '3rem', margin: 0 }}>{trip.title}</h1>
                        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                            {new Date(trip.startDate).toDateString()} — {new Date(trip.endDate).toDateString()}
                        </p>
                    </div>
                </div>

                {/* Day Tabs */}
                <div className="days-tabs">
                    {days.map(day => (
                        <div 
                            key={day.index} 
                            className={`day-tab ${selectedDay === day.index ? 'active' : ''}`}
                            onClick={() => setSelectedDay(day.index)}
                        >
                            <span className="day-tab-num">Day {day.index + 1}</span>
                            <span className="day-tab-date">{day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                    ))}
                </div>

                {/* Timeline */}
                <div className="timeline">
                    {currentDayActivities.length === 0 && !isAdding ? (
                        <div style={{ padding: '40px', color: '#95a5a6', fontStyle: 'italic' }}>
                            Nothing planned for this day yet. Add an activity!
                        </div>
                    ) : (
                        currentDayActivities.map((item, idx) => (
                            <div key={idx} className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="activity-time">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    {item.time || 'All Day'}
                                </div>
                                <h3 className="activity-title">{item.placeName}</h3>
                                {item.notes && <div className="activity-notes">{item.notes}</div>}
                            </div>
                        ))
                    )}

                    {/* Add Activity Section */}
                    {isAdding ? (
                        <div className="timeline-item" style={{ border: '2px solid #00bcd4' }}>
                            <div className="timeline-dot" style={{ background: 'white', borderColor: '#00bcd4' }}></div>
                            <h3>New Activity</h3>
                            <form onSubmit={handleAddActivity}>
                                <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                                    <input 
                                        className="form-input" 
                                        placeholder="Place Name (e.g. Eiffel Tower)" 
                                        value={actPlace}
                                        onChange={e => setActPlace(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <input 
                                        type="time"
                                        className="form-input" 
                                        value={actTime}
                                        onChange={e => setActTime(e.target.value)}
                                    />
                                    <textarea 
                                        className="form-input" 
                                        placeholder="Notes (e.g. Buy tickets online...)" 
                                        value={actNotes}
                                        onChange={e => setActNotes(e.target.value)}
                                        rows={2}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                                        <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                                        <button type="submit" className="btn-primary">Add Activity</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="add-activity-box" onClick={() => setIsAdding(true)}>
                            <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '10px' }}>+</span>
                            Add Activity to Day {selectedDay + 1}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
