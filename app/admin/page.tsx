"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 1. Check Admin Auth
        fetch('/api/auth/check-login')
            .then(res => res.json())
            .then(data => {
                if (!data.loggedIn) {
                    router.push('/login');
                } else {
                    // Ideally verify isAdmin here too, or let the stats API fail
                    fetchStats(data.mongoId);
                }
            });
    }, []);

    const fetchStats = async (userId: string) => {
        try {
            const res = await fetch(`/api/admin/stats?userId=${userId}`);
            if (res.status === 403) {
                alert("Access Denied: You are not an admin.");
                router.push('/');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f6f9' }}>Loading Dashboard...</div>;

    return (
        <AdminLayout>
            <h1 style={{ fontSize: '1.8rem', color: '#2c3e50', marginBottom: '30px' }}>Dashboard Overview</h1>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon users">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Total Users</h3>
                        <p>{stats?.usersCount || 0}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon posts">
                        <i className="fas fa-images"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Total Posts</h3>
                        <p>{stats?.postsCount || 0}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon comments">
                        <i className="fas fa-comments"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Total Comments</h3>
                        <p>{stats?.commentsCount || 0}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon places">
                        <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="stat-info">
                        <h3>Visits Logged</h3>
                        <p>{stats?.visitsCount || 0}</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 25px;
                }
                .stat-card {
                    background: white;
                    border-radius: 12px;
                    padding: 25px;
                    display: flex;
                    align-items: center;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    transition: transform 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                }
                .stat-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin-right: 20px;
                    color: white;
                }
                .stat-icon.users { background: #3498db; }
                .stat-icon.posts { background: #e74c3c; }
                .stat-icon.comments { background: #f1c40f; }
                .stat-icon.places { background: #2ecc71; }
                
                .stat-info h3 {
                    margin: 0 0 5px 0;
                    color: #7f8c8d;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .stat-info p {
                    margin: 0;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #2c3e50;
                }
            `}</style>
        </AdminLayout>
    );
}
