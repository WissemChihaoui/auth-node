const nodemailer = require('nodemailer');

// Configuration du transporteur d'email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Fonction d'envoi d'email
function sendPasswordResetEmail(user, token) {
  const resetLink = `http://localhost:3000/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: user.email,
    subject: 'Password Reset',
    text: `You requested a password reset. Click the following link to reset your password: ${resetLink}`,
    html: `<p>You requested a password reset. Click the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendPasswordResetEmail;

