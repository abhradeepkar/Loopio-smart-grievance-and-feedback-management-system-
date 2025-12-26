import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaChartLine, FaUsers, FaCogs, FaGithub, FaGoogle, FaLinkedin, FaFacebook, FaStar, FaBolt, FaUserShield, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import './HomePage.css';
import dashboardPreview from '../assets/dashboard-Preview.png';
import loopioLogo from '../assets/Loopio_logo_.png';

import { useTheme } from '../context/ThemeContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="hp-wrapper">
            {/* Ambient Background */}
            <div className="hp-background">
                <div className="hp-blob hp-blob-1"></div>
                <div className="hp-blob hp-blob-2"></div>
            </div>

            {/* Navbar */}
            <nav className="hp-navbar">
                <div className="hp-logo">
                    <img src={loopioLogo} alt="Loopio" style={{ height: '40px', verticalAlign: 'middle', marginRight: '10px' }} />
                    Loopio
                </div>

                {/* Desktop Nav */}
                <div className="hp-nav-links">
                    <a href="#features" className="hp-nav-link">Features</a>
                    <a href="#integrations" className="hp-nav-link">Integrations</a>
                    <a href="#testimonials" className="hp-nav-link">Stories</a>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button className="hp-btn-login" onClick={() => navigate('/login')}>Login</button>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? <FaMoon /> : <FaSun />}
                    </button>
                    {/* Mobile Hamburger */}
                    <button className="hp-mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <FaBars />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`hp-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <button className="hp-mobile-close" onClick={() => setIsMobileMenuOpen(false)}>
                    <FaTimes />
                </button>
                <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                <a href="#integrations" onClick={() => setIsMobileMenuOpen(false)}>Integrations</a>
                <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)}>Stories</a>
                <button className="theme-toggle" onClick={toggleTheme} style={{ fontSize: '2rem' }}>
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
                <button className="hp-btn-login-mobile" onClick={() => navigate('/login')}>Login</button>
            </div>

            {/* Hero Section */}
            <header className="hp-hero">
                <h1 className="hp-headline">Manage all your feedback<br />in one place</h1>
                <p className="hp-subheadline">
                    Collect, analyze, and improve your products with our powerful feedback management system. Designed for teams who care about user experience.
                </p>
                <button className="hp-btn-cta" onClick={() => navigate('/login')}>
                    Get Started <FaRocket style={{ marginLeft: '10px' }} />
                </button>

                <div className="hp-dashboard-preview">
                    <img src={dashboardPreview} alt="Dashboard Preview" />
                </div>
            </header >

            {/* Features Section */}
            < section id="features" className="hp-features" >
                <div className="hp-feature-card">
                    <div className="hp-feature-icon"><FaUsers /></div>
                    <h3 className="hp-feature-title">Collect Feedback</h3>
                    <p className="hp-feature-desc">Gather insights directly from your users with intuitive forms and widgets.</p>
                </div>
                <div className="hp-feature-card">
                    <div className="hp-feature-icon"><FaCogs /></div>
                    <h3 className="hp-feature-title">Manage Responses</h3>
                    <p className="hp-feature-desc">Organize feedback with powerful tagging, filtering, and assignment tools.</p>
                </div>
                <div className="hp-feature-card">
                    <div className="hp-feature-icon"><FaChartLine /></div>
                    <h3 className="hp-feature-title">Analyze Reports</h3>
                    <p className="hp-feature-desc">Visualize trends and metrics to make data-driven product decisions.</p>
                </div>
                <div className="hp-feature-card">
                    <div className="hp-feature-icon"><FaRocket /></div>
                    <h3 className="hp-feature-title">Automation</h3>
                    <p className="hp-feature-desc">Automate your workflow with smart triggers and integrations.</p>
                </div>
                <div className="hp-feature-card">
                    <div className="hp-feature-icon"><FaBolt /></div>
                    <h3 className="hp-feature-title">Real-Time Updates</h3>
                    <p className="hp-feature-desc">Feedback status, developer responses, and dashboard analytics update instantly without reload.</p>
                </div>
                <div className="hp-feature-card">
                    <div className="hp-feature-icon"><FaUserShield /></div>
                    <h3 className="hp-feature-title">Multi-Role Access</h3>
                    <p className="hp-feature-desc">Separate dashboards for Admin, Developer, and User with secure access control.</p>
                </div>
            </section >

            {/* Integrations Section */}
            < section id="integrations" className="hp-integrations" >
                <h2 className="hp-section-title">Works with your favorite tools</h2>
                <div className="hp-logos-grid">
                    <div className="hp-logo-item" style={{ color: '#EA4335' }}><FaGoogle style={{ marginRight: '10px' }} /> Google</div>
                    <div className="hp-logo-item" style={{ color: '#A78BFA' }}><FaGithub style={{ marginRight: '10px' }} /> GitHub</div>
                    <div className="hp-logo-item" style={{ color: '#FF6B35' }}><FaLinkedin style={{ marginRight: '10px' }} /> LinkedIn</div>
                    <div className="hp-logo-item" style={{ color: '#00FF88' }}><FaFacebook style={{ marginRight: '10px' }} /> Meta</div>
                </div>
            </section >

            {/* Testimonials / Stats */}
            < section id="testimonials" className="hp-features" style={{ paddingBottom: '150px' }}>
                <div className="hp-feature-card" style={{ textAlign: 'center' }}>
                    <div style={{ color: '#FFD700', fontSize: '20px', marginBottom: '10px' }}>★★★★★</div>
                    <p className="hp-feature-desc" style={{ fontStyle: 'italic', fontSize: '18px' }}>"This platform revolutionized how we handle user requests. Absolutely essential."</p>
                    <p style={{ marginTop: '20px', fontWeight: 'bold' }}>— Alex D., Product Manager</p>
                </div>
                <div className="hp-feature-card" style={{ textAlign: 'center' }}>
                    <h3 className="hp-feature-title" style={{ fontSize: '36px', color: '#00C2FF' }}>10k+</h3>
                    <p className="hp-feature-desc">Feedback items resolved</p>
                </div>
                <div className="hp-feature-card" style={{ textAlign: 'center' }}>
                    <h3 className="hp-feature-title" style={{ fontSize: '36px', color: '#0075FF' }}>99%</h3>
                    <p className="hp-feature-desc">Customer satisfaction</p>
                </div>
            </section >

            {/* Footer */}
            < footer className="hp-footer" >
                <div className="hp-logo" style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
                    <img src={loopioLogo} alt="Loopio" style={{ height: '30px', marginRight: '10px' }} />
                    Loopio
                </div>
                <div className="hp-footer-text">© 2025 Loopio Feedback Management. All rights reserved.</div>
                <div className="hp-nav-links" style={{ gap: '20px' }}>
                    <a href="#" className="hp-nav-link" style={{ fontSize: '12px' }}>Privacy</a>
                    <a href="#" className="hp-nav-link" style={{ fontSize: '12px' }}>Terms</a>
                </div>
            </footer >
        </div >
    );
};

export default HomePage;
