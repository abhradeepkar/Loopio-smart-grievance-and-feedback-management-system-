import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from './AuthProvider';
import FeedbackForm from './FeedbackForm';
import FeedbackDetail from './FeedbackDetail';
import UserAnalyticsChart from './UserAnalyticsChart';
import FilterBar from './FilterBar';
import {
    FaPlus, FaFileAlt, FaRocket, FaCheckCircle, FaClock, FaTrash
} from 'react-icons/fa';
import './UserDashboard.css';

const UserDashboard = () => {
    const { feedbacks, updateFeedbackStatus, deleteFeedback, searchQuery } = useFeedback();
    const { user } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    const myFeedbacks = feedbacks.filter(fb =>
        fb.submittedBy && fb.submittedBy._id === user._id &&
        (fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fb.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Stats Calculation
    const total = myFeedbacks.length;
    const pending = myFeedbacks.filter(f => f.status === 'Pending' || f.status === 'Submitted').length;
    const inProgress = myFeedbacks.filter(f => f.status === 'In Progress' || f.status === 'Working').length;
    const resolved = myFeedbacks.filter(f => f.status === 'Resolved' || f.status === 'Closed').length;

    // Helper to render profile content
    const renderProfileContent = () => {
        if (user?.profilePicture) {
            return (
                <img
                    src={`http://localhost:5000/${user.profilePicture}`}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
            );
        }
        return user.name ? user.name.charAt(0).toUpperCase() : 'U';
    };

    const handleCloseFeedback = (id) => {
        if (window.confirm('Are you sure you want to close this feedback?')) {
            updateFeedbackStatus(id, 'Closed');
        }
    };

    return (

        <div className="user-dashboard-content" style={{ padding: '20px' }}>
            {/* Stats Row */}
            <div className="stats-grid">
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Total Feedback</p>
                        <h3 className="stat-value">{total}</h3>
                    </div>
                    <div className="vision-icon"><FaFileAlt /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Pending</p>
                        <h3 className="stat-value">{pending}</h3>
                    </div>
                    <div className="vision-icon" style={{ background: 'linear-gradient(135deg, #FFB75E 0%, #ED8F03 100%)' }}><FaClock /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">In Progress</p>
                        <h3 className="stat-value">{inProgress}</h3>
                    </div>
                    <div className="vision-icon" style={{ background: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)' }}><FaRocket /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Resolved</p>
                        <h3 className="stat-value">{resolved}</h3>
                    </div>
                    <div className="vision-icon" style={{ background: 'linear-gradient(135deg, #01B574 0%, #009357 100%)' }}><FaCheckCircle /></div>
                </div>
            </div>

            {/* Welcome & Quick Action Row */}
            <div className="dashboard-row-2">
                <div className="vision-card welcome-card" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div className="welcome-content" style={{ position: 'relative', zIndex: 2 }}>
                        <p className="welcome-subtitle" style={{ color: '#A0AEC0' }}>Welcome back,</p>
                        <h2 className="welcome-title" style={{ fontSize: '28px', margin: '10px 0' }}>{user.name}</h2>
                        <p className="welcome-text" style={{ color: '#A0AEC0', marginBottom: '20px' }}>
                            We're glad to see you again! <br />
                            Check your feedback status and stay updated.
                        </p>
                        <button className="btn-text" onClick={() => setIsFormOpen(true)}>
                            Read More <span style={{ marginLeft: '5px' }}>→</span>
                        </button>
                    </div>
                    <div className="welcome-blob"></div>
                </div>

                <div className="vision-card quick-action-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <div className="vision-icon" style={{ width: '60px', height: '60px', fontSize: '24px', marginBottom: '15px' }}>
                        <FaPlus />
                    </div>
                    <h3>New Feedback</h3>
                    <p style={{ color: '#A0AEC0', fontSize: '14px', margin: '10px 0 20px' }}>Have something to share?</p>
                    <button className="btn-upgrade" onClick={() => setIsFormOpen(true)} style={{ width: '80%' }}>
                        SUBMIT NOW
                    </button>
                </div>
            </div>

            {/* Feedback List (Moved UP) */}
            <div className="dashboard-row-3" style={{ marginTop: '24px' }}>
                <div className="vision-card" style={{ width: '100%' }}>
                    <div className="card-header-flex" style={{ marginBottom: '20px' }}>
                        <div>
                            <h3>Your History</h3>
                            <p style={{ color: '#A0AEC0', fontSize: '14px' }}>
                                <FaCheckCircle className="inline-icon" style={{ color: '#01B574', marginRight: '5px' }} />
                                <strong>{resolved} done</strong> this month
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: '0 20px 20px' }}>
                        <FilterBar />
                    </div>

                    {myFeedbacks.length === 0 ? (
                        <div className="empty-state" style={{ padding: '20px', textAlign: 'center', color: '#A0AEC0' }}>
                            <p>You haven't submitted any feedback yet.</p>
                        </div>
                    ) : (
                        <table className="vision-table">
                            <thead>
                                <tr>
                                    <th>TITLE</th>
                                    <th>CATEGORY</th>
                                    <th>PRIORITY</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myFeedbacks.map((fb) => (
                                    <tr key={fb._id} onClick={() => setSelectedFeedback(fb)} style={{ cursor: 'pointer' }}>
                                        <td className="company-cell">
                                            <div className="logo-box slack" style={{ background: '#4A90E2' }}>{fb.submittedBy?.name?.charAt(0).toUpperCase() || 'U'}</div>
                                            <span style={{ fontWeight: 600 }}>{fb.title}</span>
                                        </td>
                                        <td style={{ color: '#A0AEC0' }}>{fb.category}</td>
                                        <td>
                                            <span className={`priority ${fb.priority.toLowerCase()}`} style={{
                                                padding: '4px 8px', borderRadius: '8px', fontSize: '10px',
                                                background: fb.priority === 'High' ? 'rgba(227, 26, 26, 0.2)' : 'rgba(1, 181, 116, 0.2)',
                                                color: fb.priority === 'High' ? '#E31A1A' : '#01B574',
                                                fontWeight: 700
                                            }}>
                                                {fb.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="progress-bar" style={{ width: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '6px', marginBottom: '5px' }}>
                                                <div className="fill" style={{
                                                    width: fb.status === 'Resolved' ? '100%' : fb.status === 'In Progress' ? '50%' : '10%',
                                                    background: fb.status === 'Resolved' ? '#01B574' : '#00D2FF',
                                                    height: '100%', borderRadius: '4px'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '10px', color: '#fff' }}>{fb.status}</span>
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            {fb.status === 'Submitted' || fb.status === 'Open' ? (
                                                <button className="btn-text" style={{ fontSize: '10px', color: '#00D2FF' }} onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFeedback(fb);
                                                    setIsFormOpen(true);
                                                }}>EDIT</button>
                                            ) : fb.status === 'Resolved' ? (
                                                <button className="btn-text" style={{ fontSize: '10px', color: '#E31A1A' }} onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCloseFeedback(fb._id);
                                                }}>CLOSE</button>
                                            ) : null}
                                            <button className="btn-text" style={{ fontSize: '12px', color: '#E31A1A', marginLeft: '25px' }} onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Are you sure you want to delete this feedback?')) {
                                                    deleteFeedback(fb._id);
                                                }
                                            }}><FaTrash /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Analytics & Status Overview Row (Moved DOWN) */}
            <div className="dashboard-row-4">
                <div className="vision-card" style={{ minHeight: '200px' }}>
                    <UserAnalyticsChart />
                </div>

                <div className="status-overview-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="vision-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="vision-icon" style={{ width: '40px', height: '40px', fontSize: '16px', background: 'rgba(255, 183, 94, 0.2)', color: '#FFB75E' }}><FaClock /></div>
                        <div>
                            <h4 style={{ margin: 0 }}>Pending</h4>
                            <p style={{ margin: 0, color: '#A0AEC0', fontSize: '12px' }}>{pending} items</p>
                        </div>
                    </div>
                    <div className="vision-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="vision-icon" style={{ width: '40px', height: '40px', fontSize: '16px', background: 'rgba(0, 210, 255, 0.2)', color: '#00D2FF' }}><FaRocket /></div>
                        <div>
                            <h4 style={{ margin: 0 }}>In Progress</h4>
                            <p style={{ margin: 0, color: '#A0AEC0', fontSize: '12px' }}>{inProgress} items</p>
                        </div>
                    </div>
                    <div className="vision-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="vision-icon" style={{ width: '40px', height: '40px', fontSize: '16px', background: 'rgba(1, 181, 116, 0.2)', color: '#01B574' }}><FaCheckCircle /></div>
                        <div>
                            <h4 style={{ margin: 0 }}>Completed</h4>
                            <p style={{ margin: 0, color: '#A0AEC0', fontSize: '12px' }}>{resolved} items</p>
                        </div>
                    </div>
                </div>
            </div>

            {
                isFormOpen && (
                    <FeedbackForm
                        onClose={() => {
                            setIsFormOpen(false);
                            setSelectedFeedback(null);
                        }}
                        initialData={selectedFeedback && selectedFeedback.status === 'Submitted' ? selectedFeedback : null}
                    />
                )
            }
            {
                selectedFeedback && !isFormOpen && (
                    <FeedbackDetail
                        feedback={selectedFeedback}
                        onClose={() => setSelectedFeedback(null)}
                    />
                )
            }
        </div>
    );
};

export default UserDashboard;
