const express = require("express");
const router = express.Router();
const {
  createReservation,
  getReservations,
  deleteReservation,
  updateReservation,
  getReservation,
  updateReservationStatus,
  getReservationsByUser,
  getReservationsByTrip,
  getReservationsByStatus,
  getReservationsByDateRange,
  getReservationsByEvent,
} = require("../controllers/reservationController");

router.post("/add", createReservation);
router.get("/get", getReservations);
router.delete("/delete/:id", deleteReservation);
router.put("/update/:id", updateReservation);
router.get("/get/:id", getReservation);

router.put("/status/:id", updateReservationStatus); 

router.get("/user/:userId", getReservationsByUser);
router.get("/trip/:tripId", getReservationsByTrip);
router.get("/event/:eventId", getReservationsByEvent);
router.get("/filter-status/:status", getReservationsByStatus); // ✅ renamed to avoid conflict
router.get("/date-range", getReservationsByDateRange);

module.exports = router;
