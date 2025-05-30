const asyncHandler = require("express-async-handler");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const nodemailer = require("nodemailer");

// @desc    Admin login
// @route   POST /api/v1/admins/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide email and password" });
  }

  // Check if admin exists
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  // Compare the password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      profileImage: admin.profileImage || null, // Include profile image URL if available
    },
  });
});

// @desc    Get all admins
// @route   GET /api/v1/admins
// @access  Admin
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find();
  res.status(200).json({ success: true, data: admins });
});

// @desc    Get a single admin
// @route   GET /api/v1/admins/:id
// @access  Admin
const getAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }
  res.status(200).json({ success: true, data: admin });
});

// @desc    Create a new admin
// @route   POST /api/v1/admins
// @access  Admin
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  // Check if email already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return res
      .status(400)
      .json({ success: false, message: "Email already exists" });
  }

  // Handle profile image upload (optional)
  let profileImage;
  if (req.file && req.file.path) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "admins",
    });
    profileImage = result.secure_url; // Save the Cloudinary URL
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the admin
  const admin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    profileImage,
  });

  res.status(201).json({ success: true, data: admin });
});

// @desc    Update admin details
// @route   PUT /api/v1/admins/:id
// @access  Admin
const updateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  // If a profile image is provided, upload it to Cloudinary
  if (req.file && req.file.path) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "admins",
    });
    req.body.profileImage = result.secure_url; // Store the Cloudinary URL for profile image
  }

  // If password is provided, hash it
  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 10);
  }

  // Update the admin's details
  const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({ success: true, data: updatedAdmin });
});

// @desc    Delete an admin
// @route   DELETE /api/v1/admins/:id
// @access  Admin
const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  await Admin.findByIdAndDelete(req.params.id);
  res
    .status(200)
    .json({ success: true, message: "Admin deleted successfully" });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(400).json({ success: false, message: "Admin not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  admin.resetPasswordCode = otp.toString();
  admin.resetPasswordCodeExpires = new Date(Date.now() + 900000);
  await admin.markModified("resetPasswordCode");
  await admin.markModified("resetPasswordCodeExpires");
  await admin.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: admin.email,
    subject: "Password Reset Request",
    text: `Your password reset code is: ${otp}`,
  });

  res.json({
    success: true,
    message: "Password reset code sent",
    email: admin.email, // Send back the email for verification
  });
});

// @desc    Verify OTP
// @route   POST /api/v1/admins/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "Reset code is required",
    });
  }

  const admin = await Admin.findOne({
    resetPasswordCode: otp.toString(),
    resetPasswordCodeExpires: { $gt: new Date() },
  });

  if (!admin) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired reset code" });
  }

  res.json({
    success: true,
    message: "Reset code verified",
    email: admin.email, // Send back the email for the next step
  });
});

// @desc    Reset password
// @route   POST /api/v1/admins/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  const admin = await Admin.findOne({
    resetPasswordCode: otp.toString(),
    resetPasswordCodeExpires: { $gt: new Date() },
  });

  if (!admin) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired reset code" });
  }

  admin.password = await bcrypt.hash(newPassword, 10);
  admin.resetPasswordCode = undefined;
  admin.resetPasswordCodeExpires = undefined;
  await admin.save();

  res.json({ success: true, message: "Password reset successful" });
});

// Get logged-in admin data
const getMe = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Admin not found" });
  }

  res.status(200).json({
    id: req.admin.id,
    name: req.admin.name,
    email: req.admin.email,
    profileImage: req.admin.profileImage || null, // Send the profile image URL if available
  });
});

// @desc    Change admin password
// @route   PUT /api/v1/admins/change-password
// @access  Admin (must be authenticated)
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Old and new passwords are required",
    });
  }

  // Admin ID is the same as we have only one Admin
  const adminId = req.admin ? req.admin.id : "680ad6f8534dcd711ac49357";
  const admin = await Admin.findById(adminId);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  // Check if old password matches
  const isMatch = await bcrypt.compare(oldPassword, admin.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Incorrect current password" });
  }

  // Hash the new password and update
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  admin.password = hashedPassword;
  await admin.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

module.exports = {
  loginAdmin,
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  forgotPassword,
  resetPassword,
  verifyOtp,
  getMe,
  changePassword,
};