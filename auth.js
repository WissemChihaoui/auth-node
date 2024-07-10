const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendPasswordResetEmail(user, token) {
  const resetLink = `http://localhost:3000/reset-password/${token}`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Password Reset',
    text: `Click here to reset your password: ${resetLink}`,
  };
  await transporter.sendMail(mailOptions);
}

async function sendVerificationEmail(user) {
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const verificationLink = `http://localhost:3000/verify-email/${token}`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Email Verification',
    text: `Click here to verify your email: ${verificationLink}`,
  };
  await transporter.sendMail(mailOptions);
}

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

module.exports = {
  sendPasswordResetEmail,
  sendVerificationEmail,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};







