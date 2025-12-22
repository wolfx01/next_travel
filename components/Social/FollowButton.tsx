"use client";

import { useState, useEffect } from 'react';

interface FollowButtonProps {
    targetUserId: string;
    currentUserId: string;
    initialIsFollowing?: boolean;
    onToggle?: (isFollowing: boolean) => void;
}

export default function FollowButton({ targetUserId, currentUserId, initialIsFollowing = false, onToggle }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUserId) {
            alert("Please login to follow users");
            return;
        }

        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/users/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentUserId, targetUserId })
            });

            if (res.ok) {
                const data = await res.json();
                setIsFollowing(data.isFollowing);
                if (onToggle) onToggle(data.isFollowing);
            }
        } catch (error) {
            console.error("Follow toggle failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (currentUserId === targetUserId) return null;

    return (
        <button 
            onClick={handleFollowToggle}
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            disabled={loading}
            style={{
                background: isFollowing ? '#e0e0e0' : '#3498db',
                color: isFollowing ? '#333' : 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 20px',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.9rem'
            }}
        >
            {loading ? '...' : (
                <>
                    {isFollowing ? (
                        <><i className="fas fa-check"></i> Following</>
                    ) : (
                        <><i className="fas fa-plus"></i> Follow</>
                    )}
                </>
            )}
        </button>
    );
}
