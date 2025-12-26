import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from './AuthProvider';
import { useTheme } from '../context/ThemeContext';

import FeedbackDetail from './FeedbackDetail';
import DeveloperProductivityChart from './DeveloperProductivityChart';
import FilterBar from './FilterBar';
import {
    FaList, FaCheckCircle, FaExclamationTriangle,
    FaRocket, FaClock
} from 'react-icons/fa';
import './DeveloperDashboard.css';

const DeveloperDashboard = () => {
    const { feedbacks, updateFeedbackStatus, assignDeveloper, searchQuery } = useFeedback();
    const { user } = useAuth();
    const { theme } = useTheme();
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // Filter feedbacks assigned to this developer
    const myTasks = feedbacks.filter(fb =>
        fb.assignedTo && fb.assignedTo._id === user._id &&
        (fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fb.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const pendingTasks = myTasks.filter(t => t.status === 'Pending');
    const activeTasks = myTasks.filter(t => ['In Progress', 'Working'].includes(t.status));
    const completedTasks = myTasks.filter(t => ['Resolved', 'Closed'].includes(t.status));

    // Derived metrics for UI
    const satisfactionRate = 98; // Hardcoded placeholder for now as per requirements

    const handleAccept = (id) => {
        updateFeedbackStatus(id, 'In Progress');
    };

    const handleReject = (id) => {
        if (window.confirm('Reject this assignment?')) {
            assignDeveloper(id, null); // Unassign
            updateFeedbackStatus(id, 'Open');
        }
    };

    const handleStatusChange = (id, newStatus) => {
        updateFeedbackStatus(id, newStatus);
    };

    return (
        <div className="dashboard-content">
            {/* Stats Grid */}
            <section className="dashboard-section section-stats">
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Assigned Feedback</p>
                        <h3 className="stat-value">{myTasks.length}</h3>
                        <span className="stat-change positive">+3 this week</span>
                    </div>
                    <div className="vision-icon"><FaList /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Pending</p>
                        <h3 className="stat-value">{pendingTasks.length}</h3>
                        <span className="stat-change negative">{pendingTasks.length > 0 ? 'Needs Attention' : 'On Track'}</span>
                    </div>
                    <div className="vision-icon icon-warn"><FaClock /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">In Progress</p>
                        <h3 className="stat-value">{activeTasks.length}</h3>
                        <span className="stat-change positive">Working</span>
                    </div>
                    <div className="vision-icon icon-info"><FaRocket /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Completed</p>
                        <h3 className="stat-value">{completedTasks.length}</h3>
                        <span className="stat-change positive">+2 today</span>
                    </div>
                    <div className="vision-icon icon-success"><FaCheckCircle /></div>
                </div>
            </section>

            {/* Charts Grid */}
            <section className="dashboard-section section-charts">
                {/* Circular Progress: Satisfaction Rate */}
                <div className="vision-card satisfaction-card">
                    <h3>Satisfaction Rate</h3>
                    <p className="sub-text">From all feedback</p>
                    <div className="circular-progress-container">
                        <div className="circular-progress">
                            <div className="inner-circle">
                                <span>{satisfactionRate}%</span>
                                <small>Based on likes</small>
                            </div>
                        </div>
                    </div>
                    <div className="satisfaction-footer">
                        <div className="pill">0% Bad</div>
                        <div className="pill">100% Good</div>
                    </div>
                </div>

                {/* Productivity Chart */}
                <div className="vision-card productivity-card">
                    <DeveloperProductivityChart />
                </div>

                {/* Activity Summary */}
                <div className="vision-card activity-card">
                    <h3>Activity Summary</h3>
                    <div className="activity-list">
                        {completedTasks.slice(0, 3).map((task, i) => (
                            <div key={i} className="activity-item">
                                <div className="activity-icon-small icon-success">
                                    <FaCheckCircle />
                                </div>
                                <div className="activity-text">
                                    <p className="activity-title">Fixed {task.title}</p>
                                    <p className="activity-time">Just now</p>
                                </div>
                            </div>
                        ))}
                        <div className="activity-item">
                            <div className="activity-icon-small icon-info">
                                <FaRocket />
                            </div>
                            <div className="activity-text">
                                <p className="activity-title">New assignment</p>
                                <p className="activity-time">2 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Table Section */}
            <section className="dashboard-section section-table">
                <div className="vision-card table-card">
                    <div className="card-header-flex">
                        <div>
                            <h3>Assigned Feedback</h3>
                            <p className="card-subtitle">
                                <FaCheckCircle className="inline-icon success-text" />
                                <strong> {myTasks.length} tasks</strong> in your list
                            </p>
                        </div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <FilterBar />
                    </div>

                    {myTasks.length === 0 ? (
                        <div className="empty-state">
                            <p>No tasks assigned yet.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="vision-table">
                                <thead>
                                    <tr>
                                        <th>TITLE</th>
                                        <th>PRIORITY</th>
                                        <th>STATUS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myTasks.map((fb) => (
                                        <tr key={fb._id} onClick={() => setSelectedFeedback(fb)} className="clickable-row">
                                            <td className="company-cell">
                                                <div className="logo-box slack">
                                                    {fb.submittedBy ? fb.submittedBy.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <span className="title-text">{fb.title}</span>
                                            </td>
                                            <td>
                                                <span className={`priority-badge ${fb.priority.toLowerCase()}`}>
                                                    {fb.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${fb.status.toLowerCase().replace(' ', '-')}`}>{fb.status}</span>
                                            </td>
                                            <td onClick={e => e.stopPropagation()}>
                                                {fb.status === 'Pending' ? (
                                                    <div className="action-buttons">
                                                        <button className="btn-text success-text" onClick={() => handleAccept(fb._id)}>ACCEPT</button>
                                                        <button className="btn-text danger-text" onClick={() => handleReject(fb._id)}>REJECT</button>
                                                    </div>
                                                ) : (
                                                    <div className="status-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <select
                                                            value={fb.status}
                                                            onChange={(e) => handleStatusChange(fb._id, e.target.value)}
                                                            className="status-select"
                                                            disabled={fb.status === 'Closed'}
                                                            style={{ flex: 1, minWidth: '120px' }}
                                                        >
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Working">Working</option>
                                                            <option value="Resolved">Resolved</option>
                                                        </select>

                                                        {/* ETA Date Picker */}
                                                        <input
                                                            type="date"
                                                            className="date-input"
                                                            value={fb.estimatedResolutionDate ? new Date(fb.estimatedResolutionDate).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => updateFeedbackStatus(fb._id, fb.status, { estimatedResolutionDate: e.target.value })}
                                                            title="Set Estimated Resolution Date"
                                                            style={{
                                                                flex: 1,
                                                                padding: '8px',
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--input-border)',
                                                                background: 'var(--input-bg)',
                                                                color: 'var(--text-primary)',
                                                                outline: 'none',
                                                                fontFamily: 'Outfit, sans-serif',
                                                                minWidth: '130px',
                                                                colorScheme: theme === 'light' ? 'light' : 'dark'
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {selectedFeedback && (
                <FeedbackDetail
                    feedback={selectedFeedback}
                    onClose={() => setSelectedFeedback(null)}
                />
            )}
        </div>
    );
};

export default DeveloperDashboard;
