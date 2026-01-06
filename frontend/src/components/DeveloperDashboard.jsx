import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from './AuthProvider';
import { useTheme } from '../context/ThemeContext';

import FeedbackDetail from './FeedbackDetail';
import Popup from './Popup';
import DeveloperProductivityChart from './DeveloperProductivityChart';
import FilterBar from './FilterBar';
import {
    FaList, FaCheckCircle, FaExclamationTriangle,
    FaRocket, FaClock, FaTimesCircle, FaTrash
} from 'react-icons/fa';
import './DeveloperDashboard.css';

const DeveloperDashboard = () => {
    const { feedbacks, updateFeedbackStatus, assignDeveloper, deleteFeedback, searchQuery } = useFeedback();
    const { user } = useAuth();
    const { theme } = useTheme();
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDeclinePopup, setShowDeclinePopup] = useState(false);
    const [taskToDecline, setTaskToDecline] = useState(null);

    // Filter feedbacks assigned to this developer
    const myTasks = feedbacks.filter(fb =>
        fb.assignedTo && fb.assignedTo._id === user._id &&
        (fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fb.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const pendingTasks = myTasks.filter(t => ['Submitted', 'Open', 'Pending'].includes(t.status));
    const activeTasks = myTasks.filter(t => ['In Progress', 'Working'].includes(t.status));
    const completedTasks = myTasks.filter(t => ['Resolved', 'Closed'].includes(t.status));

    // Derived metrics for UI
    const satisfactionRate = 98; // Hardcoded placeholder for now as per requirements

    const handleAccept = (id) => {
        updateFeedbackStatus(id, 'In Progress');
    };

    const handleDecline = (id) => {
        setTaskToDecline(id);
        setShowDeclinePopup(true);
    };

    const confirmDecline = () => {
        if (taskToDecline) {
            assignDeveloper(taskToDecline, null); // Unassign
            updateFeedbackStatus(taskToDecline, 'Declined');
            setShowDeclinePopup(false);
            setTaskToDecline(null);
        }
    };

    const handleRemove = (id) => {
        if (window.confirm('Are you sure you want to REMOVE (Delete) this task permanently?')) {
            deleteFeedback(id);
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
                        {completedTasks.length > 0 ? (
                            completedTasks
                                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                .slice(0, 4)
                                .map((task, i) => (
                                    <div key={task._id} className="activity-item">
                                        <div className="activity-icon-small icon-success">
                                            <FaCheckCircle />
                                        </div>
                                        <div className="activity-text">
                                            <p className="activity-title">Resolved {task.title}</p>
                                            <p className="activity-time">{new Date(task.updatedAt).toLocaleDateString()} at {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p className="sub-text" style={{ padding: '10px' }}>No recent activity.</p>
                        )}
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
                                                        <button className="btn-text danger-text" onClick={() => handleDecline(fb._id)}>DECLINE</button>
                                                    </div>
                                                ) : (
                                                    <div className="status-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <select
                                                            value={fb.status}
                                                            onChange={(e) => {
                                                                if (e.target.value === 'Decline') {
                                                                    handleDecline(fb._id);
                                                                } else {
                                                                    handleStatusChange(fb._id, e.target.value);
                                                                }
                                                            }}
                                                            className="status-select"
                                                            disabled={fb.status === 'Closed'}
                                                            style={{ flex: 1, minWidth: '120px' }}
                                                        >
                                                            <option value="Pending">Pending (Pause)</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Working">Working</option>
                                                            <option value="Resolved">Resolved</option>
                                                            <option value="Decline">Decline (Unassign)</option>
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
                                                        {/* Remove Button */}
                                                        <button
                                                            className="btn-text danger-text"
                                                            onClick={() => handleRemove(fb._id)}
                                                            title="Remove Task"
                                                            style={{ marginLeft: '10px' }}
                                                        >
                                                            <FaTrash />
                                                        </button>
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
            </section >

            {selectedFeedback && (
                <FeedbackDetail
                    feedback={selectedFeedback}
                    onClose={() => setSelectedFeedback(null)}
                />
            )}

            <Popup
                isOpen={showDeclinePopup}
                onClose={() => setShowDeclinePopup(false)}
                title="Decline Assignment"
                message="Are you sure you want to DECLINE this task? It will be unassigned from you and returned to the Open pool."
                type="danger"
                onConfirm={confirmDecline}
                confirmText="Decline"
                cancelText="Cancel"
            />
        </div >
    );
};

export default DeveloperDashboard;
