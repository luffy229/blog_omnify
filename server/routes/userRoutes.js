const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile,
  updateUserProfile,
  getUserById,
  deleteUserProfile
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Register a new user
router.post('/', registerUser);

// Login user
router.post('/login', loginUser);

// Get user profile (Protected route)
router.get('/profile', protect, getUserProfile);

// Update user profile (Protected route)
router.put('/profile', protect, updateUserProfile);

// Delete user profile (Protected route)
router.delete('/profile', protect, deleteUserProfile);

// Get user by ID (Public route)
router.get('/:id', getUserById);

module.exports = router; 