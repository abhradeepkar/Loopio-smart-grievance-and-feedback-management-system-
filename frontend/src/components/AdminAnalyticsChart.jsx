import React from 'react';
import { useFeedback } from '../context/FeedbackContext';
import './AdminAnalyticsChart.css';

const AdminAnalyticsChart = () => {
    const { analytics } = useFeedback();

    const statusData = analytics?.status || {};
    const categoryData = analytics?.category || {};
    const total = analytics?.total || 0;

    console.log('AdminAnalyticsChart: Logic Update', { statusData, categoryData, total });

    // Calculate Status Distribution (Map DB statuses to Display statuses)
    // DB Enums: ['Submitted', 'Pending', 'In Progress', 'Working', 'Resolved', 'Closed', 'Open', 'Declined']
    const statusCounts = {
        'Open': (statusData['Open'] || 0),
        'Pending': (statusData['Pending'] || 0) + (statusData['Submitted'] || 0),
        'In Progress': (statusData['In Progress'] || 0) + (statusData['Working'] || 0),
        'Resolved': (statusData['Resolved'] || 0),
        'Closed': (statusData['Closed'] || 0),
        'Declined': (statusData['Declined'] || 0)
    };

    console.log('AdminAnalyticsChart: Mapped Counts', statusCounts);

    const statuses = ['Open', 'Pending', 'In Progress', 'Resolved', 'Closed', 'Declined'];

    // Calculate Category Distribution
    const categoryCounts = categoryData;
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
