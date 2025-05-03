const express = require("express");
const router = express.Router();
const {
  uploadRewardImage,
} = require("../controllers/middleware/uploadMiddleware");
const {
  createReward,
  getRewards,
  getReward,
  updateReward,
  deleteReward,
} = require("../controllers/rewardController");

router.post("/add", uploadRewardImage.single("image"), createReward);
router.get("/get", getRewards);
router.get("/get/:id", getReward);
router.put("/update/:id", uploadRewardImage.single("image"), updateReward);
router.delete("/delete/:id", deleteReward);

module.exports = router;
