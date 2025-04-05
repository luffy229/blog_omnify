// This file directs all non-API requests to the React app
const path = require('path');
const express = require('express');

const app = express();

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')));

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

module.exports = app; 