import React from 'react';
import { useFeedback } from '../context/FeedbackContext';
import './AdminAnalyticsChart.css';

const AdminAnalyticsChart = () => {
    const { feedbacks } = useFeedback();

    const safeFeedbacks = Array.isArray(feedbacks) ? feedbacks : [];

    // Calculate Status Distribution
    const statusCounts = safeFeedbacks.reduce((acc, fb) => {
        let status = fb.status || 'Unknown';
        if (status === 'Submitted') {
            status = 'Pending';
        }
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const total = safeFeedbacks.length;
    const statuses = ['Open', 'Pending', 'In Progress', 'Resolved', 'Closed', 'Declined'];

    // Calculate Category Distribution
    const categoryCounts = safeFeedbacks.reduce((acc, fb) => {
        const category = fb.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    const categories = Object.keys(categoryCounts);
    const maxCount = Math.max(...Object.values(statusCounts), 1);

    return (
        <div className="analytics-charts">
            <div className="chart-container">
                <h3>Feedback Status Distribution</h3>
                <div className="bar-chart">
                    {statuses.map(status => {
                        const count = statusCounts[status] || 0;
                        const height = total > 0 ? (count / maxCount) * 100 : 0;

                        return (
                            <div key={status} className="bar-group">
                                <div className="bar-wrapper">
                                    <div
                                        className={`bar ${status.toLowerCase().replace(' ', '-')}`}
                                        style={{ height: `${height}%` }}
                                        title={`${status}: ${count}`}
                                    >
                                        <span className="bar-value">{count}</span>
                                    </div>
                                </div>
                                <span className={`bar-label ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="chart-container">
                <h3>Category Breakdown</h3>
                <div className="category-list">
                    {categories.map(cat => (
                        <div key={cat} className="category-item">
                            <div className="category-info">
                                <span className="category-name">{cat}</span>
                                <span className="category-count">{categoryCounts[cat]}</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${(categoryCounts[cat] / total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsChart;
