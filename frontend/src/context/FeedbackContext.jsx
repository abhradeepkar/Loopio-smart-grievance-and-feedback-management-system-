import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../components/AuthProvider';
import { useToast } from './ToastContext';

const FeedbackContext = createContext();
const API_URL = 'http://localhost:5000/api/feedbacks';
const AUTH_URL = 'http://localhost:5000/api/auth';

export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider = ({ children }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [users, setUsers] = useState([]); // This will store developers for assignment
    const [allUsers, setAllUsers] = useState([]); // This stores ALL users for management
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: '', priority: '', category: '' });
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [analytics, setAnalytics] = useState({ total: 0, status: {}, priority: {}, category: {} });
    const [notifications, setNotifications] = useState([]);

    const { showToast } = useToast();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`http://localhost:5000/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markNotificationAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Update UI optimistically
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
            showToast('Failed to update notification', 'error');
        }
    };

    const clearNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5000/api/notifications`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications([]);
            showToast('Notifications cleared', 'success');
        } catch (error) {
            console.error("Failed to clear notifications", error);
            showToast('Failed to clear notifications', 'error');
        }
    };

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${API_URL}/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Build query string
            let queryUrl = `${API_URL}?page=${pagination.page}`;
            if (searchQuery) {
                queryUrl += `&search=${encodeURIComponent(searchQuery)}`;
            }
            if (filters.status) queryUrl += `&status=${encodeURIComponent(filters.status)}`;
            if (filters.priority) queryUrl += `&priority=${encodeURIComponent(filters.priority)}`;
            if (filters.category) queryUrl += `&category=${encodeURIComponent(filters.category)}`;

            const res = await fetch(queryUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.feedbacks) {
                    setFeedbacks(data.feedbacks);
                    setPagination({
                        page: data.page,
                        pages: data.pages,
                        total: data.total
                    });
                } else {
                    setFeedbacks(data); // Fallback if API reverts
                }
            } else {
                // If unauthorized, auth provider usually catches it, but for 500 error:
                if (res.status >= 500) showToast('Failed to load feedbacks. Server error.', 'error');
            }
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            // Avoiding spamming toast on every 5s polling if used, but here it's on mount/change
            showToast('Network error loading feedbacks', 'error');
        }
    };

    const fetchDevelopers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${AUTH_URL}/developers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching developers:', error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${AUTH_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAllUsers(data);
            }
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    };

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
    };

    const { user } = useAuth();

    // Refs to access latest state inside socket callbacks without dependencies
    const filtersRef = useRef(filters);
    const searchRef = useRef(searchQuery);
    const userRef = useRef(user);

    useEffect(() => {
        filtersRef.current = filters;
        searchRef.current = searchQuery;
        userRef.current = user;
    }, [filters, searchQuery, user]);

    // Single socket instance management
    const socketRef = useRef(null);

    // Initial Socket Connection & Listeners
    useEffect(() => {
        // Initialize socket only once
        if (!socketRef.current) {
            socketRef.current = io('http://localhost:5000');
            console.log('Socket initialized');
        }

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
            if (userRef.current) {
                const userId = userRef.current._id || userRef.current.id;
                socket.emit('join_room', userId);
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected:', attemptNumber);
            setIsConnected(true);
            if (userRef.current) {
                const userId = userRef.current._id || userRef.current.id;
                socket.emit('join_room', userId);
            }
        });

        socket.on('room_joined_ack', (room) => {
            console.log('ACK: Joined room', room);
            // Optional: showToast('Real-time connection active', 'success');
        });

        socket.on('welcome', (data) => console.log('SOCKET: WELCOME RECEIVED', data));

        // Listeners
        const matchesFilters = (fb) => {
            const f = filtersRef.current;
            const s = searchRef.current;
            if (f.status && fb.status !== f.status) return false;
            if (f.priority && fb.priority !== f.priority) return false;
            if (f.category && fb.category !== f.category) return false;
            if (s) {
                const query = s.toLowerCase();
                return fb.title.toLowerCase().includes(query) || fb.description.toLowerCase().includes(query);
            }
            return true;
        };

        socket.on('feedback_added', (newFeedback) => {
            if (matchesFilters(newFeedback)) {
                setFeedbacks(prev => {
                    if (prev.some(fb => fb._id === newFeedback._id)) return prev;
                    return [newFeedback, ...prev];
                });
            }
            // Only update local state, duplicate toast removed (handled by notification_new)
        });

        socket.on('feedback_updated', (updatedFeedback) => {
            setFeedbacks(prev => {
                const exists = prev.find(fb => fb._id === updatedFeedback._id);
                const matches = matchesFilters(updatedFeedback);
                if (exists && matches) {
                    return prev.map(fb => fb._id === updatedFeedback._id ? updatedFeedback : fb);
                } else if (exists && !matches) {
                    return prev.filter(fb => fb._id !== updatedFeedback._id);
                } else if (!exists && matches) {
                    return [updatedFeedback, ...prev];
                }
                return prev;
            });
        });

        socket.on('feedback_deleted', (id) => {
            setFeedbacks(prev => prev.filter(fb => fb._id !== id));
        });

        socket.on('notification_new', (notification) => {
            console.log('SOCKET EVENT: notification_new', notification);
            // Since we are using rooms now, if we receive it, it IS for us.
            // But we can double check ID to be safe if broadcasting was still active.

            // Note: recipientId might be object or string depending on population
            const recipientId = typeof notification.recipient === 'object' ? notification.recipient._id : notification.recipient;
            const currentUserId = userRef.current ? (userRef.current._id || userRef.current.id) : null;

            if (currentUserId && String(recipientId) === String(currentUserId)) {
                setNotifications(prev => {
                    if (prev.some(n => n._id === notification._id)) return prev;
                    return [notification, ...prev];
                });
                showToast(notification.message, notification.type || 'info');
            }
        });

        socket.on('analytics_update', () => {
            fetchAnalytics();
        });

        return () => {
            // Cleanup listeners to avoid duplicates if re-mounted (though simple unplug is safer)
            socket.off('connect');
            socket.off('welcome');
            socket.off('feedback_added');
            socket.off('feedback_updated');
            socket.off('feedback_deleted');
            socket.off('notification_new');
            socket.off('analytics_update');
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    // Watch for user changes to join room (if socket is already open)
    useEffect(() => {
        const socket = socketRef.current;
        if (socket && user) {
            const userId = user._id || user.id;
            // Always try to join room when user becomes available or changes
            console.log('User changed, emitting join_room:', userId);
            socket.emit('join_room', userId);
        }
    }, [user]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Debounce could be added here, but for now direct dependency
            const timer = setTimeout(() => {
                Promise.all([fetchFeedbacks(), fetchDevelopers(), fetchAllUsers(), fetchAnalytics(), fetchNotifications()]).then(() => setLoading(false));
            }, 500); // 500ms debounce
            return () => clearTimeout(timer);
        } else {
            setLoading(false);
        }
    }, [searchQuery, filters]);

    // Actions
    const addFeedback = async (feedbackData) => {
        const token = localStorage.getItem('token');
        try {
            let body;
            let headers = {
                Authorization: `Bearer ${token}`
            };

            // Check if there is a file or if we should use FormData
            if (feedbackData.file || feedbackData instanceof FormData) {
                const formData = new FormData();
                formData.append('title', feedbackData.title);
                formData.append('description', feedbackData.description);
                formData.append('category', feedbackData.category);
                formData.append('priority', feedbackData.priority);
                if (feedbackData.file) {
                    formData.append('file', feedbackData.file);
                }
                body = formData;
                // Do NOT set Content-Type for FormData, browser does it
            } else {
                body = JSON.stringify(feedbackData);
                headers['Content-Type'] = 'application/json';
            }

            const res = await fetch(API_URL, {
                method: 'POST',
                headers: headers,
                body: body
            });

            if (res.ok) {
                const newFeedback = await res.json();
                // showToast('Feedback submitted successfully!', 'success'); // Removed to avoid duplicate with socket notification
                return { success: true };
            }
            const errData = await res.json();
            showToast(errData.message || 'Failed to submit feedback', 'error');
        } catch (error) {
            console.error('Error adding feedback:', error);
            showToast('Network error submitting feedback', 'error');
        }
        return { success: false };
    };

    const updateFeedbackStatus = async (id, status, additionalData = {}) => {
        try {
            const res = await fetch(`http://localhost:5000/api/feedbacks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status, ...additionalData })
            });

            if (res.ok) {
                const data = await res.json();
                setFeedbacks(feedbacks.map(fb => fb._id === id ? data : fb));
                fetchAnalytics(); // Refresh analytics
                showToast(`Status updated to ${status}`, 'success');
            } else {
                showToast('Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Error updating feedback:', error);
            showToast('Network error updating status', 'error');
        }
    };

    const assignDeveloper = async (feedbackId, developerId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${feedbackId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ assignedTo: developerId })
            });
            if (res.ok) {
                const updatedFeedback = await res.json();
                setFeedbacks(prev => prev.map(fb => fb._id === feedbackId ? updatedFeedback : fb));
                // showToast('Developer assigned successfully', 'success'); // Removed to avoid duplicate with socket notification
            } else {
                showToast('Failed to assign developer', 'error');
            }
        } catch (error) {
            console.error('Error assigning developer:', error);
            showToast('Network error assigning developer', 'error');
        }
    };

    const addComment = async (feedbackId, comment) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${feedbackId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: comment.text })
            });
            if (res.ok) {
                const updatedFeedback = await res.json();
                setFeedbacks(prev => prev.map(fb => fb._id === feedbackId ? updatedFeedback : fb));
                // showToast('Comment posted', 'success'); // Optional, maybe too noisy
            } else {
                showToast('Failed to post comment', 'error');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            showToast('Network error posting comment', 'error');
        }
    };

    const editFeedback = async (id, updatedData) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            if (res.ok) {
                const updatedFeedback = await res.json();
                setFeedbacks(prev => prev.map(fb => fb._id === id ? updatedFeedback : fb));
                fetchAnalytics(); // Refresh analytics
                showToast('Feedback updated successfully', 'success');
                return { success: true };
            }
            showToast('Failed to update feedback', 'error');
        } catch (error) {
            console.error('Error editing feedback:', error);
            showToast('Network error editing feedback', 'error');
        }
        return { success: false };
    };

    const deleteFeedback = async (id) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                setFeedbacks(prev => prev.filter(fb => fb._id !== id));
                fetchAnalytics(); // Refresh analytics
                showToast('Feedback deleted', 'success');
            } else {
                const data = await res.json();
                showToast(data.message || 'Failed to delete', 'error');
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            showToast('Error deleting feedback', 'error');
        }
    };

    const deleteComment = async (feedbackId, commentId) => {
        const token = localStorage.getItem('token');
        console.log('Attempting to delete comment:', { feedbackId, commentId });
        try {
            const res = await fetch(`${API_URL}/${feedbackId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Delete response status:', res.status);

            if (res.ok) {
                const updatedFeedback = await res.json();
                console.log('Delete successful, updated feedback:', updatedFeedback);
                setFeedbacks(prev => prev.map(fb => fb._id === feedbackId ? updatedFeedback : fb));
                showToast('Comment deleted', 'info');
                return { success: true };
            } else {
                const errData = await res.json();
                console.error('Delete failed:', errData);
                showToast(errData.message || 'Failed to delete comment', 'error');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('Network error deleting comment', 'error');
        }
        return { success: false };
    };

    const updateUserRole = (userId, newRole) => {
        // Not implemented in backend yet
        console.log('Update role not implemented');
    };

    return (
        <FeedbackContext.Provider value={{
            feedbacks, users, allUsers, searchQuery, setSearchQuery, pagination, analytics, notifications, filters, updateFilter,
            addFeedback, updateFeedbackStatus, assignDeveloper, editFeedback,
            addComment, deleteFeedback, deleteComment, updateUserRole,
            refreshFeedbacks: fetchFeedbacks, reloadAnalytics: fetchAnalytics, refreshUsers: fetchAllUsers,
            markNotificationAsRead, refreshNotifications: fetchNotifications, clearNotifications,
            isConnected
        }}>
            {children}
        </FeedbackContext.Provider>
    );
};
