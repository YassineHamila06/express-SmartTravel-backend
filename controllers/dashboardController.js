const User = require("../models/userModel");
const Trip = require("../models/tripModel");
const Reservation = require("../models/reservationModel");
const EventReservation = require("../models/eventReservationModel");
const Survey = require("../models/surveyModel");
const Reward = require("../models/rewardModel");
const moment = require("moment");

const CommunityPost = require("../models/communityPostModel");

const getUserStats = async (req, res) => {
  try {
    const now = moment();
    const todayStart = now.clone().startOf("day");

    // Total users
    const totalUsers = await User.countDocuments();

    // New users today
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: todayStart.toDate() },
    });

    // Active users (e.g., users who made a reservation or posted something recently)
    const activeUsersSet = new Set();

    const recentReservations = await Reservation.find({
      createdAt: { $gte: now.clone().subtract(30, "days").toDate() },
    }).select("userId");
    const recentPosts = await CommunityPost.find({
      createdAt: { $gte: now.clone().subtract(30, "days").toDate() },
    }).select("user");

    recentReservations.forEach((r) => activeUsersSet.add(r.userId.toString()));
    recentPosts.forEach((p) => activeUsersSet.add(p.user.toString()));

    const activeUsers = activeUsersSet.size;

    // Users by location (assume you store "location" inside User model)
    const usersByLocation = await User.aggregate([
      { $match: { location: { $exists: true, $ne: "" } } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
    ]);
    const locationMap = {};
    usersByLocation.forEach((loc) => (locationMap[loc._id] = loc.count));

    // Engagement metrics
    const surveysCompleted = await Survey.countDocuments({
      status: "completed",
    });
    const reservationsMade = await Reservation.countDocuments();
    const communityPosts = await CommunityPost.countDocuments();

    // Rewards redeemed → this assumes you track redemptions in the future
    const rewardsRedeemed = 0; // Replace with real logic if implemented

    // Registration over time (last 6 months)
    const lastSixMonths = [...Array(6).keys()]
      .map((i) => moment().subtract(i, "months").startOf("month"))
      .reverse();

    const registerOverTime = {
      labels: lastSixMonths.map((m) => m.format("MMM YYYY")),
      data: await Promise.all(
        lastSixMonths.map((m) =>
          User.countDocuments({
            createdAt: {
              $gte: m.toDate(),
              $lt: m.clone().add(1, "month").toDate(),
            },
          })
        )
      ),
    };

    // User activity over time (combine reservation + community post counts per month)
    const userActivity = {
      labels: lastSixMonths.map((m) => m.format("MMM YYYY")),
      data: await Promise.all(
        lastSixMonths.map(async (m) => {
          const r = await Reservation.countDocuments({
            createdAt: {
              $gte: m.toDate(),
              $lt: m.clone().add(1, "month").toDate(),
            },
          });
          const c = await CommunityPost.countDocuments({
            createdAt: {
              $gte: m.toDate(),
              $lt: m.clone().add(1, "month").toDate(),
            },
          });
          return r + c;
        })
      ),
    };

    // Top users
    const topUsers = await User.find()
      .sort({ points: -1 })
      .limit(5)
      .select("name lastname points");

    // Preferences
    const preferenceBreakdown = await User.aggregate([
      { $unwind: "$travelPreferences" },
      { $group: { _id: "$travelPreferences", count: { $sum: 1 } } },
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        newUsersToday,
        activeUsers,
        usersByLocation: locationMap,
        userEngagement: {
          surveysCompleted,
          reservationsMade,
          communityPosts,
          rewardsRedeemed,
        },
        registerOverTime,
        userActivity,
        topUsers,
        preferenceBreakdown,
      },
    });
  } catch (err) {
    console.error("Error in getUserStats:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getTripStats = async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments();
    const tripTypeBreakdown = await Trip.aggregate([
      { $group: { _id: "$tripType", count: { $sum: 1 } } },
    ]);
    const reservationRevenue = await Reservation.aggregate([
      { $match: { status: "confirmed" } },
      { $group: { _id: "$tripId", total: { $sum: "$totalPrice" } } },
    ]);
    const reservationsPerMonth = await Reservation.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalTrips,
      tripTypeBreakdown,
      reservationRevenue,
      reservationsPerMonth,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trip stats" });
  }
};

const getSurveyStats = async (req, res) => {
  try {
    const totalSurveys = await Survey.countDocuments();
    const surveysByStatus = await Survey.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const topSurveys = await Survey.find()
      .sort({ numberOfRespondents: -1 })
      .limit(5);

    res.json({ totalSurveys, surveysByStatus, topSurveys });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch survey stats" });
  }
};

const getRewardStats = async (req, res) => {
  try {
    const totalRewards = await Reward.countDocuments();
    const rewardsByCategory = await Reward.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const topRewards = await Reward.find()
      .sort({ pointsRequired: -1 })
      .limit(5);

    res.json({ totalRewards, rewardsByCategory, topRewards });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reward stats" });
  }
};

const getCommunityStats = async (req, res) => {
  try {
    const totalPosts = await CommunityPost.countDocuments();
    const topLikedPosts = await CommunityPost.aggregate([
      {
        $project: {
          text: 1,
          likeCount: { $size: "$likes" },
        },
      },
      { $sort: { likeCount: -1 } },
      { $limit: 5 },
    ]);
    const totalComments = await CommunityPost.aggregate([
      {
        $group: {
          _id: null,
          commentCount: { $sum: { $size: "$comments" } },
        },
      },
    ]);

    res.json({
      totalPosts,
      topLikedPosts,
      totalComments: totalComments[0]?.commentCount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch community stats" });
  }
};
// @desc    Get combined monthly revenue (Trip + Event)
// @route   GET /api/v1/dashboard/monthly-revenue
// @access  Admin
const getMonthlyRevenue = async (req, res) => {
    try {
      // Trip Reservations - Daily Grouping
      const tripData = await Reservation.aggregate([
        { $match: { status: "confirmed" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            total: { $sum: "$totalPrice" },
          },
        },
      ]);
  
      // Event Reservations - Daily Grouping
      const eventData = await EventReservation.aggregate([
        { $match: { status: "confirmed" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            total: { $sum: "$totalPrice" },
          },
        },
      ]);
  
      // Merge Data
      const combinedMap = new Map();
  
      const formatKey = (y, m, d) =>
        `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  
      tripData.forEach(({ _id, total }) => {
        const key = formatKey(_id.year, _id.month, _id.day);
        if (!combinedMap.has(key)) {
          combinedMap.set(key, { label: key, trip: 0, event: 0 });
        }
        combinedMap.get(key).trip = total;
      });
  
      eventData.forEach(({ _id, total }) => {
        const key = formatKey(_id.year, _id.month, _id.day);
        if (!combinedMap.has(key)) {
          combinedMap.set(key, { label: key, trip: 0, event: 0 });
        }
        combinedMap.get(key).event = total;
      });
  
      const result = Array.from(combinedMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label)
      );
  
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      console.error("Error in getMonthlyRevenue (now daily):", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };


module.exports = {
  getUserStats,
  getTripStats,
  getSurveyStats,
  getRewardStats,
  getCommunityStats,
  getMonthlyRevenue,

};
