const express = require('express');
const { body } = require('express-validator');
const { chat } = require('../controllers/chat.controller');
const validate = require('../middleware/validate.middleware');
const { inquiryLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/',
  inquiryLimiter,
  [body('message').trim().isString().isLength({ min: 1, max: 500 }).withMessage('Message is required and must be under 500 characters.')],
  validate,
  chat,
);

module.exports = router;
