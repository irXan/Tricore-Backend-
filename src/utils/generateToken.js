const jwt = require('jsonwebtoken');

function generateToken(adminId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }

  return jwt.sign({ sub: adminId, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  });
}

module.exports = generateToken;

