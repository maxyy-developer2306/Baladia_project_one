// Authentication middleware.
// Protects admin routes by validating the JWT session cookie.
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.cookies?.adminSession;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
}

module.exports = authMiddleware;