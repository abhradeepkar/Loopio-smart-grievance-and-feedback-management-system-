import React, { useState } from 'react';
import './UserAnalyticsChart.css';

import { useFeedback } from '../context/FeedbackContext';

const UserAnalyticsChart = () => {
    const { analytics } = useFeedback();
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Data Source: Priority
    // Keys in DB: 'Low', 'Medium', 'High'
    const priorityData = analytics?.priority || {};
    // Helper to get count case-insensitively
    const getCount = (key) => priorityData[key] || priorityData[key.toLowerCase()] || 0;

    // Process data for Pie Chart
    const chartData = [
        { label: 'High', value: getCount('High'), color: '#E31A1A' }, // Red
        { label: 'Medium', value: getCount('Medium'), color: '#FFB75E' }, // Yellow
        { label: 'Low', value: getCount('Low'), color: '#01B574' }  // Green
    ];

    const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

    // Calculate accumulation for start angles
    let accumulatedAngle = 0;

    // Helper to calculate coordinates
    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    }

    const slices = chartData.map((slice, index) => {
        if (total === 0) return null;

        const percent = slice.value / total;

        let pathData;

        if (percent > 0.999) {
            // Full circle (two arcs) to avoid zero-length path issue
            pathData = `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0 Z`;
        } else {
            const startPath = getCoordinatesForPercent(accumulatedAngle);
            // Add current percent to accumulated
            accumulatedAngle += percent;
            const endPath = getCoordinatesForPercent(accumulatedAngle);

            const largeArcFlag = percent > 0.5 ? 1 : 0;

            // Path data
            pathData = `M 0 0 L ${startPath[0]} ${startPath[1]} A 1 1 0 ${largeArcFlag} 1 ${endPath[0]} ${endPath[1]} Z`;
        }

        return { ...slice, pathData, index };
    }).filter(item => item !== null && item.value > 0);

    // If empty data, show gray circle
    const isEmpty = total === 0;

    return (
        <div className="user-analytics-chart">
            <div className="chart-header" style={{ marginBottom: '5px' }}>
                <h3>Priority Overview</h3>
                <p>
                    <span className="growth-indicator">
                        {total} Total
                    </span>{' '}
                    Feedbacks
                </p>
            </div>

            {/* Reduced height container - explicitly set to 150px as requested for 'smaller' */}
            <div className="chart-body" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ height: '100%', transform: 'rotate(-90deg)' }}>
                    {isEmpty ? (
                        <circle cx="0" cy="0" r="1" fill="#2D3748" />
                    ) : (
                        slices.map((slice, i) => (
                            <path
                                key={i}
                                d={slice.pathData}
                                fill={slice.color}
                                stroke="rgba(15, 21, 53, 1)"
                                strokeWidth="0.05"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                style={{
                                    transition: 'all 0.3s ease',
                                    transform: hoveredIndex === i ? 'scale(1.05)' : 'scale(1)',
                                    cursor: 'pointer',
                                    opacity: hoveredIndex === null || hoveredIndex === i ? 1 : 0.6
                                }}
                            />
                        ))
                    )}
                </svg>

                {/* Legend / Tooltip Overlay */}
                {hoveredIndex !== null && !isEmpty && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        textAlign: 'center',
                        background: 'rgba(0,0,0,0.8)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backdropFilter: 'blur(4px)',
                        zIndex: 10
                    }}>
                        <div style={{ color: slices[hoveredIndex].color, fontWeight: 'bold' }}>{slices[hoveredIndex].label}</div>
                        <div style={{ color: '#fff', fontSize: '12px' }}>{slices[hoveredIndex].value}</div>
                    </div>
                )}
            </div>

            <div className="chart-labels" style={{ justifyContent: 'center', gap: '15px', marginTop: '5px' }}>
                {chartData.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }}></div>
                        <span style={{ fontSize: '10px', color: '#A0AEC0' }}>{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserAnalyticsChart;
