const mongoose = require('mongoose');

async function connectDatabase() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Add it to backend/.env before starting the API.');
  }

  await mongoose.connect(MONGODB_URI);
  console.info(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDatabase;

