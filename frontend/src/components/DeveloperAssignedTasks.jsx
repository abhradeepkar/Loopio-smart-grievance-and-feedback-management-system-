import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from './AuthProvider';
import FeedbackDetail from './FeedbackDetail';
import Popup from './Popup';
import FilterBar from './FilterBar';
import {
    FaList, FaExclamationTriangle, FaRocket, FaCheckCircle,
    FaCalendarAlt, FaPlay, FaEye, FaCheck, FaBolt, FaTimesCircle, FaTrash
} from 'react-icons/fa';

const DeveloperAssignedTasks = () => {
    const { feedbacks, updateFeedbackStatus, assignDeveloper, deleteFeedback, filters, searchQuery } = useFeedback();
    const { user } = useAuth();
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDeclinePopup, setShowDeclinePopup] = useState(false);
    const [taskToDecline, setTaskToDecline] = useState(null);
    const [deadlineSort, setDeadlineSort] = useState('asc'); // 'asc' or 'desc'

    // 1. Filter by User Assignment
    const myTasks = feedbacks.filter(fb =>
        fb.assignedTo && fb.assignedTo._id === user._id
    );

    // 2. Apply Filters (Status, Priority, Search)
    const filteredTasks = myTasks.filter(fb => {
        const matchesSearch = fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fb.status.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filters.status ? fb.status === filters.status : true;
        const matchesPriority = filters.priority ? fb.priority === filters.priority : true;
        // Note: FilterBar handles updates to 'filters' context, we just read it.
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // 3. Sort by Deadline (if exists) or CreatedAt
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        const dateA = a.estimatedResolutionDate ? new Date(a.estimatedResolutionDate) : new Date(a.createdAt);
        const dateB = b.estimatedResolutionDate ? new Date(b.estimatedResolutionDate) : new Date(b.createdAt);
        return deadlineSort === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Stats
    const total = myTasks.length;
    const pending = myTasks.filter(t => t.status === 'Pending').length;
    const inProgress = myTasks.filter(t => ['In Progress', 'Working'].includes(t.status)).length;
    const resolved = myTasks.filter(t => ['Resolved', 'Closed'].includes(t.status)).length;

    // Actions
    const handleStartWork = (e, id) => {
        e.stopPropagation();
        updateFeedbackStatus(id, 'In Progress');
    };

    const handleMarkResolved = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Mark this task as Resolved?')) {
            updateFeedbackStatus(id, 'Resolved');
        }
    };

    const handleDecline = (e, id) => {
        e.stopPropagation();
        setTaskToDecline(id);
        setShowDeclinePopup(true);
    };

    const confirmDecline = () => {
        if (taskToDecline) {
            assignDeveloper(taskToDecline, null); // Unassign
            updateFeedbackStatus(taskToDecline, 'Declined'); // Set status to Declined
            setShowDeclinePopup(false);
            setTaskToDecline(null);
        }
    };

    const handleRemove = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to REMOVE (Delete) this task permanently?')) {
            deleteFeedback(id);
        }
    };



    return (
        <div className="dashboard-content">
            {/* Stats Overview */}
            <section className="dashboard-section section-stats">
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Total Assigned</p>
                        <h3 className="stat-value">{total}</h3>
                    </div>
                    <div className="vision-icon"><FaList /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Pending</p>
                        <h3 className="stat-value">{pending}</h3>
                    </div>
                    <div className="vision-icon icon-warn"><FaExclamationTriangle /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">In Progress</p>
                        <h3 className="stat-value">{inProgress}</h3>
                    </div>
                    <div className="vision-icon icon-info"><FaRocket /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Resolved</p>
                        <h3 className="stat-value">{resolved}</h3>
                    </div>
                    <div className="vision-icon icon-success"><FaCheckCircle /></div>
                </div>
            </section>

            {/* Task List Section */}
            <section className="dashboard-section section-table">
                <div className="vision-card table-card">
                    <div className="card-header-flex" style={{ flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h3>Assigned Tasks</h3>
                            <p className="card-subtitle">Manage your workload and deadlines</p>
                        </div>
                        <div style={{ marginLeft: '' }}>
                            {/* Deadline Sort Toggle */}
                            <button
                                className="btn-text"
                                onClick={() => setDeadlineSort(prev => prev === 'asc' ? 'desc' : 'asc')}
                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}
                            >
                                <FaCalendarAlt /> Sort by Deadline ({deadlineSort === 'asc' ? 'Earliest' : 'Latest'})
                            </button>
                        </div>
                    </div>

                    <div style={{ margin: '20px 0' }}>
                        <FilterBar />
                    </div>

                    {sortedTasks.length === 0 ? (
                        <div className="empty-state">
                            <p>No tasks found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="vision-table">
                                <thead>
                                    <tr>
                                        <th>TASK / PRIORITY</th>
                                        <th>STATUS</th>
                                        <th>ASSIGNEE / DEADLINE</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTasks.map((fb) => (
                                        <tr key={fb._id} onClick={() => setSelectedFeedback(fb)} className="clickable-row">
                                            {/* Column 1: Task Title & Priority */}
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    <span className="title-text" style={{ fontSize: '14px' }}>{fb.title}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--vision-text-muted)' }}>ID: #{fb._id.slice(-6)}</span>
                                                    <span className={`priority-badge ${fb.priority.toLowerCase()}`} style={{ width: 'fit-content' }}>
                                                        {fb.priority} Priority
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Column 2: Status Badge */}
                                            <td>
                                                <span className={`status-badge ${fb.status.toLowerCase().replace(' ', '-')}`}>
                                                    {fb.status}
                                                </span>
                                            </td>

                                            {/* Column 3: Dates */}
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: 'var(--vision-text-muted)' }}>Assigned:</span>
                                                        <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {fb.estimatedResolutionDate && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffb75e' }}>
                                                            <FaCalendarAlt size={10} />
                                                            <span>Due: {new Date(fb.estimatedResolutionDate).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Column 4: Quick Actions */}
                                            <td onClick={e => e.stopPropagation()}>
                                                <div className="action-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                    {/* ACTIONS logic: Allow start/decline for any task that hasn't been started yet */}
                                                    {['Submitted', 'Open', 'Pending'].includes(fb.status) && (
                                                        <button
                                                            className="btn-text success-text"
                                                            onClick={(e) => handleStartWork(e, fb._id)}
                                                            title="Start Work"
                                                            style={{ background: 'rgba(1, 181, 116, 0.1)', padding: '6px 12px', borderRadius: '8px' }}
                                                        >
                                                            <FaPlay style={{ marginRight: '5px' }} /> Start
                                                        </button>
                                                    )}
                                                    {['Submitted', 'Open', 'Pending'].includes(fb.status) && (
                                                        <button
                                                            className="btn-text danger-text"
                                                            onClick={(e) => handleDecline(e, fb._id)}
                                                            title="Decline Assignment"
                                                            style={{ background: 'rgba(227, 26, 26, 0.1)', padding: '6px 12px', borderRadius: '8px' }}
                                                        >
                                                            <FaTimesCircle style={{ marginRight: '5px' }} /> Decline
                                                        </button>
                                                    )}
                                                    {['In Progress', 'Working', 'Resolved'].includes(fb.status) && (
                                                        <select
                                                            className="status-select-small"
                                                            value={fb.status}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => {
                                                                e.stopPropagation();
                                                                if (e.target.value === 'Decline') {
                                                                    handleDecline(e, fb._id);
                                                                } else {
                                                                    updateFeedbackStatus(fb._id, e.target.value);
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '6px 20px 6px 10px',
                                                                borderRadius: '8px',
                                                                background: 'rgba(255, 255, 255, 0.05)',
                                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                color: 'var(--vision-text-main)',
                                                                fontSize: '12px',
                                                                outline: 'none',
                                                                cursor: 'pointer',
                                                                marginRight: '16px'
                                                            }}
                                                        >
                                                            <option value="Pending" style={{ color: 'black' }}>Pending (Pause)</option>
                                                            <option value="In Progress" style={{ color: 'black' }}>In Progress</option>
                                                            <option value="Working" style={{ color: 'black' }}>Working</option>
                                                            <option value="Resolved" style={{ color: 'black' }}>Resolved</option>
                                                            <option value="Decline" style={{ color: 'red' }}>Decline (Unassign)</option>
                                                        </select>
                                                    )}
                                                    <button
                                                        className="btn-text"
                                                        onClick={() => setSelectedFeedback(fb)}
                                                        title="View Details"
                                                        style={{ color: 'var(--vision-text-main)', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 12px', borderRadius: '8px' }}
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    <button
                                                        className="btn-text danger-text"
                                                        onClick={(e) => handleRemove(e, fb._id)}
                                                        title="Remove Task"
                                                        style={{ background: 'rgba(227, 26, 26, 0.1)', padding: '6px 12px', borderRadius: '8px' }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
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

            <Popup
                isOpen={showDeclinePopup}
                onClose={() => setShowDeclinePopup(false)}
                title="Decline Assignment"
                message="Are you sure you want to DECLINE this task? Admin will be notified to re-assign it."
                type="danger"
                onConfirm={confirmDecline}
                confirmText="Decline"
                cancelText="Cancel"
            />
        </div>
    );
};

export default DeveloperAssignedTasks;
