"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

interface Post {
    _id: string;
    content: string;
    mediaUrl?: string;
    createdAt: string;
    userName: string; // From Post model directly
    userAvatar?: string;
    likesCount: number;
    commentsCount: number;
}

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAdminId, setCurrentAdminId] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // 1. Check Auth & Fetch Posts
        fetch('/api/auth/check-login')
            .then(res => res.json())
            .then(data => {
                if (!data.loggedIn || !data.isAdmin) {
                    alert("Access Denied");
                    router.push('/');
                    return;
                }
                setCurrentAdminId(data.mongoId);
                fetchPosts();
            });
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/admin/posts');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error("Failed to fetch posts");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = async (postId: string) => {
        if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/posts?id=${postId}&adminId=${currentAdminId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setPosts(posts.filter(p => p._id !== postId));
            } else {
                alert("Failed to delete post");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Posts...</div>;

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#2c3e50', margin: 0 }}>Manage Posts</h1>
                <span style={{ background: '#e74c3c', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                    Total: {posts.length}
                </span>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Author</th>
                            <th>Content</th>
                            <th>Media</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {post.userName || 'Unknown'}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {post.content}
                                    </div>
                                </td>
                                <td>
                                    {post.mediaUrl ? (
                                        <button 
                                            onClick={() => setSelectedImage(post.mediaUrl || null)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                padding: 0, 
                                                color: '#3498db', 
                                                textDecoration: 'underline', 
                                                cursor: 'pointer',
                                                fontSize: 'inherit',
                                                fontFamily: 'inherit'
                                            }}
                                        >
                                            View
                                        </button>
                                    ) : (
                                        <span style={{ color: '#bdc3c7' }}>None</span>
                                    )}
                                </td>
                                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        onClick={() => handleDeletePost(post._id)}
                                        className="delete-btn"
                                    >
                                        <i className="fas fa-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedImage && (
                <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedImage(null)}>&times;</button>
                        <img src={selectedImage} alt="Post Media" />
                    </div>
                </div>
            )}

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    padding: 20px;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    position: relative;
                    max-width: 90%;
                    max-height: 90vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .modal-content img {
                    max-width: 100%;
                    max-height: 85vh;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                }
                .close-modal-btn {
                    position: absolute;
                    top: -40px;
                    right: -10px;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 35px;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0 10px;
                    transition: transform 0.2s;
                }
                .close-modal-btn:hover {
                    transform: scale(1.1);
                    color: #e74c3c;
                }
                .table-container {
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    overflow: hidden;
                }
                .admin-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .admin-table th, .admin-table td {
                    padding: 15px 20px;
                    text-align: left;
                    border-bottom: 1px solid #f0f0f0;
                }
                .admin-table th {
                    background: #f8f9fa;
                    color: #7f8c8d;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                }
                .admin-table tr:hover {
                    background: #fcfcfc;
                }
                .delete-btn {
                    background: #ff7675;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                .delete-btn:hover {
                    background: #d63031;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 5px rgba(214, 48, 49, 0.3);
                }
            `}</style>
        </AdminLayout>
    );
}
