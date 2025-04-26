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
} = require("../controllers/adminController");


router.post("/login", loginAdmin);
router.get("/get", getAdmins);
router.get("/get/:id", getAdmin);
router.post("/add", uploadProfileImage.single("profileImage"), createAdmin);
router.put("/update/:id", uploadProfileImage.single("profileImage"), updateAdmin);
router.delete("/delete/:id", deleteAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
module.exports = router;
