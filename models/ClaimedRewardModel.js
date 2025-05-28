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
      enum: ["claimed", "used"],
      default: "claimed",
    },
  },
  { timestamps: true }
);

const ClaimedReward = mongoose.model("ClaimedReward", claimedRewardSchema);

module.exports = ClaimedReward;