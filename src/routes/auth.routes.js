const express = require('express');
const { body } = require('express-validator');
const { login } = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/login',
  authLimiter,
  [
    body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
    body('password').isString().isLength({ min: 8, max: 128 }).withMessage('Enter a valid password.'),
  ],
  validate,
  login,
);

module.exports = router;

