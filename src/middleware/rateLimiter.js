const rateLimit = require('express-rate-limit');

const createRateLimiter = (message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
  });

const inquiryLimiter = createRateLimiter('Too many inquiry requests. Please try again in 15 minutes.');
const authLimiter = createRateLimiter('Too many sign-in attempts. Please try again in 15 minutes.');

module.exports = { inquiryLimiter, authLimiter };

