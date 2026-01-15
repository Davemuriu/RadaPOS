import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Bell, X, Check, Trash2, AlertTriangle, Info } from 'lucide-react';
import '../../styles/Common/NotificationBell.css';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // 1. Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications/');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (err) {
            console.error("Failed to fetch notifications");
        }
    };

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 2. Mark as Read
    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error marking read", err);
        }
    };

    // 3. Clear All
    const handleClearAll = async () => {
        try {
            await api.delete('/notifications/clear');
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Error clearing notifications", err);
        }
    };

    return (
        <div className="notification-wrapper" ref={dropdownRef}>
            <button className="icon-btn bell-btn" onClick={() => setIsOpen(!isOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notification-dropdown animate-fade-in">
                    <div className="dropdown-header">
                        <h4>Notifications</h4>
                        {notifications.length > 0 && (
                            <button className="clear-btn" onClick={handleClearAll}>
                                <Trash2 size={12} /> Clear All
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-notif">
                                <p>No new notifications</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                                    <div className={`notif-icon ${n.type}`}>
                                        {n.type === 'warning' ? <AlertTriangle size={16} /> : <Info size={16} />}
                                    </div>
                                    <div className="notif-content">
                                        <p>{n.message}</p>
                                        <span className="notif-time">{n.time}</span>
                                    </div>
                                    {!n.is_read && (
                                        <button className="mark-read-btn" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;