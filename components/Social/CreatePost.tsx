"use client";

import { useState, useRef } from 'react';

interface CreatePostProps {
  onPostCreated?: () => void;
  user: {
    _id: string; // or id
    userName: string;
    avatarUrl?: string;
  };
}

export default function CreatePost({ onPostCreated, user }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id, 
          content,
          mediaUrl: imagePreview // Send base64 for now, better to upload to cloud storage
        }),
      });

      if (res.ok) {
        setContent("");
        setImagePreview(null);
        if (onPostCreated) onPostCreated();
        // Dispatch global event for loose coupling with ProfileFeed
        window.dispatchEvent(new Event('postCreated'));
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <img 
            src={user.avatarUrl || '/images/default_avatar.png'} 
            alt="User" 
            className="create-post-avatar"
        />
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user.userName}?`}
            className="create-post-input"
          />
          
          {imagePreview && (
            <div className="preview-container">
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px' }} />
                <button 
                    type="button" 
                    onClick={() => setImagePreview(null)}
                    className="remove-preview-btn"
                >
                    &times;
                </button>
            </div>
          )}

          <div className="create-post-actions">
            <button 
                type="button" 
                onClick={handleImageClick}
                className="media-btn"
            >
              <i className="fas fa-image" style={{ color: '#4caf50' }}></i> Photo
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="image/*"
            />
            
            <button 
                type="submit" 
                disabled={isSubmitting || !content.trim()}
                className="post-btn-primary"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
