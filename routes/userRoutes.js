const express = require("express");
const router = express.Router();
const {
  getusers,
  createuser,
  getuser,
  updateuser,
  deleteuser,
  forgotPassword,
  resetPassword,
  loginUser,
  getMe,
} = require("../controllers/userController");

const validateToken = require("../controllers/middleware/validateTokenhandller");

// ✅ Fix: Define /me route BEFORE /:id
router.get("/me", validateToken, getMe); // Fetches logged-in user's info
router.get("/", getusers); // Gets all users
router.post("/", createuser); // Creates a new user
router.get("/:id", getuser); // Gets a single user by id
router.put("/:id", updateuser); // Updates a user by id
router.delete("/:id", deleteuser); // Deletes a user by id

// Define routes for authentication
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
