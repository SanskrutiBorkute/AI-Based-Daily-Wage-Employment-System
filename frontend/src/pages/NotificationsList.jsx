import React, { useState, useEffect } from 'react';
import { apiCall } from '../services/api';

const NotificationsList = ({ lang, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRead = async (id) => {
    try {
      await apiCall(`/notifications/${id}/read`, 'PATCH');
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="screen active">
      <div className="topbar">
        <button className="topbar-back" onClick={() => onNavigate('home')}>‹</button>
        <div className="topbar-title">{lang === 'hi' ? 'सूचनाएं' : lang === 'mr' ? 'सूचना' : 'Notifications'}</div>
      </div>

      <div className="scroll-body">
        {loading ? (
          <div className="spinner"></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">
              {lang === 'hi' ? 'कोई सूचना नहीं है' : lang === 'mr' ? 'कोणतीही सूचना नाही' : 'No Notifications'}
            </div>
            <div className="empty-sub">
              {lang === 'hi' ? 'यहाँ नए अपडेट दिखाई देंगे।' : lang === 'mr' ? 'येथे नवीन अपडेट दिसतील.' : 'New updates will appear here.'}
            </div>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n._id} 
              className={`notification-item ${!n.read ? 'unread' : ''}`}
              onClick={() => !n.read && handleRead(n._id)}
            >
              <div className="notification-title">{n.title}</div>
              <div className="notification-desc">{n.message}</div>
              <div className="notification-time">
                {new Date(n.createdAt).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsList;
