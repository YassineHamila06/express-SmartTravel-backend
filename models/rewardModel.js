const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    image: {
      type: String,
      required: [true, "Please provide an image"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
    },
    pointsRequired: {
      type: Number,
      required: [true, "Please provide a points required"],
    },
    isActive: {
      type: Boolean,
      required: [true, "Please provide a status"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reward", rewardSchema);