const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationsCount,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// Get all notifications & mark all as read
router.route('/')
  .get(getUserNotifications)
  .put(markAllNotificationsAsRead);

// Get unread notifications count
router.route('/unread')
  .get(getUnreadNotificationsCount);

// Mark as read & delete notification
router.route('/:id')
  .put(markNotificationAsRead)
  .delete(deleteNotification);

module.exports = router; 