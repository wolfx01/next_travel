"use client";

import { useEffect, useState } from 'react';
import CreatePost from '@/components/Social/CreatePost';
import PostCard from '@/components/Social/PostCard';

interface UserData {
  _id: string; // Ensure this matches User model ID field
  userName: string;
  avatarUrl?: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts", err);
    }
  };

  useEffect(() => {
    // 1. Check Auth (Mocking or Real)
    fetch('/api/auth/check-login')
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
           setUser({ _id: data.mongoId, userName: data.userName, avatarUrl: data.avatarUrl }); // Assuming API returns mongoId
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // 2. Fetch Posts
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    fetchPosts(); // Refresh feed
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: 800, color: '#333' }}>Travel Feed</h1>
      
      {user ? (
        <CreatePost user={user} onPostCreated={handlePostCreated} />
      ) : (
        <div style={{ padding: '20px', background: '#ffebee', borderRadius: '8px', marginBottom: '20px', color: '#c62828' }}>
            Please <a href="/login" style={{ fontWeight: 'bold', textDecoration: 'underline' }}>login</a> to share your travel stories.
        </div>
      )}

      <div className="feed-stream">
        {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>No posts yet. Be the first to share your journey!</p>
        ) : (
            posts.map((post: any) => (
                <PostCard key={post._id} post={post} currentUserId={user?._id} />
            ))
        )}
      </div>
    </div>
  );
}
