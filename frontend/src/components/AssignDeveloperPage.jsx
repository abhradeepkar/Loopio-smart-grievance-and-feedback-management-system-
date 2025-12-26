import React, { useState, useEffect } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { FaSearch, FaCheckCircle, FaUserSecret, FaBolt } from 'react-icons/fa';
import './AdminDashboard.css';

const AssignDeveloperPage = () => {
    const { users, feedbacks, assignDeveloper, refreshFeedbacks } = useFeedback(); // refreshFeedbacks might need to be exposed in Context
    const [developers, setDevelopers] = useState([]);
    const [selectedFeedbackMap, setSelectedFeedbackMap] = useState({});
    const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

    // Filter developers from users
    useEffect(() => {
        if (users) {
            setDevelopers(users.filter(u => u.role === 'developer'));
        }
    }, [users]);

    // Get feedbacks that are NOT Closed/Resolved and NOT assigned
    const assignableFeedbacks = feedbacks.filter(fb => fb.status !== 'Closed' && fb.status !== 'Resolved');

    const handleFeedbackSelect = (devId, feedbackId) => {
        // Find the selected feedback
        const selectedFb = feedbacks.find(fb => fb._id === feedbackId);

        // Check if already assigned
        if (selectedFb && selectedFb.assignedTo) {
            const assigneeName = selectedFb.assignedTo.name || 'another developer';
            setToast({ message: `Task already assigned to ${assigneeName}`, type: 'error' });

            // Clear toast after 3s
            setTimeout(() => setToast(null), 3000);
            return; // Prevent selection
        }

        setSelectedFeedbackMap(prev => ({
            ...prev,
            [devId]: feedbackId
        }));
    };

    const handleAssign = async (devId) => {
        const feedbackId = selectedFeedbackMap[devId];
        if (!feedbackId) return;

        // In a real app we'd call the API. Simulating success here or using context if available.
        // assignDeveloper(feedbackId, devId); <-- context function
        await assignDeveloper(feedbackId, devId);

        // Show toast
        const devName = developers.find(d => d._id === devId)?.name || 'Developer';
        setToast({ message: `Feedback assigned successfully to ${devName}!`, type: 'success' });

        // Reset selection
        setSelectedFeedbackMap(prev => ({ ...prev, [devId]: '' }));

        // Hide toast after 3s
        setTimeout(() => setToast(null), 3000);
    };

    // Helper to count assignments
    const getAssignmentStats = (devId) => {
        const assigned = feedbacks.filter(fb => fb.assignedTo && fb.assignedTo._id === devId);
        const pending = assigned.filter(fb => fb.status === 'Pending' || fb.status === 'In Progress').length;
        return { total: assigned.length, pending };
    };

    return (
        <div className="vision-card assign-dev-card" style={{ marginTop: '20px', position: 'relative' }}>
            {/* Toast Notification */}
            {toast && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.type === 'error' ? <FaUserSecret /> : <FaCheckCircle />}
                    {toast.message}
                </div>
            )}

            <div className="card-header-flex" style={{ marginBottom: '20px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>Assign Developers</h3>
                    <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#A0AEC0' }}>
                        Manage workload and assign pending tasks
                    </p>
                </div>
            </div>

            <div className="table-container" style={{ overflowX: 'auto' }}>
                <table className="vision-table">
                    <thead>
                        <tr>
                            <th>DEVELOPER NAME</th>
                            <th>EMAIL</th>
                            <th>ASSIGNED COUNT</th>
                            <th>PENDING ASSIGNMENTS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {developers.map((dev) => {
                            const { total, pending } = getAssignmentStats(dev._id);
                            return (
                                <tr key={dev._id}>
                                    <td className="company-cell">
                                        <div className="logo-box slack" style={{ background: '#7F00FF' }}>{dev.name.charAt(0).toUpperCase()}</div>
                                        <span style={{ fontWeight: '600' }}>{dev.name}</span>
                                    </td>
                                    <td>{dev.email}</td>
                                    <td style={{ textAlign: 'center' }}>{total}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        {pending} <span style={{ fontSize: '10px', color: '#FFB547' }}>active</span>
                                    </td>
                                    <td style={{ minWidth: '200px' }}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <select
                                                className="assign-select"
                                                style={{ maxWidth: '150px' }}
                                                value={selectedFeedbackMap[dev._id] || ''}
                                                onChange={(e) => handleFeedbackSelect(dev._id, e.target.value)}
                                            >
                                                <option value="">Select Task...</option>
                                                {assignableFeedbacks.map(fb => (
                                                    <option key={fb._id} value={fb._id}>
                                                        {fb.title.length > 20 ? fb.title.substring(0, 20) + '...' : fb.title}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                className="update-btn"
                                                disabled={!selectedFeedbackMap[dev._id]}
                                                onClick={() => handleAssign(dev._id)}
                                            >
                                                ASSIGN
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {developers.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#A0AEC0' }}>No developers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignDeveloperPage;
