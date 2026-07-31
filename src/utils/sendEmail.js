const nodemailer = require('nodemailer');

function configured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendInquiryEmail(inquiry) {
  if (!configured()) {
    console.warn('SMTP is not configured; inquiry notification email was skipped.');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const items = inquiry.items.length ? inquiry.items.map((item) => `• ${item}`).join('\n') : 'No item specified';
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.INQUIRY_RECIPIENT || process.env.SMTP_USER,
    replyTo: inquiry.email,
    subject: `New TriCore quote request from ${inquiry.name}`,
    text: [
      'A new inquiry has been received.',
      '',
      `Name: ${inquiry.name}`,
      `Company: ${inquiry.company || 'Not provided'}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone || 'Not provided'}`,
      'Items:',
      items,
      '',
      `Message: ${inquiry.message || 'Not provided'}`,
    ].join('\n'),
  });
}

module.exports = sendInquiryEmail;

