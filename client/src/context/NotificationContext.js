import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

// Create base URL for API calls - ensure it works in both dev and production
const API_URL = process.env.REACT_APP_API_URL || '/api';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);

  // Define fetchNotifications and fetchUnreadCount with useCallback
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.get(
        `${API_URL}/notifications`,
        config
      );
      
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      setError(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
      setLoading(false);
    }
  }, [user]);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.get(
        `${API_URL}/notifications/unread`,
        config
      );
      
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!user) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      await axios.put(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        config
      );
      
      // Update local state
      setNotifications(
        notifications.map(notification => 
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      await axios.put(
        `${API_URL}/notifications`,
        {},
        config
      );
      
      // Update local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true
        }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    if (!user) return;
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      await axios.delete(
        `${API_URL}/notifications/${notificationId}`,
        config
      );
      
      // Update local state
      const updatedNotifications = notifications.filter(
        (notification) => notification._id !== notificationId
      );
      
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const deletedNotification = notifications.find((n) => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 