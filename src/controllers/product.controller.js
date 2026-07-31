const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const Product = require('../models/Product');
const { cloudinary, hasCloudinaryCredentials } = require('../config/cloudinary');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    const error = new Error('One or more structured product fields are not valid JSON.');
    error.name = 'ValidationError';
    throw error;
  }
}

function normalizeProductPayload(body) {
  const specs = parseJson(body.specs, {});
  const images = parseJson(body.images, []);
  if (!specs || Array.isArray(specs) || typeof specs !== 'object' || !Array.isArray(images)) {
    const error = new Error('Product specifications or image list has an invalid format.');
    error.name = 'ValidationError';
    throw error;
  }

  return {
    name: body.name,
    slug: body.slug,
    category: body.category,
    brand: body.brand,
    description: body.description,
    specs: Object.fromEntries(
      Object.entries(specs)
        .filter(([key, value]) => String(key).trim() && String(value).trim())
        .map(([key, value]) => [String(key).trim(), String(value).trim()]),
    ),
    images: images.filter((image) => typeof image === 'string' && image.trim()).map((image) => image.trim()),
    featured: body.featured === true || body.featured === 'true',
  };
}

function cloudinaryUpload(file) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: 'tricore-surgical/products', resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result.secure_url)),
    );
    Readable.from(file.buffer).pipe(upload);
  });
}

async function storeUploads(files = []) {
  if (!files.length) return [];
  if (hasCloudinaryCredentials) {
    return Promise.all(files.map(cloudinaryUpload));
  }

  const uploadsDir = path.join(__dirname, '../../uploads');
  const extensionByMimeType = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  await fs.promises.mkdir(uploadsDir, { recursive: true });
  return Promise.all(
    files.map(async (file) => {
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensionByMimeType[file.mimetype]}`;
      await fs.promises.writeFile(path.join(uploadsDir, filename), file.buffer);
      return `/uploads/${filename}`;
    }),
  );
}

async function getProducts(req, res, next) {
  try {
    const filter = {};
    if (req.query.category) filter.category = new RegExp(`^${escapeRegex(req.query.category)}$`, 'i');
    if (req.query.brand) filter.brand = new RegExp(`^${escapeRegex(req.query.brand)}$`, 'i');
    if (req.query.featured === 'true') filter.featured = true;
    if (req.query.search) {
      const search = escapeRegex(String(req.query.search).slice(0, 100));
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
      ];
    }

    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 }).lean();
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).lean();
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const payload = normalizeProductPayload(req.body);
    payload.images.push(...(await storeUploads(req.files)));
    const product = await Product.create(payload);
    return res.status(201).json({ product });
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const payload = normalizeProductPayload(req.body);
    payload.images.push(...(await storeUploads(req.files)));
    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json({ product });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };
