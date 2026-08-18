const rateLimit = require('express-rate-limit');

const createRateLimiter = (message, limit = 10) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message },
  });

const inquiryLimiter = createRateLimiter('Too many inquiry requests. Please try again in 15 minutes.');
const authLimiter = createRateLimiter('Too many sign-in attempts. Please try again in 15 minutes.');
const productReadLimiter = createRateLimiter('Too many requests. Please try again later.', 60);

module.exports = { inquiryLimiter, authLimiter, productReadLimiter };

