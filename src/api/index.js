require('dotenv').config();

const app = require('../app');
const connectDatabase = require('../config/db');
const { seedInitialAdmin } = require('../controllers/auth.controller');

// Cache DB connection and seeding across serverless function invocations
let isDbConnected = false;
let isAdminSeeded = false;

module.exports = async (req, res) => {
    if (!isDbConnected) {
        console.log('Connecting to MongoDB...');
        await connectDatabase();
        isDbConnected = true;
        console.log('MongoDB connected.');
    }

    if (!isAdminSeeded) {
        console.log('Seeding initial admin...');
        await seedInitialAdmin().catch((err) => console.error('Seed failed:', err.message));
        isAdminSeeded = true;
        console.log('Seed process completed.');
    }

    app(req, res);
};