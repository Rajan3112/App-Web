const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email configuration error:', error);
    console.log('Please check EMAIL_USER and EMAIL_PASSWORD in .env file');
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for User Login Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to User Login Dashboard!</h2>
        <p>Your OTP for account verification is:</p>
        <h1 style="color: #3498db; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };

  try {
    console.log('Attempting to send OTP email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    console.error('Full error:', error);
    return false;
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mobiloitte_secret', {
    expiresIn: '30d',
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      message: !email ? 'Please enter your email.' : 'Please enter your password.' 
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first.' });
    }
    
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Please you are not valid.' });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { email, password, name, mobile } = req.body;

  // Validation
  if (!email || !password || !name || !mobile) {
    return res.status(400).json({ 
      message: 'Please fill all required fields.' 
    });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Generate OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Create user (unverified)
  const user = await User.create({
    email,
    password,
    name,
    mobile,
    role: 'employee',
    isVerified: false,
    otp,
    otpExpires
  });

  if (user) {
    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    
    if (emailSent) {
      res.status(201).json({
        message: 'Registration successful. Please check your email for OTP.',
        email: user.email,
        requiresOTP: true
      });
    } else {
      // Delete user if email fails
      await User.findByIdAndDelete(user._id);
      res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
});

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Public/Admin
const changePassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  // Validation
  if (!email || !newPassword) {
    return res.status(400).json({ 
      message: !email ? 'Please enter your email.' : 'Please enter a new password.'
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Validate new password length
  if (newPassword.length < 5 || newPassword.length > 50) {
    return res.status(400).json({ 
      message: 'Password must be between 5 and 50 characters.' 
    });
  }

  // Hash and update new password using findByIdAndUpdate to avoid double hashing
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  
  await User.findByIdAndUpdate(user._id, { password: hashedPassword });

  // Emit socket event for real-time update
  const io = req.app.get('socketio');
  if (io) {
    io.emit('update', { type: 'passwordChange', userId: user._id });
  }

  res.json({ message: 'Password updated successfully.' });
});

// @desc    Check if user is admin
// @route   POST /api/auth/check-admin
// @access  Public
const checkAdmin = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    return res.status(400).json({ message: 'Please enter your email.' });
  }

  // Check if user exists and is admin
  const user = await User.findOne({ email });
  
  console.log('Checking user:', email, user); // Debug log

  if (user) {
    console.log('User found, role:', user.role); // Debug log
    if (user.role === 'admin' || user.email === 'mobiloitte@gmail.com') {
      return res.json({ isAdmin: true });
    } else {
      return res.status(401).json({ message: 'You are not valid.' });
    }
  } else {
    // If user doesn't exist in database, check if it's the default admin email
    if (email === 'mobiloitte@gmail.com') {
      return res.json({ isAdmin: true });
    }
    return res.status(401).json({ message: 'You are not valid.' });
  }
});

// @desc    Check if email is valid (any valid user can reset password)
// @route   POST /api/auth/check-email
// @access  Public
const checkEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    return res.status(400).json({ message: 'Please enter your email.' });
  }

  // Basic email format validation
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ message: 'Please include an \'@\' and \'.com\' in the email address.' });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  
  console.log('Checking user:', email, user); // Debug log

  if (user) {
    // Any valid user can reset their password
    return res.json({ isValid: true });
  } else {
    // User doesn't exist
    return res.status(404).json({ message: 'User not found.' });
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Validation
  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and OTP.' });
  }

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Check if OTP is valid
  if (user.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP.' });
  }

  // Check if OTP is expired
  if (user.otpExpires < new Date()) {
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }

  // Verify user
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  // Don't send token - user needs to login manually
  res.json({
    message: 'Email verified successfully. Please login to continue.'
  });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    return res.status(400).json({ message: 'Please provide email.' });
  }

  // Find user
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'User already verified.' });
  }

  // Generate new OTP
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.otp = otp;
  user.otpExpires = otpExpires;
  await user.save();

  // Send OTP email
  const emailSent = await sendOTPEmail(email, otp);
  
  if (emailSent) {
    res.json({ message: 'OTP resent successfully.' });
  } else {
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email, mobile } = req.body;

  // Get user from token
  const userId = req.user._id;

  // Validation
  if (!name || !email || !mobile) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }

  // Find user
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Check if email is already taken by another user
  if (email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use.' });
    }
  }

  // Update user
  user.name = name;
  user.email = email;
  user.mobile = mobile;
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role
  });
});

module.exports = {
  authUser,
  registerUser,
  changePassword,
  checkEmail,
  verifyOTP,
  resendOTP,
  updateProfile,
  generateToken,
};