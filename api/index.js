// Vercel serverless API entry point
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Import routes directly to avoid path resolution issues
const userRoutes = require('../server/routes/userRoutes');
const blogRoutes = require('../server/routes/blogRoutes');
const notificationRoutes = require('../server/routes/notificationRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(`MongoDB Connection Error: ${err.message}`));

const app = express();

// Middleware
app.use(cors());
// Increase JSON payload limit to handle larger images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check route for debugging
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Basic fallback route for verification
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Blog API is running' });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  const clientBuildPath = path.join(__dirname, '../client/build');
  
  app.use(express.static(clientBuildPath));
  
  // Any routes not caught by the API will be redirected to the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Export for Vercel
module.exports = app; 