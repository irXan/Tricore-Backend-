const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, trim: true, maxlength: 160, default: '' },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    items: { type: [{ type: String, trim: true, maxlength: 200 }], default: [] },
    message: { type: String, trim: true, maxlength: 3000, default: '' },
    status: { type: String, enum: ['new', 'handled'], default: 'new', index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

module.exports = mongoose.model('Inquiry', inquirySchema);

