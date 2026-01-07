import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { FaEye, FaSort, FaFilter, FaCalendarAlt } from 'react-icons/fa';
import FeedbackDetail from './FeedbackDetail';

const AllFeedbacksPage = () => {
    const { feedbacks } = useFeedback();
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');

    const filteredFeedbacks = filterStatus === 'All'
        ? feedbacks
        : feedbacks.filter(fb => fb.status === filterStatus);

    return (
        <div className="vision-card table-card" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header-flex" style={{ marginBottom: '20px' }}>
                <div>
                    <h3>All Feedbacks</h3>
                    <p className="card-subtitle">Manage all system feedback</p>
                </div>
                <div className="filter-box">
                    <FaFilter style={{ marginRight: '8px', color: 'var(--text-secondary)' }} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="All" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>All Status</option>
                        <option value="Submitted" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Submitted</option>
                        <option value="Open" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Open</option>
                        <option value="Pending" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Pending</option>
                        <option value="In Progress" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>In Progress</option>
                        <option value="Working" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Working</option>
                        <option value="Resolved" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Resolved</option>
                        <option value="Closed" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Closed</option>
                    </select>
                </div>
            </div>

            <div className="table-responsive" style={{ flex: 1, overflowY: 'auto' }}>
                <table className="vision-table">
                    <thead>
                        <tr>
                            <th>TITLE</th>
                            <th>SUBMITTED BY</th>
                            <th>STATUS</th>
                            <th>PRIORITY</th>
                            <th>ETA <FaCalendarAlt style={{ fontSize: '10px', marginLeft: '5px' }} /></th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFeedbacks.map(fb => (
                            <tr key={fb._id} onClick={() => setSelectedFeedback(fb)} className="clickable-row">
                                <td style={{ fontWeight: 500 }}>{fb.title}</td>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {fb.submittedBy?.profilePicture ? (
                                        <img
                                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${fb.submittedBy.profilePicture}`}
                                            alt="Avatar"
                                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                            {(fb.submittedBy?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {fb.submittedBy?.name || 'Unknown'}
                                </td>
                                <td>
                                    <span className={`status-badge ${fb.status.toLowerCase().replace(' ', '-')}`}>
                                        {fb.status}
                                    </span>
                                </td>
                                <td>
                                    <span className={`priority-badge ${fb.priority.toLowerCase()}`}>
                                        {fb.priority}
                                    </span>
                                </td>
                                <td>
                                    {fb.estimatedResolutionDate ? (
                                        <span style={{
                                            color: '#00D9F4',
                                            fontWeight: '600',
                                            fontSize: '13px'
                                        }}>
                                            {new Date(fb.estimatedResolutionDate).toLocaleDateString()}
                                        </span>
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Not Set</span>
                                    )}
                                </td>
                                <td>
                                    <button className="btn-icon" title="View Details">
                                        <FaEye />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

export default AllFeedbacksPage;
