const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const token = req.cookies?.tricore_admin;

  if (!token) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Administrator access is required.' });
    }

    req.admin = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

module.exports = requireAdmin;

