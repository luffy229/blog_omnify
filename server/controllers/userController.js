const User = require('../models/User');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Handle password change - requires current password verification
      if (req.body.password) {
        // If updating password, current password must be provided and must match
        if (!req.body.currentPassword) {
          return res.status(400).json({ message: 'Current password is required to set a new password' });
        }
        
        // Verify current password is correct
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Set new password
        user.password = req.body.password;
      }
      
      // Update other fields if provided
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;
      user.bio = req.body.bio || user.bio;
      user.location = req.body.location || user.location;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        location: updatedUser.location,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user by ID (public profile)
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all blogs created by the user
    await Blog.deleteMany({ author: userId });
    
    // Delete all notifications related to the user
    await Notification.deleteMany({ 
      $or: [
        { recipient: userId },  // Notifications received by user
        { sender: userId }      // Notifications sent by user
      ]
    });

    // Find blogs that have comments by this user and update them
    // This is a complex operation as we need to pull the user's comments and replies from blog posts
    const blogsWithUserComments = await Blog.find({ 'comments.user': userId });

    for (const blog of blogsWithUserComments) {
      // Remove comments made by this user
      blog.comments = blog.comments.filter(comment => 
        comment.user.toString() !== userId.toString()
      );
      
      // For remaining comments, remove replies made by this user
      blog.comments = blog.comments.map(comment => {
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = comment.replies.filter(reply => 
            reply.user.toString() !== userId.toString()
          );
        }
        return comment;
      });
      
      // Remove user from likes
      blog.likes = blog.likes.filter(id => id.toString() !== userId.toString());
      
      await blog.save();
    }

    // Finally, delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, getUserById, deleteUserProfile }; 