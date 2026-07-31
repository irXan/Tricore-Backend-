const Inquiry = require('../models/Inquiry');
const sendInquiryEmail = require('../utils/sendEmail');

async function createInquiry(req, res, next) {
  try {
    const inquiry = await Inquiry.create({
      name: req.body.name,
      company: req.body.company || '',
      email: req.body.email,
      phone: req.body.phone || '',
      items: (req.body.items || []).filter(Boolean),
      message: req.body.message || '',
    });

    sendInquiryEmail(inquiry).catch((error) => {
      console.error('Inquiry email failed:', { inquiryId: inquiry.id, message: error.message });
    });

    return res.status(201).json({ message: 'Thank you. Your inquiry has been received.', inquiryId: inquiry.id });
  } catch (error) {
    return next(error);
  }
}

async function getInquiries(req, res, next) {
  try {
    const inquiries = await Inquiry.find().sort({ status: 1, createdAt: -1 }).lean();
    return res.json({ inquiries });
  } catch (error) {
    return next(error);
  }
}

async function updateInquiryStatus(req, res, next) {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found.' });
    return res.json({ inquiry });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createInquiry, getInquiries, updateInquiryStatus };

