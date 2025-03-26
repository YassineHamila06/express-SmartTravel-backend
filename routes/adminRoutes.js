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
} = require("../controllers/adminController");


router.post("/login", loginAdmin);
router.get("/get", getAdmins);
router.get("/get/:id", getAdmin);
router.post("/add", uploadProfileImage.single("profileImage"), createAdmin);
router.put("/update/:id", uploadProfileImage.single("profileImage"), updateAdmin);
router.delete("/delete/:id", deleteAdmin);

module.exports = router;
