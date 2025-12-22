"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="admin-container">
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="admin-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="admin-nav">
                    <Link href="/admin" className={`admin-link ${pathname === '/admin' ? 'active' : ''}`}>
                        <i className="fas fa-home"></i> <span>Dashboard</span>
                    </Link>
                    <Link href="/admin/users" className={`admin-link ${pathname === '/admin/users' ? 'active' : ''}`}>
                        <i className="fas fa-users"></i> <span>Users</span>
                    </Link>
                    <Link href="/admin/posts" className={`admin-link ${pathname === '/admin/posts' ? 'active' : ''}`}>
                        <i className="fas fa-file-alt"></i> <span>Posts</span>
                    </Link>
                    <Link href="/admin/comments" className={`admin-link ${pathname === '/admin/comments' ? 'active' : ''}`}>
                        <i className="fas fa-comments"></i> <span>Comments</span>
                    </Link>
                    <Link href="/" className="admin-link">
                        <i className="fas fa-arrow-left"></i> <span>Back to Site</span>
                    </Link>
                </nav>
            </aside>
            <main className="admin-content">
                <header className="admin-content-header">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="toggle-btn">
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className="header-actions">
                        <span>Welcome, Admin</span>
                    </div>
                </header>
                <div className="admin-page-content">
                    {children}
                </div>
            </main>
            <style jsx global>{`
                .admin-container {
                    display: flex;
                    min-height: 100vh;
                    background: #f4f6f9;
                    font-family: 'Inter', sans-serif;
                    padding-top: 60px; /* Navbar offset if needed, or remove navbar for admin */
                }
                .admin-sidebar {
                    width: 250px;
                    background: #2c3e50;
                    color: #ecf0f1;
                    transition: width 0.3s;
                    display: flex;
                    flex-direction: column;
                }
                .admin-sidebar.closed {
                    width: 60px;
                }
                .admin-sidebar.closed span, .admin-sidebar.closed h2 {
                    display: none;
                }
                .admin-header {
                    padding: 20px;
                    text-align: center;
                    border-bottom: 1px solid #34495e;
                }
                .admin-nav {
                    display: flex;
                    flex-direction: column;
                    padding: 20px 0;
                }
                .admin-link {
                    display: flex;
                    align-items: center;
                    padding: 15px 25px;
                    color: #bdc3c7;
                    text-decoration: none;
                    transition: all 0.2s;
                    gap: 15px;
                }
                .admin-link:hover, .admin-link.active {
                    background: #34495e;
                    color: #fff;
                    border-left: 4px solid #3498db;
                }
                .admin-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .admin-content-header {
                    background: #fff;
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                .toggle-btn {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #2c3e50;
                }
                .admin-page-content {
                    padding: 30px;
                    overflow-y: auto;
                }
            `}</style>
        </div>
    );
}
