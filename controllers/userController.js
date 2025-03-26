const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("../config/cloudinary");

// @desc: Login user
// @route: POST /api/v1/users/login
// @access: Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Please provide email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
      lastname: user.lastname,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      profileImage: user.profileImage || null, // Optional image URL
    },
  });
});

// @desc: Get all users
// @route: GET /api/v1/users
// @access: Public
const getusers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// @desc: Create new user
// @route: POST /api/v1/users
// @access: Public
const createuser = asyncHandler(async (req, res) => {
  const { name, lastname, email, password } = req.body;
  if (!name || !lastname || !email || !password) {
    return res.status(400).json({ success: false, message: "Please provide all required fields" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    lastname,
    email,
    password: hashedPassword,
  });

  res.status(201).json(user);
});

// @desc: Get user by ID
// @route: GET /api/v1/users/:id
// @access: Public
const getuser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  res.status(200).json(user);
});

// @desc: Update user
// @route: PUT /api/v1/users/:id
// @access: Public
const updateuser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // If profile image is provided, upload it to Cloudinary
  if (req.file && req.file.path) {
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "users" });
    req.body.profileImage = result.secure_url; // Save the Cloudinary image URL
  }

  // If password is provided, hash it
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedUser);
});

// @desc: Delete user
// @route: DELETE /api/v1/users/:id
// @access: Public
const deleteuser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "User deleted successfully" });
});

// Forgot Password Function
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const resetCode = Math.floor(100000 + Math.random() * 900000);

  user.resetPasswordCode = resetCode;
  user.resetPasswordCodeExpires = new Date(Date.now() + 900000);
  await user.markModified("resetPasswordCode");
  await user.markModified("resetPasswordCodeExpires");
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset Request",
    text: `Your password reset code is: ${resetCode}`,
  });

  res.json({ success: true, message: "Password reset code sent" });
});

// Reset Password Function
const resetPassword = asyncHandler(async (req, res) => {
  const { resetCode, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordCode: Number(resetCode),
    resetPasswordCodeExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordCode = undefined;
  user.resetPasswordCodeExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful" });
});

// Get logged-in user data
const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not found" });
  }

  res.status(200).json({
    id: req.user.id,
    name: req.user.name,
    lastname: req.user.lastname,
    email: req.user.email,
    profileImage: req.user.profileImage || null, // Send the profile image URL if available
  });
});

module.exports = {
  getusers,
  createuser,
  getuser,
  updateuser,
  deleteuser,
  forgotPassword,
  resetPassword,
  loginUser,
  getMe,
};
