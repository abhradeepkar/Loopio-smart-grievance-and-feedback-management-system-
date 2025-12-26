import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useTheme } from '../context/ThemeContext';
import { useFeedback } from '../context/FeedbackContext';
import NotificationBell from './NotificationBell';
import {
    FaBars, FaTimes, FaHome, FaFileAlt, FaUser, FaCog,
    FaSun, FaMoon, FaSignOutAlt, FaUsers, FaUserPlus, FaUserCircle
} from 'react-icons/fa';
import './AdminDashboard.css';
import loopioLogo from '../assets/Loopio_logo_.png';

const AdminLayout = ({ onProfileClick }) => {
    const { user } = useAuth(); // Get user from context
    const { theme, toggleTheme } = useTheme();
    const { searchQuery, setSearchQuery } = useFeedback();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    // const navigate = useNavigate(); // Not currently used but good to have

    // User Initial for Profile Bubble
    const adminName = user?.name || "Admin User";
    const userInitial = adminName.charAt(0).toUpperCase();

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
        return userInitial;
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
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99, backdropFilter: 'blur(4px)'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside className={`vision-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header-mobile">
                    <div className="logo-icon">
                        <img src={loopioLogo} alt="Loopio Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <span className="logo-text">Loopio <span className="dashboard-section-label">Admin Section</span></span>
                    <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '20px', cursor: 'pointer' }}>
                        <FaTimes />
                    </button>
                </div>

                <nav className="sidebar-nav" style={{ marginTop: '20px' }}>
                    <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaHome /></div>
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/feedbacks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaFileAlt /></div>
                        <span>All Feedback</span>
                    </NavLink>

                    <NavLink to="/admin/assign" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaUserPlus /></div>
                        <span>Assign Developer</span>
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <div className="icon-box"><FaUsers /></div>
                        <span>Users</span>
                    </NavLink>
                    <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); onProfileClick(); }}>
                        <div className="icon-box"><FaUserCircle /></div>
                        <span>Profile</span>
                    </a>
                    <NavLink to="/admin/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '24px', marginRight: '15px', cursor: 'pointer' }}>
                            <FaBars />
                        </button>
                        <div className="logo-icon">
                            <img src={loopioLogo} alt="Loopio Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        </div>
                        <span className="logo-text">Loopio <span className="dashboard-section-label">Admin Section</span></span>
                    </div>

                    <div className="header-actions">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search feedbacks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <button className="theme-toggle" onClick={toggleTheme}>
                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                        </button>
                        <NotificationBell />

                        <div className="profile-section">
                            <div className="profile-bubble" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                                {renderProfileContent()}
                            </div>
                            {showProfileMenu && (
                                <div className="profile-dropdown">
                                    <div className="dropdown-item" onClick={() => { setShowProfileMenu(false); onProfileClick(); }}>
                                        <FaUser /> Profile
                                    </div>
                                    <div className="dropdown-item danger" onClick={() => { setShowProfileMenu(false); window.location.href = '/'; }}>
                                        <FaSignOutAlt /> Log Out
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Render the Page Content */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
