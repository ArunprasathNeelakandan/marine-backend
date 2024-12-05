const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: 'Missing JWT token' });
  }

  jwt.verify(token, 'arun', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid Token' });
    }

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;