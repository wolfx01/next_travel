"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/app/styles/notifications.css';

interface Notification {
    _id: string;
    senderId: {
        _id: string;
        userName: string;
        avatarUrl?: string;
    };
    type: 'like' | 'comment' | 'follow';
    postId?: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationDropdown({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/notifications?userId=${userId}`);
            const data = await res.json();
            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 1 minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [userId]);

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            // Mark all as read locally instantly
            setUnreadCount(0);
            
            // Sync with server
            const unreadIds = notifications.filter(n => !n.read).map(n => n._id);
            if (unreadIds.length > 0) {
                await fetch('/api/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ notificationIds: unreadIds })
                });
            }
        }
    };

    return (
        <div className="notification-wrapper">
            <div className="notification-icon" onClick={handleOpen}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>

            {isOpen && (
                <div className="notification-dropdown">
                    <h3>Notifications</h3>
                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <p className="no-notif">No new notifications</p>
                        ) : (
                            notifications.map(notif => (
                                <Link 
                                    href={notif.type === 'follow' ? `/profile/${notif.senderId._id}` : `/profile`} // Ideally link to specific post, but profile for now
                                    key={notif._id} 
                                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <img src={notif.senderId.avatarUrl || '/images/default_avatar.png'} alt="avatar" />
                                    <div className="notif-content">
                                        <p>
                                            <strong>{notif.senderId.userName}</strong>
                                            {notif.type === 'like' && ' liked your post.'}
                                            {notif.type === 'comment' && ' commented on your post.'}
                                            {notif.type === 'follow' && ' started following you.'}
                                        </p>
                                        <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {!notif.read && <div className="dot"></div>}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
