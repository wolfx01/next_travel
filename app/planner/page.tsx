"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/app/styles/planner.css';
import Navbar from '@/components/Navbar';

interface Trip {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    coverImage?: string;
    itinerary: any[];
}

export default function PlannerPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await fetch('/api/trips');
            if (res.ok) {
                const data = await res.json();
                setTrips(data);
            }
        } catch (error) {
            console.error("Failed to fetch trips", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, startDate, endDate })
            });

            if (res.ok) {
                setShowModal(false);
                setTitle('');
                setStartDate('');
                setEndDate('');
                fetchTrips(); // Refresh list
            }
        } catch (error) {
            console.error("Error creating trip", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link click
        e.stopPropagation();
        
        if(!confirm("Are you sure you want to delete this trip?")) return;

        try {
             const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
             if (res.ok) {
                 setTrips(trips.filter(t => t._id !== id));
             }
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Navbar />
            
            <div className="planner-container">
                <div className="planner-header">
                    <div>
                        <h1 className="planner-title">My Trips </h1>
                        <p style={{ color: '#7f8c8d' }}>Plan your next adventure</p>
                    </div>
                    <button className="create-trip-btn" onClick={() => setShowModal(true)}>
                        <span>+</span> Create New Trip
                    </button>
                </div>

                {loading ? (
                   <div style={{ textAlign: 'center', padding: '50px' }}>Loading your adventures...</div>
                ) : trips.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🗺️</div>
                        <h2>No trips planned yet</h2>
                        <p>Start by creating your first trip!</p>
                    </div>
                ) : (
                    <div className="trips-grid">
                        {trips.map(trip => (
                            <Link href={`/planner/${trip._id}`} key={trip._id} style={{ textDecoration: 'none' }}>
                                <div className="trip-card">
                                    <div className="trip-cover" style={{ backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop'})` }}>
                                        <div className="trip-date-badge">
                                            {formatDate(trip.startDate)}
                                        </div>
                                        <button className="delete-trip-btn" onClick={(e) => handleDeleteTrip(trip._id, e)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                    <div className="trip-card-content">
                                        <h3 className="trip-card-title">{trip.title}</h3>
                                        <div className="trip-card-meta">
                                            <span>📅 {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days</span>
                                            <span>📍 {trip.itinerary.length} Activities</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Trip Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">Create New Trip</h2>
                        <form onSubmit={handleCreateTrip}>
                            <div className="form-group">
                                <label className="form-label">Trip Title</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. Summer in Italy" 
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Start Date</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">End Date</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Trip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
