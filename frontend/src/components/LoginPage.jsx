import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import './LoginPage.css';
import loopioLogo from '../assets/Loopio_logo_.png';
import Popup from './Popup';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        console.log('Form submitted. Mode:', isLogin ? 'Login' : 'Register');

        let res;
        try {
            if (isLogin) {
                res = await login(email, password);
            } else {
                console.log('Registering with:', { name, email, role }); // Don't log password
                // Pass false to skip auto-login so we can show the popup
                res = await register(name, email, password, role, false);
            }

            console.log('Auth response:', res);

            if (res.success) {
                // If registration, show popup and stay on page (switch to login)
                if (!isLogin) {
                    setIsLoading(false);
                    setShowSuccessPopup(true);
                    return;
                }

                // Redirect based on role
                const userRole = res.role || role; // Use role from response or state
                console.log('Redirecting to dashboard for role:', userRole);

                switch (userRole) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'developer':
                        navigate('/developer');
                        break;
                    case 'user':
                    default:
                        navigate('/user');
                        break;
                }
            } else {
                setError(res.message || 'Authentication failed');
            }
        } catch (err) {
            console.error('HandleSubmit error:', err);
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="logo-container">
                    <div className="logo-icon">
                        <img src={loopioLogo} alt="Loopio Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    </div>
                    <h1 className="brand-name">Loopio</h1>
                </div>

                <div className="header-text">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="subtitle">
                        {isLogin ? 'Login to continue your journey' : 'Sign up to get started with Loopio'}
                    </p>
                </div>

                {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {isLogin && (
                        <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                            <span
                                onClick={() => navigate('/forgot-password')}
                                style={{ color: '#007bff', cursor: 'pointer', fontSize: '14px' }}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    )}

                    {!isLogin && (
                        <select
                            className="select-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="developer">Developer</option>
                        </select>
                    )}

                    <button type="submit" className="btn" disabled={isLoading}>
                        {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <p className="bottom-text">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? 'Create one' : 'Login'}
                    </span>
                </p>
            </div>


            <Popup
                isOpen={showSuccessPopup}
                onClose={() => {
                    setShowSuccessPopup(false);
                    setIsLogin(true); // Switch to login mode
                    setError(''); // Clear any errors
                }}
                title="Registration Successful"
                message="Registration done! Now you can log in."
                type="success"
                confirmText="OK"
            />
        </div >
    );
};

export default LoginPage;
