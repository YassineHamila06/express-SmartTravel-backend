const express = require("express");
const router = express.Router();
const {
  createClaimedReward,
  getClaimedReward,
  getClaimedRewards,
  getClaimedRewardsByUserId,
} = require("../controllers/claimedRewardController");

router.post("/add", createClaimedReward);
router.get("/get", getClaimedRewards);
router.get("/get/:id", getClaimedReward);
router.get("/user/:userId", getClaimedRewardsByUserId);


module.exports = router;
