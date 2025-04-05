const express = require('express');
const router = express.Router();
const { 
  createBlog, 
  getBlogs, 
  getBlogById, 
  updateBlog, 
  deleteBlog, 
  getUserBlogs,
  likeBlog,
  commentOnBlog,
  deleteComment,
  checkLikeStatus,
  addReplyToComment,
  deleteReply,
  getBlogsByUserId
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

// Get all blogs and create a new blog
router.route('/')
  .get(getBlogs)
  .post(protect, createBlog);

// Get user blogs
router.route('/user')
  .get(protect, getUserBlogs);

// Get, update and delete blog by ID
router.route('/:id')
  .get(getBlogById)
  .put(protect, updateBlog)
  .delete(protect, deleteBlog);

// Like routes
router.route('/:id/like')
  .post(protect, likeBlog);

router.route('/:id/like/check')
  .get(protect, checkLikeStatus);

// Comment routes
router.route('/:id/comments')
  .post(protect, commentOnBlog);

router.route('/:id/comments/:commentId')
  .delete(protect, deleteComment);

// Reply routes
router.route('/:id/comments/:commentId/replies')
  .post(protect, addReplyToComment);

router.route('/:id/comments/:commentId/replies/:replyId')
  .delete(protect, deleteReply);

// Get blogs by user ID
router.get('/user/:id', getBlogsByUserId);

module.exports = router; 