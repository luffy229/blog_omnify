const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
// Increase JSON payload limit to handle larger images
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic route for testing API
app.get('/api', (req, res) => {
  res.json({ message: 'API is running' });
});

// Add a test route to check if the API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notifications', notificationRoutes);

// For Vercel serverless - catch all requests
app.all('*', (req, res) => {
  // Only respond to API requests, all other requests should be handled by the frontend
  if (req.url.startsWith('/api')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else {
    // For non-API requests, let the frontend handle routing
    res.status(200).send('Frontend should handle this route');
  }
});

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// For local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// For Vercel serverless deployment
module.exports = app; 