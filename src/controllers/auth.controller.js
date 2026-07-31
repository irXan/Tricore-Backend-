const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 2 * 60 * 60 * 1000,
  path: '/',
};

async function login(req, res, next) {
  try {
    const email = req.body.email.toLowerCase();
    const admin = await Admin.findOne({ email }).select('+passwordHash');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(req.body.password, admin.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(admin.id);
    res.cookie('tricore_admin', token, cookieOptions);
    return res.status(200).json({ admin: { email: admin.email } });
  } catch (error) {
    return next(error);
  }
}

async function seedInitialAdmin() {
  const { INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD } = process.env;
  if (!INITIAL_ADMIN_EMAIL || !INITIAL_ADMIN_PASSWORD) {
    console.log('[seed] Skipped — INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD not set.');
    return;
  }

  const email = INITIAL_ADMIN_EMAIL.trim().toLowerCase();
  const existingAdmin = await Admin.findOne({ email }).select('+passwordHash');

  if (existingAdmin) {
    const passwordChanged = !(await bcrypt.compare(INITIAL_ADMIN_PASSWORD, existingAdmin.passwordHash));
    if (passwordChanged) {
      existingAdmin.passwordHash = await bcrypt.hash(INITIAL_ADMIN_PASSWORD, 12);
      await existingAdmin.save();
      console.log('[seed] Admin password updated to match current environment.');
    }
    return;
  }

  await Admin.create({ email, passwordHash: await bcrypt.hash(INITIAL_ADMIN_PASSWORD, 12) });
  console.log('[seed] Admin account created.');
}

module.exports = { login, seedInitialAdmin };

