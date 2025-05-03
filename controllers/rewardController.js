const Reward = require("../models/rewardModel");
const asyncHandler = require("express-async-handler");

const createReward = asyncHandler(async (req, res) => {
  const { title, description, category, pointsRequired } = req.body;
  const image = req.file?.path;

  if (!title || !description || !image || !category || !pointsRequired) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const reward = await Reward.create({
    title,
    description,
    image,
    category,
    pointsRequired,
  });

  res.status(201).json({
    success: true,
    message: "Reward created successfully",
    reward,
  });
});

const getRewards = asyncHandler(async (req, res) => {
  const rewards = await Reward.find().sort({ pointsRequired: 1 });
  res.status(200).json({
    success: true,
    rewards,
  });
});

const getReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);
  if (!reward) {
    res.status(404);
    throw new Error("Reward not found");
  }
  res.status(200).json({
    success: true,
    reward,
  });
});

const updateReward = asyncHandler(async (req, res) => {
  const reward = await Reward.findById(req.params.id);
  if (!reward) {
    res.status(404);
    throw new Error("Reward not found");
  }

  const { title, description, category, pointsRequired } = req.body;
  const image = req.file?.path || reward.image; // 👈 fallback to existing image if not replaced

  const updated = await Reward.findByIdAndUpdate(
    req.params.id,
    {
      title: title || reward.title,
      description: description || reward.description,
      category: category || reward.category,
      pointsRequired: pointsRequired || reward.pointsRequired,
      image,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "Reward updated successfully",
    reward: updated,
  });
});

const deleteReward = asyncHandler(async (req, res) => {
  await Reward.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Reward deleted successfully",
  });
});
module.exports = {
  createReward,
  getRewards,
  getReward,
  updateReward,
  deleteReward,
};
