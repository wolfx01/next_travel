"use client";
import { useState } from 'react';
import Link from 'next/link';

interface PostCardProps {
  post: {
    _id: string;
    userId: string; // Add userId
    userName: string;
    userAvatar?: string;
    content: string;
    mediaUrl?: string;
    likes: string[];
    comments: any[]; // Added comments to the post interface
    createdAt: string;
    location?: string;
  };
  currentUserId?: string;
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
  const [localLikes, setLocalLikes] = useState(post.likes || []);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const isLiked = currentUserId && localLikes.includes(currentUserId);

  const handleLike = async () => {
    if (!currentUserId) {
        alert("Please login to like posts");
        return;
    }

    // Optimistic update
    const newLikes = isLiked 
        ? localLikes.filter((id: string) => id !== currentUserId)
        : [...localLikes, currentUserId];
    
    setLocalLikes(newLikes);

    try {
        await fetch('/api/posts/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId: post._id, userId: currentUserId })
        });
    } catch (e) {
        console.error("Like failed", e);
        // Revert on error
        setLocalLikes(post.likes); 
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUserId) {
          alert("Please login to comment");
          return;
      }
      if (!commentText.trim() || isSubmittingComment) return;

      setIsSubmittingComment(true);
      try {
          const res = await fetch('/api/posts/comment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ postId: post._id, userId: currentUserId, text: commentText })
          });
          
          if (res.ok) {
              const data = await res.json();
              setComments(data.comments || []);
              setCommentText("");
          }
      } catch (e) {
          console.error("Comment failed", e);
      } finally {
          setIsSubmittingComment(false);
      }
  };

  const handleShare = () => {
      const url = `${window.location.origin}/feed`; // Or specific post link if we had one
      navigator.clipboard.writeText(url).then(() => {
          alert("Link copied to clipboard!");
      });
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <Link href={`/profile/${post.userId}`}>
            <img 
                src={post.userAvatar || '/images/default_avatar.png'} 
                alt={post.userName} 
                className="post-avatar"
            />
        </Link>
        <div className="post-user-info">
            <Link href={`/profile/${post.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h4>{post.userName}</h4>
            </Link>
            <div className="post-meta">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                {post.location && (
                    <>• <span><i className="fas fa-map-marker-alt"></i> {post.location}</span></>
                )}
            </div>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {post.mediaUrl && (
        <div className="post-media">
            <img src={post.mediaUrl} alt="Post media" />
        </div>
      )}

      <div className="post-actions">
        <button 
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
        >
            <i className={`fa${isLiked ? 's' : 'r'} fa-heart`}></i> {localLikes.length} Likes
        </button>
        <button 
            className="action-btn"
            onClick={() => setShowComments(!showComments)}
        >
            <i className="far fa-comment"></i> {comments?.length || 0} Comments
        </button>
        <button 
            className="action-btn"
            onClick={handleShare}
        >
            <i className="fas fa-share"></i> Share
        </button>
      </div>

      {showComments && (
          <div className="comments-section" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #f0f0f0' }}>
              {comments.map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <img src={c.userAvatar || '/images/default_avatar.png'} alt="user" style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                      <div style={{ background: '#f5f6fa', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
                          <h5 style={{ margin: 0, fontSize: '0.85rem' }}>{c.userName}</h5>
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', color: '#333' }}>{c.text}</p>
                      </div>
                  </div>
              ))}
              
              <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input 
                    type="text" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    style={{ 
                        flex: 1, 
                        border: '1px solid #ddd', 
                        borderRadius: '20px', 
                        padding: '8px 15px',
                        outline: 'none',
                        fontSize: '0.9rem'
                    }}
                  />
                  <button 
                      type="submit" 
                      disabled={!commentText.trim() || isSubmittingComment} 
                      style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: isSubmittingComment ? '#ccc' : '#00bcd4', 
                          cursor: isSubmittingComment ? 'not-allowed' : 'pointer', 
                          fontWeight: 600 
                      }}
                  >
                      {isSubmittingComment ? 'Posting...' : 'Post'}
                  </button>
              </form>
          </div>
      )}
    </div>
  );
}
