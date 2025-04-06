// Simple fallback endpoint for debugging
module.exports = (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API fallback route is responding',
    path: req.url,
    method: req.method,
    query: req.query,
    headers: req.headers
  });
}; 