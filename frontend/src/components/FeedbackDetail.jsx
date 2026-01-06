import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from './AuthProvider';
import './FeedbackDetail.css';

const FeedbackDetail = ({ feedback: initialFeedback, onClose }) => {
    const { feedbacks, addComment, deleteComment } = useFeedback();
    const { user: currentUser } = useAuth();
    const [commentText, setCommentText] = useState('');

    // Get live feedback object from context to ensure updates (like comment deletion) are reflected immediately
    const feedback = feedbacks.find(f => f._id === initialFeedback._id) || initialFeedback;

    const assignedDev = feedback.assignedTo; // Populated object or null

    const handleSendComment = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        addComment(feedback._id, {
            text: commentText,
            author: currentUser.name,
            role: currentUser.role
        });
        setCommentText('');
    };

    return (
        <div className="feedback-detail-overlay">
            <div className="feedback-detail-modal">
                <div className="detail-header">
                    <div className="header-left">
                        <span className={`priority-badge ${feedback.priority.toLowerCase()}`}>
                            {feedback.priority} Priority
                        </span>
                        <span className={`status-badge ${feedback.status.toLowerCase().replace(' ', '-')}`}>
                            {feedback.status}
                        </span>
                    </div>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="detail-content">
                    <h2>{feedback.title}</h2>
                    <div className="meta-info">
                        <span><strong>Category:</strong> {feedback.category}</span>
                        <span><strong>Submitted by:</strong> {feedback.submittedBy?.name || 'Unknown'}</span>
                        <span><strong>Assigned to:</strong> {assignedDev ? assignedDev.name : 'Unassigned'}</span>
                        <span><strong>Date:</strong> {new Date(feedback.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="description-box">
                        <h3 style={{ color: '#0B1A30' }}>Description</h3>
                        <p>{feedback.description}</p>
                    </div>

                    {feedback.attachment && (
                        <div className="attachment-box" style={{ marginTop: '20px' }}>
                            <h3 style={{ color: '#0B1A30' }}>Attachment</h3>
                            <div style={{ marginTop: '10px' }}>
                                {/* Check if it's an image - simplistic check for legacy paths OR if it's the new API route (we assume it's viewable) */}
                                {feedback.attachment.match(/\.(jpeg|jpg|png|gif)$/i) || feedback.attachment.includes('/attachment') ? (
                                    <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--vision-card-border)' }}>
                                        <img
                                            src={feedback.attachment.startsWith('/api')
                                                ? `http://localhost:5000${feedback.attachment}`
                                                : `http://localhost:5000/${feedback.attachment.replace(/\\/g, "/")}`}
                                            alt="Attachment"
                                            style={{ maxWidth: '100%', maxHeight: '400px', display: 'block' }}
                                        />
                                    </div>
                                ) : (
                                    <a
                                        href={feedback.attachment.startsWith('/api')
                                            ? `http://localhost:5000${feedback.attachment}`
                                            : `http://localhost:5000/${feedback.attachment.replace(/\\/g, "/")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            color: 'var(--vision-primary)',
                                            textDecoration: 'underline',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        View Attached File
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="comments-section">
                        <h3 style={{ color: '#0B1A30' }}>Discussion</h3>
                        <div className="comments-list">
                            {feedback.comments.length === 0 ? (
                                <p className="no-comments">No comments yet. Start the discussion!</p>
                            ) : (
                                feedback.comments.map(comment => (
                                    <div key={comment._id || comment.id} className={`comment-bubble-row ${comment.role === currentUser.role ? 'mine' : 'theirs'}`} style={{ display: 'flex', justifyContent: comment.role === currentUser.role ? 'flex-end' : 'flex-start', marginBottom: '15px' }}>
                                        {/* Avatar for Theirs (Left side) */}
                                        {comment.role !== currentUser.role && (
                                            <div className="comment-avatar" style={{ marginRight: '10px', marginTop: '5px' }}>
                                                {comment.authorId?.profilePicture ? (
                                                    <img
                                                        src={`http://localhost:5000/${comment.authorId.profilePicture}`}
                                                        alt="Avatar"
                                                        style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
                                                        {(comment.authorId?.name || comment.author || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className={`comment-bubble ${comment.role === currentUser.role ? 'mine' : 'theirs'}`} style={{ maxWidth: '70%' }}>
                                            <div className="comment-header">
                                                <span className="author">{comment.authorId?.name || comment.author}</span>
                                                <span className="role-tag">{comment.role}</span>
                                                <span className="time">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {(currentUser.role === 'admin' || currentUser.name === comment.author) && (
                                                    <button
                                                        className="delete-comment-btn"
                                                        onClick={() => deleteComment(feedback._id, comment._id)}
                                                        title="Delete comment"
                                                    >
                                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path></svg>
                                                    </button>
                                                )}
                                            </div>
                                            <p>{comment.text}</p>
                                        </div>

                                        {/* Avatar for Mine (Right side) */}
                                        {comment.role === currentUser.role && (
                                            <div className="comment-avatar" style={{ marginLeft: '10px', marginTop: '5px' }}>
                                                {comment.authorId?.profilePicture ? (
                                                    <img
                                                        src={`http://localhost:5000/${comment.authorId.profilePicture}`}
                                                        alt="Avatar"
                                                        style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                                                        {(comment.authorId?.name || comment.author || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <form className="comment-form" onSubmit={handleSendComment}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <button type="submit">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackDetail;
