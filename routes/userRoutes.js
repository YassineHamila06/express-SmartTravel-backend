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
const { uploadProfileImage } = require("../controllers/middleware/uploadMiddleware"); // Import the correct upload middleware

// ✅ Fix: Define /me route BEFORE /:id
router.get("/me", validateToken, getMe); // Fetches logged-in user's info
router.get("/get", getusers); // Gets all users
router.post("/add", createuser); // Creates a new user
router.get("/get/:id", getuser); // Gets a single user by id

// Update user route with optional profile image upload
router.put("/update/:id", uploadProfileImage.single("profileImage"), updateuser); // Use the correct middleware for profile image upload

router.delete("/delete/:id", deleteuser); // Deletes a user by id

// Define routes for authentication
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
