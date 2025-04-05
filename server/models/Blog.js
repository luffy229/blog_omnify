const mongoose = require('mongoose');

// Reply schema (for nested replies in comments)
const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Comment schema
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    replies: [replySchema] // Add replies array to comments
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSchema],
    viewCount: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// Calculate reading time before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate reading time based on content length
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    const wordCount = this.content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    this.readTime = readTime < 1 ? 1 : readTime;
  }
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog; 