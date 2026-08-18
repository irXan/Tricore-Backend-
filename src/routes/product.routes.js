const express = require('express');
const multer = require('multer');
const { body, param } = require('express-validator');
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/product.controller');
const requireAdmin = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { productReadLimiter } = require('../middleware/rateLimiter');
const blockBrowser = require('../middleware/blockBrowser');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      return callback(new Error('Only image uploads are allowed.'));
    }
    return callback(null, true);
  },
});

const jsonObject = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .custom((value) => {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error();
      return true;
    })
    .withMessage(`${field} must be a JSON object.`);

const jsonArray = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .custom((value) => {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      if (!Array.isArray(parsed) || parsed.length > 8 || !parsed.every((item) => typeof item === 'string')) throw new Error();
      return true;
    })
    .withMessage(`${field} must be a JSON array with up to eight image URLs.`);

const productValidation = [
  body('name').trim().notEmpty().isLength({ max: 160 }).withMessage('Name is required and must be 160 characters or fewer.'),
  body('slug')
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage('Slug must use lowercase letters, numbers, and hyphens only.'),
  body('category').trim().notEmpty().isLength({ max: 100 }).withMessage('Category is required.'),
  body('brand').trim().notEmpty().isLength({ max: 100 }).withMessage('Brand is required.'),
  body('description').trim().notEmpty().isLength({ max: 5000 }).withMessage('Description is required.'),
  jsonObject('specs'),
  jsonArray('images'),
  body('featured').optional().isBoolean().withMessage('Featured must be true or false.'),
];

router.get('/', blockBrowser, productReadLimiter, getProducts);
router.get('/:slug', blockBrowser, productReadLimiter, getProductBySlug);
router.post('/', requireAdmin, upload.array('newImages', 8), productValidation, validate, createProduct);
router.put(
  '/:id',
  requireAdmin,
  upload.array('newImages', 8),
  [param('id').isMongoId().withMessage('Invalid product ID.'), ...productValidation],
  validate,
  updateProduct,
);
router.delete('/:id', requireAdmin, [param('id').isMongoId().withMessage('Invalid product ID.')], validate, deleteProduct);

module.exports = router;

