"use client";

import { useEffect, useState, useCallback } from 'react';
import PostCard from './PostCard';

interface ProfilePostsFeedProps {
    userId: string;
    isOwnProfile?: boolean;
}

export default function ProfilePostsFeed({ userId, isOwnProfile = false }: ProfilePostsFeedProps) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserPosts = useCallback(async () => {
        try {
            const res = await fetch(`/api/posts?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) fetchUserPosts();
        
        // Listen for custom event 'postCreated' to refresh feed (mostly for own profile)
        const handlePostCreated = () => fetchUserPosts();
        window.addEventListener('postCreated', handlePostCreated);
        return () => window.removeEventListener('postCreated', handlePostCreated);
    }, [userId, fetchUserPosts]);

    if (loading) return <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Loading posts...</div>;

    if (posts.length === 0) {
        return (
            <p style={{ textAlign: 'center', color: '#888', fontStyle: 'italic', padding: '20px' }}>
                {isOwnProfile 
                    ? "No posts yet. Share your first travel memory above!" 
                    : "This user hasn't posted anything yet."}
            </p>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posts.map((post: { _id: string; [key: string]: any }) => (
                <PostCard key={post._id} post={post} currentUserId={isOwnProfile ? userId : undefined} />
            ))}
        </div>
    );
}
