const express = require("express");

const router = express.Router();
const {
  getUserStats,
  getTripStats,
  getSurveyStats,
  getRewardStats,
  getCommunityStats,
  getMonthlyRevenue,
} = require("../controllers/dashboardController");

router.get("/user-stats", getUserStats);
router.get("/trip-stats", getTripStats);
router.get("/survey-stats", getSurveyStats);
router.get("/reward-stats", getRewardStats);
router.get("/community-stats", getCommunityStats);
router.get("/monthly-revenue", getMonthlyRevenue);




module.exports = router;
