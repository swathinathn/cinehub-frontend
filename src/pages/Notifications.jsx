import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import "./notifications.css";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/users/notifications/");
      setNotifications(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await API.post("/users/notifications/mark-read/");
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  if (loading) return <div style={{ color: "#fff", textAlign: "center", marginTop: "100px" }}>Loading Notifications...</div>;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        {notifications.length > 0 && (
          <button 
            className="mark-read-btn" 
            onClick={handleMarkAsRead} 
            disabled={!hasUnread}
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <h3>No notifications yet</h3>
          <p>You will see your alerts and updates here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div key={notif.id} className={`notification-card ${!notif.is_read ? "unread" : ""}`}>
              {!notif.is_read && <div className="unread-dot"></div>}
              <div className="notification-content">
                <h3 className="notification-title">{notif.title}</h3>
                <p className="notification-message">{notif.message}</p>
                <span className="notification-time">
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
