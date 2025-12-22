"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

interface User {
    _id: string;
    userName: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentAdminId, setCurrentAdminId] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        // 1. Check Auth & Fetch Users
        fetch('/api/auth/check-login')
            .then(res => res.json())
            .then(data => {
                if (!data.loggedIn || !data.isAdmin) {
                    alert("Access Denied");
                    router.push('/');
                    return;
                }
                setCurrentAdminId(data.mongoId);
                fetchUsers();
            });
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/users?id=${userId}&adminId=${currentAdminId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setUsers(users.filter(u => u._id !== userId));
            } else {
                alert("Failed to delete user");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    if (isLoading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Users...</div>;

    return (
        <AdminLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#2c3e50', margin: 0 }}>Manage Users</h1>
                <span style={{ background: '#3498db', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>
                    Total: {users.length}
                </span>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div style={{ width: '30px', height: '30px', background: '#ddd', borderRadius: '50%', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                            {user.userName.charAt(0).toUpperCase()}
                                        </div>
                                        {user.userName}
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    {user.isAdmin ? (
                                        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>Admin</span>
                                    ) : (
                                        <span style={{ color: '#2ecc71' }}>User</span>
                                    )}
                                </td>
                                <td>
                                    {!user.isAdmin && (
                                        <button 
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="delete-btn"
                                        >
                                            <i className="fas fa-trash"></i> Delete
                                        </button>
                                    )}
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
                    background: #ff7675; /* A softer red */
                    color: white;
                    border: none;
                    padding: 6px 12px; /* Slightly larger padding */
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s; /* Smooth transition */
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                .delete-btn:hover {
                    background: #d63031; /* Darker red on hover */
                    transform: translateY(-1px); /* Little lift effect */
                    box-shadow: 0 2px 5px rgba(214, 48, 49, 0.3); /* Subtle shadow */
                }
                .delete-btn:active {
                    transform: translateY(0);
                    box-shadow: none;
                }
            `}</style>
        </AdminLayout>
    );
}
