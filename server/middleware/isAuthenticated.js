const isAuthenticated = (req, res, next) => {
  console.log('🔐 Authentication check:');
  console.log('  - isAuthenticated:', req.isAuthenticated());
  console.log('  - user:', req.user);
  console.log('  - session:', req.session);
  
  if (req.isAuthenticated()) {
    console.log('  ✅ User is authenticated');
    return next();
  }
  
  console.log('  ❌ User is not authenticated');
  res.status(401).json({ 
    error: 'Authentication required',
    message: 'Please log in to access this resource'
  });
};

module.exports = isAuthenticated;
