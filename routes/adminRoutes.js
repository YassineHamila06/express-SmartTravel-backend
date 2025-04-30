const express = require("express");
const router = express.Router();
const { uploadProfileImage } = require("../controllers/middleware/uploadMiddleware"); // Import the upload middleware
const {
  loginAdmin,
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  forgotPassword,
  resetPassword,
  verifyOtp,
  getMe,
} = require("../controllers/adminController");
const validateToken = require("../controllers/middleware/validateTokenhandller-admin");


router.post("/login", loginAdmin);
router.get("/get", getAdmins);
router.get("/get/:id", getAdmin);
router.post("/add", uploadProfileImage.single("profileImage"), createAdmin);
router.put("/update/:id", uploadProfileImage.single("profileImage"), updateAdmin);
router.delete("/delete/:id", deleteAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", validateToken, getMe);
router.post("/verify-otp", verifyOtp);
module.exports = router;
