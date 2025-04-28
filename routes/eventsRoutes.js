const express = require("express");
const router = express.Router();
const { uploadEventImage } = require("../controllers/middleware/uploadMiddleware");
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  activateEvent,
} = require("../controllers/eventsController");

router.post("/add", uploadEventImage.single("image"), createEvent);
router.get("/get", getEvents);
router.get("/get/:id", getEvent);
router.put("/update/:id", uploadEventImage.single("image"), updateEvent);
router.delete("/delete/:id", deleteEvent);
router.route("/:id/activate").patch(activateEvent);

module.exports = router;
