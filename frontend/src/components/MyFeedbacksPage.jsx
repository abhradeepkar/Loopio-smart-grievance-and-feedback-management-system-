import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from './AuthProvider';
import FeedbackDetail from './FeedbackDetail';
import { } from 'react-icons/fa'; // kept empty for potential future use or remove completely
import './MyFeedbacksPage.css';

const MyFeedbacksPage = () => {
    const { feedbacks, searchQuery } = useFeedback();
    const { user } = useAuth();
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const myFeedbacks = feedbacks.filter(fb =>
        fb.submittedBy && fb.submittedBy._id === user._id &&
        (fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fb.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div style={{ padding: '20px' }}>
            <div className="vision-card my-feedbacks-card">
                <div className="card-header-flex">
                    <h3>My Feedbacks</h3>
                    <p className="card-subtitle">Track your submitted issues</p>
                </div>

                <div className="table-container" style={{ marginTop: '20px' }}>
                    <table className="vision-table">
                        <thead>
                            <tr>
                                <th>TITLE</th>
                                <th>CATEGORY</th>
                                <th>PRIORITY</th>
                                <th>STATUS</th>
                                <th>ESTIMATED RESOLUTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myFeedbacks.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#A0AEC0' }}>
                                        No feedbacks found.
                                    </td>
                                </tr>
                            ) : (
                                myFeedbacks.map(fb => (
                                    <tr key={fb._id} className="clickable-row" onClick={() => setSelectedFeedback(fb)}>
                                        <td style={{ fontWeight: '600' }}>{fb.title}</td>
                                        <td>{fb.category}</td>
                                        <td>
                                            <span className={`priority-badge ${fb.priority.toLowerCase()}`}>{fb.priority}</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${fb.status.toLowerCase().replace(' ', '-')}`}>{fb.status}</span>
                                        </td>
                                        <td style={{ color: fb.estimatedResolutionDate ? '#00D9F4' : 'inherit' }}>
                                            {fb.estimatedResolutionDate ? new Date(fb.estimatedResolutionDate).toLocaleDateString() : 'TBD'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedFeedback && (
                <FeedbackDetail
                    feedback={selectedFeedback}
                    onClose={() => setSelectedFeedback(null)}
                />
            )}
        </div>
    );
};

export default MyFeedbacksPage;
