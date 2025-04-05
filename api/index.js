// This file is the entry point for all API routes in the Vercel serverless environment
const app = require('../server/server');

// Export the Express app as a serverless function
module.exports = app; 