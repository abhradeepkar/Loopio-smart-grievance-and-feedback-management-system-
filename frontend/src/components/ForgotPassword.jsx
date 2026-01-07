import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import './LoginPage.css'; // Reusing Login styles
import loopioLogo from '../assets/Loopio_logo_.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/forgotpassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Email sent! Check your inbox for the reset link.');
            } else {
                setError(data.message || 'Something went wrong');
            }
        } catch (err) {
            setError('Failed to connect to the server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="logo-container">
                    <img src={loopioLogo} alt="Loopio Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <h1 className="brand-name">Loopio</h1>
                </div>

                <div className="header-text">
                    <h2>Forgot Password</h2>
                    <p className="subtitle">Enter your email to reset your password</p>
                </div>

                {message && <p style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}>{message}</p>}
                {error && <p className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="btn" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="bottom-text">
                    Rememberied it?
                    <span onClick={() => navigate('/login')}> Login</span>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
