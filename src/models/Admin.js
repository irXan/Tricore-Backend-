const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

module.exports = mongoose.model('Admin', adminSchema);

