const Blog = require('../models/Blog');
const { createNotification } = require('./notificationController');

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    const blog = await Blog.create({
      title,
      content,
      author: req.user._id,
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all blogs with pagination
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const count = await Blog.countDocuments();
    
    const blogs = await Blog.find({})
      .populate('author', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    // Always return pagination info
    res.json({
      blogs,
      page,
      pages: Math.ceil(count / pageSize),
      totalBlogs: count,
      hasMore: pageSize * page < count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get blog by ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'name email')
      .populate('comments.user', 'name');
    
    if (blog) {
      // Increment view count
      blog.viewCount += 1;
      await blog.save();
      
      res.json(blog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const { title, content } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is the blog author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to update this blog' });
    }

    blog.title = title || blog.title;
    blog.content = content || blog.content;

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is the blog author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this blog' });
    }

    await blog.deleteOne();
    res.json({ message: 'Blog removed' });
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get logged in user blogs
// @route   GET /api/blogs/user
// @access  Private
const getUserBlogs = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const count = await Blog.countDocuments({ author: req.user._id });
    
    const blogs = await Blog.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      blogs,
      page,
      pages: Math.ceil(count / pageSize),
      totalBlogs: count,
      hasMore: pageSize * page < count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Like a blog
// @route   POST /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if the blog has already been liked by this user
    const alreadyLiked = blog.likes.includes(req.user._id);

    if (alreadyLiked) {
      // Remove like
      blog.likes = blog.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
      );
    } else {
      // Add like
      blog.likes.push(req.user._id);
      
      // Create notification for blog author
      if (blog.author.toString() !== req.user._id.toString()) {
        await createNotification(
          blog.author,
          req.user._id,
          blog._id,
          'like',
          `${req.user.name} liked your blog "${blog.title}"`
        );
      }
    }

    await blog.save();
    
    res.json({ 
      likes: blog.likes,
      likesCount: blog.likes.length,
      isLiked: !alreadyLiked
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add comment to a blog
// @route   POST /api/blogs/:id/comments
// @access  Private
const commentOnBlog = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = {
      user: req.user._id,
      name: req.user.name,
      text
    };

    blog.comments.unshift(comment);
    await blog.save();

    // Create notification for blog author
    if (blog.author.toString() !== req.user._id.toString()) {
      await createNotification(
        blog.author,
        req.user._id,
        blog._id,
        'comment',
        `${req.user.name} commented on your blog "${blog.title}"`
      );
    }

    res.status(201).json(blog.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete comment from a blog
// @route   DELETE /api/blogs/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Find the comment
    const comment = blog.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author OR the blog owner
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isBlogOwner = blog.author.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isBlogOwner) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove comment
    blog.comments = blog.comments.filter(
      ({ _id }) => _id.toString() !== req.params.commentId
    );

    await blog.save();
    res.json(blog.comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Check if user has liked a blog
// @route   GET /api/blogs/:id/like/check
// @access  Private
const checkLikeStatus = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if the blog has been liked by this user
    const isLiked = blog.likes.some(
      userId => userId.toString() === req.user._id.toString()
    );

    res.json({ 
      isLiked,
      likesCount: blog.likes.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add reply to a comment
// @route   POST /api/blogs/:id/comments/:commentId/replies
// @access  Private
const addReplyToComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Find the comment to reply to
    const comment = blog.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Create the reply
    const reply = {
      user: req.user._id,
      name: req.user.name,
      text
    };

    // Add reply to the comment
    comment.replies.push(reply);
    await blog.save();

    // Create notification for blog author if they're not the one replying
    if (blog.author.toString() !== req.user._id.toString()) {
      await createNotification(
        blog.author,
        req.user._id,
        blog._id,
        'reply',
        `${req.user.name} replied to a comment on your blog "${blog.title}"`
      );
    }

    // Create notification for comment author if they're not the one replying
    if (comment.user.toString() !== req.user._id.toString() && 
        comment.user.toString() !== blog.author.toString()) {
      await createNotification(
        comment.user,
        req.user._id,
        blog._id,
        'reply',
        `${req.user.name} replied to your comment on "${blog.title}"`
      );
    }

    // Return the updated comment with its replies
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a reply from a comment
// @route   DELETE /api/blogs/:id/comments/:commentId/replies/:replyId
// @access  Private
const deleteReply = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Find the comment
    const comment = blog.comments.find(
      comment => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Find the reply
    const reply = comment.replies.find(
      reply => reply._id.toString() === req.params.replyId
    );

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if user is authorized to delete the reply:
    // Either the reply author, the comment author, or the blog owner
    const isReplyAuthor = reply.user.toString() === req.user._id.toString();
    const isCommentAuthor = comment.user.toString() === req.user._id.toString();
    const isBlogOwner = blog.author.toString() === req.user._id.toString();

    if (!isReplyAuthor && !isCommentAuthor && !isBlogOwner) {
      return res.status(401).json({ message: 'Not authorized to delete this reply' });
    }

    // Remove the reply
    comment.replies = comment.replies.filter(
      reply => reply._id.toString() !== req.params.replyId
    );
    
    await blog.save();

    // Return the updated comment with its replies
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get blogs by user ID
// @route   GET /api/blogs/user/:id
// @access  Public
const getBlogsByUserId = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
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
}; 