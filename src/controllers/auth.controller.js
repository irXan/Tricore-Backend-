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
    console.log('[login] Attempting login for:', email);
    const admin = await Admin.findOne({ email }).select('+passwordHash');
    console.log('[login] Admin found:', !!admin);
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const passwordMatches = await bcrypt.compare(req.body.password, admin.passwordHash);
    console.log('[login] Password matches:', passwordMatches);

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
  console.log('[seed] INITIAL_ADMIN_EMAIL env:', INITIAL_ADMIN_EMAIL ? 'set' : 'MISSING');
  console.log('[seed] INITIAL_ADMIN_PASSWORD env:', INITIAL_ADMIN_PASSWORD ? 'set' : 'MISSING');
  if (!INITIAL_ADMIN_EMAIL || !INITIAL_ADMIN_PASSWORD) {
    console.log('[seed] Skipped — missing env vars');
    return;
  }

  const email = INITIAL_ADMIN_EMAIL.trim().toLowerCase();
  console.log('[seed] Looking up admin:', email);
  const existingAdmin = await Admin.findOne({ email }).select('+passwordHash');
  console.log('[seed] Existing admin found:', !!existingAdmin);

  if (existingAdmin) {
    const passwordChanged = !(await bcrypt.compare(INITIAL_ADMIN_PASSWORD, existingAdmin.passwordHash));
    console.log('[seed] Password needs update:', passwordChanged);
    if (passwordChanged) {
      existingAdmin.passwordHash = await bcrypt.hash(INITIAL_ADMIN_PASSWORD, 12);
      await existingAdmin.save();
      console.log('[seed] Admin password UPDATED');
    } else {
      console.log('[seed] Admin password already matches — no update needed');
    }
    return;
  }

  const passwordHash = await bcrypt.hash(INITIAL_ADMIN_PASSWORD, 12);
  await Admin.create({ email, passwordHash });
  console.log('[seed] New admin CREATED:', email);
}

module.exports = { login, seedInitialAdmin };

