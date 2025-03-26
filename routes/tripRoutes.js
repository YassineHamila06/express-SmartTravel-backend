const express = require("express");
const router = express.Router();
const { uploadTripImage } = require("../controllers/middleware/uploadMiddleware"); // Import the correct upload middleware
const {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  activateTrip,
} = require("../controllers/tripController");

// Use Multer only for create and update (optional image upload)
router.post("/add", uploadTripImage.single("image"), createTrip); // Handles image upload for trip creation
router.put("/update/:id", uploadTripImage.single("image"), updateTrip); // Handles image upload for trip update

// Routes for fetching and deleting trips (no image upload required here)
router.get("/get", getTrips);
router.get("/get/:id", getTrip);
router.delete("/delete/:id", deleteTrip);

// Route for activating a trip (no image upload here)
router.route("/:id/activate").patch(activateTrip); // Admin: Activate trip

module.exports = router;
