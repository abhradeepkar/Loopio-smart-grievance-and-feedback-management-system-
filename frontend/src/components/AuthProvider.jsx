import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await fetch(`${API_URL}/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data);
                    } else {
                        localStorage.removeItem('token');
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                setUser(data);
                showToast(`Welcome back, ${data.name}!`, 'success');
                return { success: true, role: data.role }; // Return role
            }
            showToast(data.message || 'Login failed', 'error');
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Login error:', error);
            showToast('Network error. Is the server running?', 'error');
            return { success: false, message: 'Network error. Is the server running?' };
        }
    };

    const register = async (name, email, password, role, autoLogin = true) => {
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });
            const data = await res.json();
            if (res.ok) {
                if (autoLogin) {
                    localStorage.setItem('token', data.token);
                    setUser(data);
                    showToast('Registration successful! Welcome.', 'success');
                }
                return { success: true, role: data.role }; // Return role
            }
            showToast(data.message || 'Registration failed', 'error');
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Network error. Is the server running?', 'error');
            return { success: false, message: 'Network error. Is the server running?' };
        }
    };

    const updateProfile = async (userData) => {
        const token = localStorage.getItem('token');
        let headers = {
            Authorization: `Bearer ${token}`
        };
        let body;

        if (userData instanceof FormData) {
            // Browser sets Content-Type for FormData automatically
            body = userData;
        } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(userData);
        }

        try {
            const res = await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: headers,
                body: body
            });
            const data = await res.json();
            if (res.ok) {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                setUser(prev => ({ ...prev, ...data }));
                showToast('Profile updated successfully!', 'success');
                return { success: true };
            }
            showToast(data.message || 'Update failed', 'error');
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Profile update error:', error);
            showToast('Failed to update profile. Network error.', 'error');
            return { success: false, message: 'Network error' };
        }
    };

    const deleteAccount = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/me`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                logout();
                showToast('Account deleted successfully.', 'info');
                return { success: true };
            }
            showToast(data.message || 'Delete failed', 'error');
            return { success: false, message: data.message };
        } catch (error) {
            console.error('Delete account error:', error);
            showToast('Network error during deletion', 'error');
            return { success: false, message: 'Network error' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        showToast('Logged out successfully', 'info');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, deleteAccount, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
