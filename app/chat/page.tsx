"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation'; // To start chat from profile
import '@/app/styles/chat.css';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  user: {
      _id: string;
      userName: string;
      avatarUrl?: string;
  };
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

export default function ChatPage() {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChat, setActiveChat] = useState<any>(null); // User object of active chat
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    
    // For auto-scrolling
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // Check for 'startChat' param (contactId)
    const searchParams = useSearchParams();
    const startContactId = searchParams.get('userId');

    useEffect(() => {
        // 1. Get Current User
        fetch('/api/auth/check-login')
            .then(res => res.json())
            .then(data => {
                if (data.loggedIn) {
                    setCurrentUser({ _id: data.mongoId, userName: data.userName });
                }
            });
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        // 2. Fetch Conversations
        fetchConversations();
        
        // Polling loop
        const interval = setInterval(fetchConversations, 5000); 
        return () => clearInterval(interval);
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;

        // 3. If directed from profile, set active chat
        if (startContactId) {
            // First fetch user details to be sure, or just start basic
            fetch(`/api/users/${startContactId}`)
                .then(res => res.json())
                .then(user => {
                    setActiveChat(user);
                });
        }
    }, [startContactId, currentUser]);

    useEffect(() => {
        if (!currentUser || !activeChat) return;
        
        // 4. Fetch Messages for Active Chat
        fetchMessages(activeChat._id);
        const interval = setInterval(() => fetchMessages(activeChat._id), 3000);
        return () => clearInterval(interval);
    }, [activeChat, currentUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = async () => {
        try {
            const res = await fetch(`/api/chat?currentUserId=${currentUser._id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setConversations(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async (contactId: string) => {
        try {
            const res = await fetch(`/api/chat?currentUserId=${currentUser._id}&contactId=${contactId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat || !currentUser) return;

        const tempMsg = newMessage;
        setNewMessage(""); // Optimistic clear

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentUser._id,
                    receiverId: activeChat._id,
                    content: tempMsg
                })
            });

            if (res.ok) {
                fetchMessages(activeChat._id);
                fetchConversations(); // Update last message listing
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!currentUser) return <div style={{ paddingTop: '100px', textAlign: 'center' }}>Please log in to chat.</div>;

    return (
        <main className={`chat-container ${activeChat ? 'active-chat-mobile' : ''}`}>
            <div className="chat-sidebar">
                <div className="chat-header">
                    <h2>Messages</h2>
                </div>
                <div className="conversation-list">
                    {conversations.map(conv => (
                        <div 
                            key={conv.user._id} 
                            className={`conversation-item ${activeChat?._id === conv.user._id ? 'active' : ''}`}
                            onClick={() => setActiveChat(conv.user)}
                        >
                            <div className="chat-avatar-wrapper">
                                <img src={conv.user.avatarUrl || '/images/default_avatar.png'} alt="avatar" className="chat-avatar" />
                            </div>
                            <div className="conversation-info">
                                <div className="conversation-name">{conv.user.userName}</div>
                                <div className={`last-message ${conv.unread ? 'unread' : ''}`}>
                                    {conv.user._id === currentUser._id ? 'You: ' : ''}{conv.lastMessage}
                                </div>
                            </div>
                            <div className="time-stamp">
                                {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <p style={{ padding: '20px', color: '#95a5a6', textAlign: 'center' }}>No conversations yet.</p>
                    )}
                </div>
            </div>

            <div className={`chat-main ${activeChat ? 'active' : ''}`}>
                {activeChat ? (
                    <>
                        <div className="chat-main-header">
                            <button 
                                className="mobile-back-btn" 
                                onClick={() => setActiveChat(null)}
                                style={{ marginRight: '10px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', display: 'none' }}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <img 
                                src={activeChat.avatarUrl || '/images/default_avatar.png'} 
                                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '15px' }} 
                            />
                            <h3>{activeChat.userName}</h3>
                        </div>
                        
                        <div className="messages-container">
                            {messages.map(msg => (
                                <div key={msg._id} className={`message-bubble ${msg.senderId === currentUser._id ? 'sent' : 'received'}`}>
                                    {msg.content}
                                    <div className="message-time">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="chat-input-area" onSubmit={handleSendMessage}>
                            <input 
                                type="text" 
                                className="chat-input" 
                                placeholder="Type a message..." 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="empty-chat-state">
                        <i className="far fa-comments"></i>
                        <h2>Select a conversation</h2>
                        <p>Choose a friend from the sidebar or start a new chat from their profile.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
