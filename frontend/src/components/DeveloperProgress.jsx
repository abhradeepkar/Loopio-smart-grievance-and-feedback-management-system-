import React, { useState } from 'react';
import { useFeedback } from '../context/FeedbackContext';
import { useAuth } from './AuthProvider';
import DeveloperProductivityChart from './DeveloperProductivityChart';
import {
    FaChartLine, FaCheckDouble, FaHourglassHalf, FaTachometerAlt, FaCalendarAlt
} from 'react-icons/fa';

const DeveloperProgress = () => {
    const { feedbacks, searchQuery } = useFeedback(); // Using global search + local filters
    const { user } = useAuth();

    // Local filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateRange, setDateRange] = useState('All Time'); // 'All Time', 'This Week', 'This Month'

    // 1. Filter my tasks
    const myTasks = feedbacks.filter(fb => fb.assignedTo && fb.assignedTo._id === user._id);

    // 2. Logic for filter application
    const filterByDate = (fb) => {
        if (dateRange === 'All Time') return true;
        const fbDate = new Date(fb.createdAt);
        const now = new Date();
        if (dateRange === 'This Week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return fbDate >= oneWeekAgo;
        }
        if (dateRange === 'This Month') {
            return fbDate.getMonth() === now.getMonth() && fbDate.getFullYear() === now.getFullYear();
        }
        return true;
    };

    const filteredTasks = myTasks.filter(fb => {
        const matchesStatus = statusFilter === 'All'
            ? true
            : statusFilter === 'Completed'
                ? ['Resolved', 'Closed'].includes(fb.status)
                : !['Resolved', 'Closed'].includes(fb.status);

        const matchesSearch = fb.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch && filterByDate(fb);
    });

    // 3. Stats Calculation
    const totalAssigned = myTasks.length;
    const completedCount = myTasks.filter(t => ['Resolved', 'Closed'].includes(t.status)).length;
    const pendingCount = totalAssigned - completedCount;
    // Avg resolution time placeholder (would need diff between createdAt and updatedAt for resolved tasks)
    // Let's calculate for resolved tasks if available
    const resolvedTasks = myTasks.filter(t => ['Resolved', 'Closed'].includes(t.status));
    let avgResolutionDays = 0;
    if (resolvedTasks.length > 0) {
        const totalDays = resolvedTasks.reduce((acc, curr) => {
            const start = new Date(curr.createdAt);
            const end = new Date(curr.updatedAt);
            return acc + (end - start);
        }, 0);
        avgResolutionDays = Math.round((totalDays / resolvedTasks.length) / (1000 * 60 * 60 * 24));
    }


    return (
        <div className="dashboard-content">
            {/* Summary Section */}
            <section className="dashboard-section section-stats">
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Total Assigned</p>
                        <h3 className="stat-value">{totalAssigned}</h3>
                    </div>
                    <div className="vision-icon"><FaChartLine /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Tasks Completed</p>
                        <h3 className="stat-value">{completedCount}</h3>
                        <span className="stat-change positive">Keep it up!</span>
                    </div>
                    <div className="vision-icon icon-success"><FaCheckDouble /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Pending / Active</p>
                        <h3 className="stat-value">{pendingCount}</h3>
                    </div>
                    <div className="vision-icon icon-info"><FaHourglassHalf /></div>
                </div>
                <div className="vision-card stat-card">
                    <div className="stat-content">
                        <p className="stat-label">Avg. Resolution</p>
                        <h3 className="stat-value">{avgResolutionDays} <span style={{ fontSize: '14px' }}>days</span></h3>
                    </div>
                    <div className="vision-icon icon-warn"><FaTachometerAlt /></div>
                </div>
            </section>

            {/* Charts Section */}
            <section className="dashboard-section section-charts progress-charts">
                <div className="vision-card productivity-card" style={{ gridColumn: 'span 1' }}>
                    <DeveloperProductivityChart />
                </div>

                {/* Focus Areas Breakdown */}
                <div className="vision-card focus-card">
                    <h3>Focus Areas</h3>
                    <p className="sub-text">Distribution of your assigned tasks</p>

                    <div className="metrics-list" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {['Software Issue', 'Feature Request', 'HR Issue', 'Project Issue', 'Workplace Issue', 'Other'].map(cat => {
                            const count = myTasks.filter(t => t.category === cat).length;
                            const percentage = totalAssigned > 0 ? (count / totalAssigned) * 100 : 0;

                            // Hide categories with 0 count to keep it clean? Or show all?
                            // User asked "why 0%", so showing 0 is fine, but maybe let's show all to be explicit.
                            // Actually, let's keep showing all so they know what IS tracked.

                            let color = '#FFB75E'; // Default
                            if (cat.includes('Issue') || cat === 'Software Issue') color = '#FF5C5C'; // Issues red-ish
                            if (cat === 'Feature Request') color = '#FFC107'; // Yellow for features
                            if (cat === 'HR Issue') color = '#9C27B0'; // Purple distinct color
                            if (cat === 'Project Issue') color = '#01B574'; // Green distinct color
                            if (cat === 'Workplace Issue') color = '#E91E63'; // Pink distinct color

                            if (percentage === 0 && totalAssigned > 0) {
                                // Optional: You could hide 0% items, but let's leave them for now as per user request context
                            }

                            return (
                                <div key={cat} className="metric-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--vision-text-main)' }}>{cat}</span>
                                        <span style={{ color: 'var(--vision-text-muted)' }}>{count} ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${percentage}%`,
                                            background: color,
                                            borderRadius: '3px',
                                            transition: 'width 1s ease'
                                        }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Detailed Progress List */}
            <section className="dashboard-section section-table">
                <div className="vision-card table-card">
                    <div className="card-header-flex" style={{ flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h3>Task Progress</h3>
                            <p className="card-subtitle">Track your completion status</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {/* Date Filter */}
                            <select
                                className="filter-select"
                                style={{ minWidth: '120px' }}
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="All Time" style={{ backgroundColor: 'var(--vision-card-bg)', color: 'var(--vision-text-main)' }}>All Time</option>
                                <option value="This Month" style={{ backgroundColor: 'var(--vision-card-bg)', color: 'var(--vision-text-main)' }}>This Month</option>
                                <option value="This Week" style={{ backgroundColor: 'var(--vision-card-bg)', color: 'var(--vision-text-main)' }}>This Week</option>
                            </select>

                            {/* Status Filter */}
                            <select
                                className="filter-select"
                                style={{ minWidth: '120px' }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All" style={{ backgroundColor: 'var(--vision-card-bg)', color: 'var(--vision-text-main)' }}>All Status</option>
                                <option value="Completed" style={{ backgroundColor: 'var(--vision-card-bg)', color: 'var(--vision-text-main)' }}>Completed</option>
                                <option value="Pending" style={{ backgroundColor: 'var(--vision-card-bg)', color: 'var(--vision-text-main)' }}>Pending</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive" style={{ marginTop: '20px' }}>
                        <table className="vision-table">
                            <thead>
                                <tr>
                                    <th>TASK DETAILS</th>
                                    <th>PRIORITY</th>
                                    <th>STATUS</th>
                                    <th>PROGRESS</th>
                                    <th>DATES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTasks.map(fb => {
                                    // Calculate progress percentage based on status
                                    let progress = 0;
                                    if (fb.status === 'Submitted') progress = 10;
                                    else if (fb.status === 'Pending') progress = 25;
                                    else if (fb.status === 'In Progress') progress = 50;
                                    else if (fb.status === 'Working') progress = 75;
                                    else if (['Resolved', 'Closed'].includes(fb.status)) progress = 100;

                                    return (
                                        <tr key={fb._id}>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span className="title-text">{fb.title}</span>
                                                    <span style={{ fontSize: '11px', color: 'var(--vision-text-muted)' }}>#{fb._id.slice(-6)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`priority-badge ${fb.priority.toLowerCase()}`}>
                                                    {fb.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${fb.status.toLowerCase().replace(' ', '-')}`}>
                                                    {fb.status}
                                                </span>
                                            </td>
                                            <td style={{ width: '25%', minWidth: '150px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                                                        <div style={{
                                                            width: `${progress}%`,
                                                            height: '100%',
                                                            background: progress === 100 ? '#01B574' : '#00D2FF',
                                                            borderRadius: '3px',
                                                            transition: 'width 0.5s ease'
                                                        }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '11px', fontWeight: '600' }}>{progress}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', color: 'var(--vision-text-muted)' }}>
                                                    <span>Start: {new Date(fb.createdAt).toLocaleDateString()}</span>
                                                    {['Resolved', 'Closed'].includes(fb.status) && (
                                                        <span style={{ color: '#01B574' }}>Done: {new Date(fb.updatedAt).toLocaleDateString()}</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredTasks.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--vision-text-muted)' }}>
                                            No tasks found for this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DeveloperProgress;
