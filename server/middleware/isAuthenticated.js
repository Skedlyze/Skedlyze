const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ 
    error: 'Authentication required',
    message: 'Please log in to access this resource'
  });
};

module.exports = isAuthenticated;
