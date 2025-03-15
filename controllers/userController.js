const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

//@desc: Get all users
//@route: GET /api/v1/users
//@access: Public
const getusers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

//@desc: create new users
//@route: POST /api/v1/users
//@access: Public
const createuser = asyncHandler(async (req, res) => {
  console.log("the request body is :", req.body);
  const { name, lastname, email, password } = req.body;
  if (!name || !lastname || !email || !password) {
    res.status(400).json({
      success: false,
      message: "Please provide all the required fields",
    });
  }

  const user = await User.create({
    name,
    lastname,
    email,
    password,
  });
  res.status(201).json(user);
});

//@desc: get user
//@route: GET /api/v1/users/:id
//@access: Public
const getuser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.status(200).json(user);
});

//@desc: update users
//@route: PUT /api/v1/users/:id
//@access: Public
const updateuser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json(updatedUser);
});

//@desc: delete users
//@route: DELETE /api/v1/users/:id
//@access: Public
const deleteuser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// Forgot Password Function
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  // Generate a 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code

  // Save the code and expiration time in the user model
  user.resetPasswordCode = resetCode;
  user.resetPasswordCodeExpires = Date.now() + 900000; // 15-minute expiry
  await user.save();

  // Send the reset code via email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Your reset code is: ${resetCode}`,
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail(mailOptions);
  res.json({ success: true, message: "Password reset code sent" });
});

// Reset Password Function
const resetPassword = asyncHandler(async (req, res) => {
  const { resetCode, newPassword } = req.body;
  const user = await User.findOne({
    resetPasswordCode: resetCode,
    resetPasswordCodeExpires: { $gt: Date.now() }, // Ensure the code is not expired
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset code" });
  }

  // Hash the new password
  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordCode = undefined;
  user.resetPasswordCodeExpires = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successful" });
});

module.exports = { getusers, createuser, getuser, updateuser, deleteuser, forgotPassword, resetPassword };
