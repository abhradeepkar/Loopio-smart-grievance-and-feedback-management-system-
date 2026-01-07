import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useTheme } from '../context/ThemeContext';
import { useFeedback } from '../context/FeedbackContext';
import NotificationBell from './NotificationBell';
import {
    FaHome, FaList, FaUser, FaSignOutAlt, FaExclamationTriangle,
    FaChartLine, FaBars, FaTimes, FaCog, FaSun, FaMoon, FaUserCircle
} from 'react-icons/fa';
import './DeveloperDashboard.css';
import loopioLogo from '../assets/Loopio_logo_.png';

const DeveloperLayout = ({ onProfileClick }) => {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { searchQuery, setSearchQuery } = useFeedback();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Helper to render profile content
    const renderProfileContent = () => {
        if (user?.profilePicture) {
            return (
                <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${user.profilePicture}`}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
            );
        }
        return user.name ? user.name.charAt(0).toUpperCase() : 'D';
    };

    return (
        <div className="vision-dashboard">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside className={`vision-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header-mobile">
                    <div className="logo-icon">
                        <img src={loopioLogo} alt="Loopio Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span className="logo-text">Loopio <span className="dashboard-section-label">Dev Section</span></span>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}>
                        <FaTimes />
                    </button>
                </div>

                <nav className="sidebar-nav" style={{ marginTop: '20px' }}>
                    <NavLink to="/developer" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaHome /></div>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/developer/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaList /></div>
                        <span>Assigned Tasks</span>
                    </NavLink>
                    <NavLink to="/developer/feedback-to-fix" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaExclamationTriangle /></div>
                        <span>Feedback to Fix</span>
                    </NavLink>
                    <NavLink to="/developer/progress" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaChartLine /></div>
                        <span>Progress</span>
                    </NavLink>
                    <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onProfileClick(); }}>
                        <div className="icon-box"><FaUserCircle /></div>
                        <span>Profile</span>
                    </a>
                    <NavLink to="/developer/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaCog /></div>
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer-card">
                    <div className="logo-icon" style={{ width: '32px', height: '32px', marginBottom: '5px', background: 'transparent' }}>
                        <img src={loopioLogo} alt="Loopio Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <p>© 2025 LOOPIO</p>
                    <button className="btn-text" onClick={() => window.location.href = '/'} style={{ fontSize: '12px', color: '#E31A1A', marginTop: '5px' }}>
                        Log Out
                    </button>
                </div>
            </aside>

            <main className="vision-main">
                {/* Header */}
                <header className="vision-header">
                    <div className="header-left">
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <FaBars />
                        </button>
                        <div className="logo-icon">
                            <img src={loopioLogo} alt="Loopio Logo" />
                        </div>
                        <span className="logo-text">Loopio <span className="dashboard-section-label">Dev Section</span></span>
                    </div>

                    <div className="header-actions">
                        <div className="search-bar">
                            <input type="text" placeholder="Type here..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                        </button>
                        <NotificationBell />

                        <div className="profile-section">
                            <div className="profile-bubble" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
                                {renderProfileContent()}
                            </div>
                            {isProfileMenuOpen && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-item" onClick={() => { setIsProfileMenuOpen(false); onProfileClick(); }}>
                                        <FaUser /> Profile
                                    </div>
                                    <div className="dropdown-item danger" onClick={() => { setIsProfileMenuOpen(false); window.location.href = '/'; }}>
                                        <FaSignOutAlt /> Log Out
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <Outlet />
            </main>
        </div>
    );
};

export default DeveloperLayout;
