import React, { useEffect, useState, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useFeedback } from '../context/FeedbackContext';
import './NotificationBell.css';

const NotificationBell = () => {
    const { notifications, markNotificationAsRead, refreshNotifications, clearNotifications } = useFeedback();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);



    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Calculate unread count
    const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

    return (
        <div className="notification-bell" onClick={toggleDropdown} ref={dropdownRef}>
            <FaBell size={20} />
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        Notifications
                        {notifications && notifications.length > 0 && (
                            <span
                                onClick={(e) => { e.stopPropagation(); clearNotifications(); }}
                                style={{ float: 'right', cursor: 'pointer', fontSize: '0.8rem', color: '#00D9F4' }}
                            >
                                Clear All
                            </span>
                        )}
                    </div>
                    {notifications && notifications.length > 0 ? (
                        <ul className="notification-list">
                            {notifications.map((note) => (
                                <li
                                    key={note._id}
                                    className={`notification-item ${note.read ? 'read' : 'unread'}`}
                                    onClick={(e) => { e.stopPropagation(); markNotificationAsRead(note._id); }}
                                    style={{ opacity: note.read ? 0.6 : 1, position: 'relative' }}
                                >
                                    {note.message}
                                    {!note.read && (
                                        <span style={{
                                            height: '8px',
                                            width: '8px',
                                            backgroundColor: '#00D9F4',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                            marginLeft: '10px'
                                        }}></span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="notification-empty">No new notifications</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
