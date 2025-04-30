const express = require("express");
const router = express.Router();
const {
  createEventReservation,
  getEventReservations,
  getEventReservation,
  updateEventReservation,
  deleteEventReservation,
  getEventReservationsByUser,
  getEventReservationsByEvent,
  updateEventReservationStatus,
  getEventReservationsByStatus,
} = require("../controllers/eventReservationController");

router.post("/add", createEventReservation);
router.get("/get", getEventReservations);
router.get("/get/:id", getEventReservation);
router.put("/update/:id", updateEventReservation);
router.delete("/delete/:id", deleteEventReservation);

router.get("/user/:userId", getEventReservationsByUser);
router.get("/event/:eventId", getEventReservationsByEvent);
router.put("/status/:id", updateEventReservationStatus);
router.get("/filter-status/:status", getEventReservationsByStatus);


module.exports = router;
