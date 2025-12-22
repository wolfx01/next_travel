"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

interface Comment {
    _id: string; // This will be the comment's _id (subdocument id)
    postId: string;
    postContent: string;
    text: string;
    createdAt: string;
    userName: string;
    userAvatar?: string;
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAdminId, setCurrentAdminId] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        // 1. Check Auth & Fetch Comments
        fetch('/api/auth/check-login')
            .then(res => res.json())
            .then(data => {
                if (!data.loggedIn || !data.isAdmin) {
                    alert("Access Denied");
                    router.push('/');
                    return;
                }
                setCurrentAdminId(data.mongoId);
                fetchComments();
            });
    }, []);

    const fetchComments = async () => {
        try {
            const res = await fetch('/api/admin/comments');
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`/api/admin/comments?postId=${postId}&commentId=${commentId}&adminId=${currentAdminId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setComments(comments.filter(c => c._id !== commentId));
            } else {
                alert("Failed to delete comment");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Comments...</div>;

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#2c3e50', margin: 0 }}>Manage Comments</h1>
                <span style={{ background: '#f1c40f', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                    Total: {comments.length}
                </span>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User (Commenter)</th>
                            <th>Comment Text</th>
                            <th>Original Post</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map(comment => (
                            <tr key={comment._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {/* Avatar could go here */}
                                        {comment.userName}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                                        {comment.text}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#7f8c8d', fontSize: '0.9rem' }}>
                                        {comment.postContent}
                                    </div>
                                </td>
                                <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        onClick={() => handleDeleteComment(comment.postId, comment._id)}
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

            <style jsx>{`
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
