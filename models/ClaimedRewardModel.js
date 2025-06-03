const mongoose = require("mongoose");

const claimedRewardSchema = new mongoose.Schema(
  {
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["claimed", "used", "expired"],
      default: "claimed",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const ClaimedReward = mongoose.model("ClaimedReward", claimedRewardSchema);

module.exports = ClaimedReward;