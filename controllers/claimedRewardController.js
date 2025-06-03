const ClaimedReward = require("../models/ClaimedRewardModel");
const Reward = require("../models/rewardModel");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createClaimedReward = asyncHandler(async (req, res) => {
  const { rewardId, userId, status } = req.body;

  if (!rewardId) {
    return res.status(400).json({
      success: false,
      message: "RewardId is required",
    });
  }
  const reward = await Reward.findById(rewardId);
  if (!reward) {
    return res.status(404).json({
      success: false,
      message: "Reward not found",
    });
  }
  const user = await User.findById(userId);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  if (user.points < reward.pointsRequired) {
    return res
      .status(400)
      .json({ success: false, message: "Not enough points" });
  }

  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7); // valid for 7 days

  const claimedReward = await ClaimedReward.create({
    rewardId,
    userId,
    status: "claimed",
    expirationDate,
  });

  //nakkas points reward from user points
  user.points = user.points - reward.pointsRequired;
  await user.save();

  if (reward.category === "event" && user.email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "🎉 Free Event Ticket Claimed!",
      text: `Hello ${user.firstname || user.name},
Congratulations! You have successfully claimed a free ticket to our upcoming event: ${
        reward.title || "Special Event"
      }.

Please visit the agency to pick up your ticket before ${expirationDate.toDateString()}.

Best regards,
The Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error("Email sending failed:", error);
      else console.log("Email sent: " + info.response);
    });
  }

  res.status(201).json({
    success: true,
    message: "Reward claimed successfully",
    claimedReward,
  });
});

// @desc: Get all claimed rewards
// @route: GET /api/v1/users
// @access: Public
const getClaimedRewards = asyncHandler(async (req, res) => {
  const claimedRewards = await ClaimedReward.find()
    .populate("rewardId")
    .populate("userId");
  res.status(200).json({ success: true, claimedRewards });
});

// @desc    Get single claimed reward
// @route   GET /api/v1/trips/:id
// @access  Public

const getClaimedReward = asyncHandler(async (req, res) => {
  const claimedReward = await ClaimedReward.findById(req.params.id)
    .populate("rewardId")
    .populate("userId");

  if (!claimedReward) {
    return res
      .status(404)
      .json({ success: false, message: "claimed reward not found" });
  }

  res.status(200).json({ success: true, claimedReward });
});
const getClaimedRewardsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const claimedRewards = await ClaimedReward.find({ userId })
    .populate("rewardId")
    .populate("userId");

  res.status(200).json({ success: true, claimedRewards });
});

module.exports = {
  createClaimedReward,
  getClaimedReward,
  getClaimedRewards,
  getClaimedRewardsByUserId,
};
