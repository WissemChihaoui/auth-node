const express = require('express');
const bcrypt = require('bcrypt');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const User = require('./model/user');
const {
  sendPasswordResetEmail,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
} = require('./auth');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// Register user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, phone, firstName, lastName, language, country } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists!');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword, phone, firstName, lastName, language, country });
    await newUser.save();

    res.status(201).send({
      returnCode: 201,
      message: 'Registered successfully!',
      payload: {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).send({
      returnCode: 500,
      message: err.message,
      payload: {},
      timestamp: new Date().toISOString()
    });
  }
});

// Login user
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found
    if (!user) {
      return res.status(404).send({
        returnCode: 404,
        message: 'User not found',
        payload: {},
        timestamp: new Date().toISOString()
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).send({
        returnCode: 400,
        message: 'Invalid password',
        payload: {},
        timestamp: new Date().toISOString()
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).send({
      returnCode: 200,
      message: 'Login successful',
      payload: {
        accessToken,
        refreshToken,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
        country: user.country,
        phone: user.phone
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).send({
      returnCode: 500,
      message: 'Server Error',
      payload: {},
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        returnCode: 404,
        message: 'User not found',
        payload: {},
        timestamp: new Date().toISOString()
      });
    }

    const resetToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await sendPasswordResetEmail(user, resetToken);

    res.status(200).send({
      returnCode: 200,
      message: 'Password reset email sent',
      payload: {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error during forgot-password process:', error);
    res.status(500).send({
      returnCode: 500,
      message: 'Error sending email',
      payload: {},
      timestamp: new Date().toISOString()
    });
  }
});


// Reset password
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send({
        returnCode: 404,
        message: 'User not found',
        payload: {},
        timestamp: new Date().toISOString()
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send({
      returnCode: 200,
      message: 'Password reset successfully',
      payload: {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).send({
      returnCode: 500,
      message: 'Error resetting password',
      payload: {},
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});






