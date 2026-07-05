const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter;

if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
} else {
  // In development, log emails to console instead of sending
  transporter = {
    sendMail: async (mailOptions) => {
      logger.info('--- DEV EMAIL ---');
      logger.info(`To: ${mailOptions.to}`);
      logger.info(`Subject: ${mailOptions.subject}`);
      logger.info(`Body: ${mailOptions.html ? '[HTML]' : mailOptions.text}`);
      logger.info('--- END EMAIL ---');
      return { messageId: 'dev-' + Date.now() };
    },
  };
}

module.exports = transporter;
