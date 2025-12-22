"use client";

import { useState, useEffect } from 'react';
import '@/app/styles/settings.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        email: '',
        avatarUrl: ''
    });

    // Password States
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        // Fetch user data
        fetch('/api/auth/check-login')
            .then(res => res.json())
            .then(data => {
                if (data.loggedIn) {
                    fetch(`/api/users/${data.mongoId}`)
                        .then(r => r.json())
                        .then(fullUser => {
                            setUser(fullUser);
                            setFormData({
                                name: fullUser.userName || '',
                                bio: fullUser.bio || '',
                                email: fullUser.email || '',
                                avatarUrl: fullUser.avatarUrl || ''
                            });
                            setLoading(false);
                        });
                } else {
                    window.location.href = '/login';
                }
            });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 800 * 1024) { // 800KB limit
                alert("File is too big! Please choose an image under 800KB.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, avatarUrl: base64String });
                // Update preview immediately
                setUser({ ...user, avatarUrl: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user || !user._id) return;

        try {
            const res = await fetch(`/api/users/${user._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: formData.name,
                    bio: formData.bio,
                    email: formData.email,
                    avatarUrl: formData.avatarUrl
                })
            });
            const data = await res.json();

            if (data.success) {
                alert("Profile updated successfully!");
                // Optionally update local user state
                setUser({ ...user, ...data.user });
            } else {
                alert(data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while saving.");
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const submitPasswordChange = async () => {
        setPasswordMsg({ text: '', type: '' });
        
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            setPasswordMsg({ text: 'All fields are required', type: 'error' });
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        if (passwordData.new.length < 6) {
             setPasswordMsg({ text: 'Password must be at least 6 characters', type: 'error' });
             return;
        }

        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.current,
                    newPassword: passwordData.new
                })
            });
            const data = await res.json();

            if (data.success) {
                setPasswordMsg({ text: 'Password changed successfully', type: 'success' });
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                setPasswordMsg({ text: data.message || 'Failed to update', type: 'error' });
            }
        } catch (err) {
            setPasswordMsg({ text: 'An error occurred', type: 'error' });
        }
    };

    // Preferences State
    const [preferences, setPreferences] = useState({
        emailNotif: true,
        pushNotif: true,
        darkMode: false
    });

    useEffect(() => {
        // Load preferences from localStorage
        const savedPrefs = localStorage.getItem('userPreferences');
        if (savedPrefs) {
            const parsed = JSON.parse(savedPrefs);
            setPreferences(parsed);
            if (parsed.darkMode) document.body.classList.add('dark-mode');
        }
    }, []);

    const togglePreference = (key: string) => {
        const k = key as keyof typeof preferences; 
        const newPrefs = { ...preferences, [k]: !preferences[k] };
        setPreferences(newPrefs);
        localStorage.setItem('userPreferences', JSON.stringify(newPrefs));

        if (key === 'darkMode') {
            document.body.classList.toggle('dark-mode');
        }
    };

    if (loading) return (
        <div className="settings-container">
             <div className="settings-sidebar">
                 <div className="skeleton skeleton-title"></div>
                 <div className="skeleton skeleton-text" style={{ height: '40px', marginBottom: '10px' }}></div>
                 <div className="skeleton skeleton-text" style={{ height: '40px', marginBottom: '10px' }}></div>
                 <div className="skeleton skeleton-text" style={{ height: '40px' }}></div>
             </div>
             <div className="settings-content">
                 <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
                 <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                     <div className="skeleton skeleton-avatar"></div>
                     <div className="skeleton skeleton-text" style={{ width: '200px', height: '40px', marginTop: '20px' }}></div>
                 </div>
                 <div className="skeleton skeleton-text" style={{ height: '50px', marginBottom: '20px' }}></div>
                 <div className="skeleton skeleton-text" style={{ height: '100px', marginBottom: '20px' }}></div>
             </div>
        </div>
    );

    return (
        <div className="settings-container">
            {/* Sidebar Navigation */}
            <div className="settings-sidebar">
                <h2>Settings</h2>
                <div 
                    className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <i className="fas fa-user-circle"></i>
                    Edit Profile
                </div>
                <div 
                    className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <i className="fas fa-shield-alt"></i>
                    Security
                </div>
                <div 
                    className={`settings-nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    <i className="fas fa-sliders-h"></i>
                    Preferences
                </div>
            </div>

            {/* Main Content Area */}
            <div className="settings-content">
                {activeTab === 'profile' && (
                    <div className="fade-in">
                        <h2>Edit Profile</h2>
                        <form onSubmit={handleSaveProfile}>
                            <div className="avatar-upload">
                                <img src={user?.avatarUrl || '/images/default_avatar.png'} alt="Avatar" className="current-avatar" />
                                <div className="upload-btn-wrapper">
                                    <button className="btn-upload">Change Photo</button>
                                    <input type="file" name="myfile" onChange={handleFileChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Display Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    className="form-control" 
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea 
                                    name="bio"
                                    className="form-control" 
                                    rows={4}
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell the world about yourself..."
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    className="form-control" 
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <button type="submit" className="settings-btn">Save Changes</button>
                        </form>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="fade-in">
                        <h2>Security</h2>
                        {passwordMsg.text && (
                            <div style={{ 
                                padding: '10px', 
                                marginBottom: '15px', 
                                borderRadius: '5px',
                                background: passwordMsg.type === 'error' ? '#ffebee' : '#e8f5e9',
                                color: passwordMsg.type === 'error' ? '#c62828' : '#2e7d32'
                            }}>
                                {passwordMsg.text}
                            </div>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); submitPasswordChange(); }}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input 
                                    type="password" 
                                    name="current"
                                    className="form-control" 
                                    placeholder="Enter current password" 
                                    value={passwordData.current}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    name="new"
                                    className="form-control" 
                                    placeholder="Enter new password"
                                    value={passwordData.new}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    name="confirm"
                                    className="form-control" 
                                    placeholder="Confirm new password"
                                    value={passwordData.confirm}
                                    onChange={handlePasswordChange}
                                />
                            </div>
                            <button type="submit" className="settings-btn">Update Password</button>
                        </form>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="fade-in">
                        <h2>Preferences</h2>
                        
                        <div className="pref-row">
                            <div>
                                <strong>Email Notifications</strong>
                                <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: 0 }}>Receive emails about new followers and comments</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={preferences.emailNotif} 
                                    onChange={() => togglePreference('emailNotif')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="pref-row">
                            <div>
                                <strong>Push Notifications</strong>
                                <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: 0 }}>Receive browser notifications</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={preferences.pushNotif} 
                                    onChange={() => togglePreference('pushNotif')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="pref-row">
                            <div>
                                <strong>Dark Mode</strong>
                                <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: 0 }}>Switch between Light and Dark themes</p>
                            </div>
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    checked={preferences.darkMode} 
                                    onChange={() => togglePreference('darkMode')}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
