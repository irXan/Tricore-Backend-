const express = require('express');
const { body, param } = require('express-validator');
const { createInquiry, getInquiries, updateInquiryStatus } = require('../controllers/inquiry.controller');
const requireAdmin = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { inquiryLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post(
  '/',
  inquiryLimiter,
  [
    body('name').trim().notEmpty().isLength({ max: 120 }).withMessage('Name is required.'),
    body('company').optional().trim().isLength({ max: 160 }).withMessage('Company is too long.'),
    body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
    body('phone').optional().trim().isLength({ max: 40 }).withMessage('Phone number is too long.'),
    body('items').optional().isArray({ max: 10 }).withMessage('Items must be a list of up to ten products.'),
    body('items.*').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('An item is invalid.'),
    body('message').optional().trim().isLength({ max: 3000 }).withMessage('Message is too long.'),
  ],
  validate,
  createInquiry,
);

router.get('/', requireAdmin, getInquiries);
router.patch(
  '/:id',
  requireAdmin,
  [
    param('id').isMongoId().withMessage('Invalid inquiry ID.'),
    body('status').isIn(['new', 'handled']).withMessage('Status must be new or handled.'),
  ],
  validate,
  updateInquiryStatus,
);

module.exports = router;

