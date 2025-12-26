import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from './AuthProvider';
import FeedbackDetail from './FeedbackDetail';
import {
    FaExclamationTriangle, FaHammer, FaCheckCircle, FaClock,
    FaEye, FaStepForward, FaCommentDots, FaCheck
} from 'react-icons/fa';

const DeveloperFeedbackToFix = () => {
    const { feedbacks, updateFeedbackStatus } = useFeedback();
    const { user } = useAuth();
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    // Filter Logic: "Feedback to Fix" implies In Progress/Working items assigned to me
    // The prompt says "only feedback items that are currently in progress and require fixing"
    const fixList = feedbacks.filter(fb =>
        fb.assignedTo &&
        fb.assignedTo._id === user._id &&
        ['In Progress', 'Working'].includes(fb.status)
    );

    // Summary Stats
    const totalToFix = fixList.length;
    const highPriority = fixList.filter(fb => fb.priority === 'High').length;
    // Mocking "Due Today" logic effectively, assuming estimatedResolutionDate matches today
    const today = new Date().toISOString().split('T')[0];
    const dueToday = fixList.filter(fb =>
        fb.estimatedResolutionDate &&
        new Date(fb.estimatedResolutionDate).toISOString().split('T')[0] === today
    ).length;


    // Handlers
    const handleUpdateProgress = (e, id, currentStatus) => {
        e.stopPropagation();
        // Toggle between In Progress -> Working -> Resolved (handled by Mark Fixed)
        if (currentStatus === 'In Progress') {
            updateFeedbackStatus(id, 'Working');
        } else {
            // Already working, maybe nothing or loop back? Let's just keep it simple or ask user.
            // For now, toggle back to In Progress if needed or just keep Working.
            // Requirement says "Update Progress".
            // Let's assume it moves to next stage or just ensures it's "Working".
            updateFeedbackStatus(id, 'Working');
        }
    };

    const handleMarkFixed = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Mark this feedback as fixed? This will set status to Resolved.')) {
            updateFeedbackStatus(id, 'Resolved');
        }
    };

    // Progress Tracker Component
    const ProgressTracker = ({ status }) => {
        // Stages: Assigned -> In Progress -> Working -> Resolved
        const stages = ['Assigned', 'In Progress', 'Working', 'Resolved'];
        const currentIdx = stages.indexOf(status) === -1 ? 0 : stages.indexOf(status);

        return (
            <div className="progress-tracker">
                {stages.map((stage, idx) => (
                    <div key={stage} className={`tracker-step ${idx <= currentIdx ? 'active' : ''}`}>
                        <div className="step-dot"></div>
                        <span className="step-label">{stage}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="dashboard-content">
            {/* Summary Section */}
            <section className="dashboard-section section-stats">
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Total to Fix</p>
                        <h3 className="stat-value">{totalToFix}</h3>
                    </div>
                    <div className="vision-icon icon-info"><FaHammer /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">High Priority</p>
                        <h3 className="stat-value">{highPriority}</h3>
                        <span className="stat-change negative">Critical</span>
                    </div>
                    <div className="vision-icon icon-warn"><FaExclamationTriangle /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Due Today</p>
                        <h3 className="stat-value">{dueToday}</h3>
                        <span className="stat-change positive">Stay Focused</span>
                    </div>
                    <div className="vision-icon" style={{ background: '#FF5C5C' }}><FaClock /></div>
                </div>
            </section>

            {/* Work List */}
            <section className="dashboard-section section-table">
                <div className="vision-card table-card">
                    <div className="card-header-flex">
                        <div>
                            <h3>Work Queue</h3>
                            <p className="card-subtitle">
                                Focused view of your active fixing tasks
                            </p>
                        </div>
                    </div>

                    {fixList.length === 0 ? (
                        <div className="empty-state">
                            <p>No active fixes in progress. Pick tasks from "Assigned Tasks".</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="vision-table">
                                <thead>
                                    <tr>
                                        <th>FEEDBACK</th>
                                        <th>PRIORITY / STATUS</th>
                                        <th>PROGRESS</th>
                                        <th>DETAILS</th>
                                        <th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fixList.map((fb) => (
                                        <tr key={fb._id} onClick={() => setSelectedFeedback(fb)} className="clickable-row">
                                            {/* Title & ID */}
                                            <td data-label="FEEDBACK">
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                    <span className="title-text">{fb.title}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--vision-text-muted)' }}>ID: #{fb._id.slice(-6)}</span>
                                                    <span style={{ fontSize: '10px', color: 'var(--vision-text-muted)' }}>Started: {new Date(fb.updatedAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>

                                            {/* Priority & Status */}
                                            <td data-label="PRIORITY / STATUS">
                                                <div className="info-cell-stack">
                                                    <span className={`priority-badge ${fb.priority.toLowerCase()}`} style={{ width: 'fit-content' }}>
                                                        {fb.priority}
                                                    </span>
                                                    <span className="status-badge working" style={{ width: 'fit-content', background: 'rgba(0, 210, 255, 0.1)', color: '#00D2FF' }}>
                                                        {fb.status}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Progress Tracker */}
                                            <td data-label="PROGRESS" style={{ minWidth: '180px' }}>
                                                <ProgressTracker status={fb.status} />
                                            </td>

                                            {/* Details (Assigned By, Deadline) */}
                                            <td data-label="DETAILS">
                                                <div className="info-cell-stack">
                                                    <span><strong>Assigned By:</strong> Admin</span>
                                                    {fb.estimatedResolutionDate ? (
                                                        <span style={{ color: '#FFB75E' }}>Due: {new Date(fb.estimatedResolutionDate).toLocaleDateString()}</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--vision-text-muted)' }}>No Deadline</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td data-label="ACTIONS" onClick={e => e.stopPropagation()}>
                                                <div className="action-buttons" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button
                                                        className="btn-text success-text"
                                                        onClick={(e) => handleMarkFixed(e, fb._id)}
                                                        title="Mark as Fixed"
                                                        style={{ background: 'rgba(1, 181, 116, 0.1)', padding: '6px 12px', borderRadius: '8px' }}
                                                    >
                                                        <FaCheck /> Fixed
                                                    </button>
                                                    <button
                                                        className="btn-text"
                                                        onClick={(e) => handleUpdateProgress(e, fb._id, fb.status)}
                                                        title="Update Progress"
                                                        style={{ color: '#00D2FF', background: 'rgba(0, 210, 255, 0.1)', padding: '6px 12px', borderRadius: '8px' }}
                                                    >
                                                        <FaStepForward />
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

            {/* Inline CSS for Tracker & Mobile Card View */}
            <style jsx>{`
                .progress-tracker {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
                .tracker-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }
                .tracker-step:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 50%;
                    width: 100%;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.1);
                    z-index: 0;
                }
                .tracker-step.active:not(:last-child)::after {
                    background: #00D2FF;
                }
                .step-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    z-index: 1;
                    border: 2px solid var(--vision-card-bg);
                }
                .tracker-step.active .step-dot {
                    background: #00D2FF;
                    box-shadow: 0 0 5px rgba(0, 210, 255, 0.5);
                }
                .step-label {
                    font-size: 8px;
                    margin-top: 4px;
                    color: var(--vision-text-muted);
                }
                .tracker-step.active .step-label {
                    color: white;
                    font-weight: bold;
                }

                /* Responsive Cell Stack: Left Align Desktop, Right Align Mobile */
                .info-cell-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    align-items: flex-start; /* Default Desktop */
                    font-size: 13px;
                }
                [data-label="DETAILS"] .info-cell-stack {
                    gap: 4px;
                    font-size: 12px;
                }

                /* Mobile Card View for Table */
                @media (max-width: 768px) {
                    .vision-table {
                        min-width: 0;
                    }
                    .vision-table thead {
                        display: none;
                    }
                    .vision-table tbody tr {
                        display: flex;
                        flex-direction: column;
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 16px;
                        padding: 16px;
                        margin-bottom: 16px;
                    }
                    .vision-table td {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                        padding: 10px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        text-align: right;
                    }
                    .vision-table td:last-child {
                        border-bottom: none;
                        padding-top: 15px;
                        justify-content: center;
                    }
                    .vision-table td::before {
                        content: attr(data-label);
                        font-weight: 600;
                        font-size: 12px;
                        color: var(--vision-text-muted);
                        text-align: left;
                        margin-right: 15px;
                    }
                    /* Adjust specific cells for card look */
                    .action-buttons {
                        width: 100%;
                        justify-content: space-between;
                        gap: 10px;
                    }
                    .action-buttons button {
                        flex: 1;
                        justify-content: center;
                        height: 40px;
                    }
                    
                    /* Right align content stack on Mobile */
                    .info-cell-stack {
                        align-items: flex-end;
                        text-align: right;
                    }
                }
            `}</style>
        </div>
    );
};

export default DeveloperFeedbackToFix;
