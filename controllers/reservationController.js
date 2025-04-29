const Reservation = require("../models/reservationModel");
const Trip = require("../models/tripModel");
const User = require("../models/userModel");
const Event = require("../models/eventsModel");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
// @desc: Login user
// @route: POST /api/v1/users/login
// @access: Public

const createReservation = asyncHandler(async (req, res) => {
  const {
    tripId,
    eventId,
    userId,
    numberOfPeople,
    totalPrice,
    notes,
    paymentMethod,
  } = req.body;

  if (!tripId && !eventId) {
    return res.status(400).json({
      success: false,
      message: "Either tripId or eventId is required",
    });
  }

  let trip = null;
  let event = null;

  if (tripId) {
    trip = await Trip.findById(tripId);
    if (!trip)
      return res
        .status(404)
        .json({ success: false, message: "Trip not found" });
  }

  if (eventId) {
    event = await Event.findById(eventId);
    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
  }

  const user = await User.findById(userId);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const reservation = await Reservation.create({
    tripId,
    eventId,
    userId,
    numberOfPeople,
    totalPrice,
    notes,
    paymentMethod,
  });

  // Send confirmation email
  if (user.email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reservation Confirmed ✔️",
      text: `Hello ${user.firstname || user.name},

  Your reservation for the ${trip ? "trip" : "event"} to ${
        trip?.destination || event?.title || "a destination"
      } has been confirmed!

  📅 Date: ${trip?.debutDate || event?.date || "N/A"}

  👥 People: ${numberOfPeople}
  💵 Total Price: ${totalPrice}
  📝 Notes: ${notes || "None"}

  Thank you for booking with us!

  Best regards,
  The Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error("Email sending failed:", error);
      else console.log("Email sent: " + info.response);
    });
  }

  res.status(201).json({
    success: true,
    message: "Reservation created successfully",
    reservation,
  });
});
// @desc: Get all reservations
// @route: GET /api/v1/users
// @access: Public

const getReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate("tripId")
    .populate("eventId");

  res.status(200).json({ success: true, reservations });
});

// @desc    Delete reservation
// @route   DELETE /api/v1/trips/:id
// @access  Admin

const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }

  await Reservation.findByIdAndDelete(req.params.id);
  res
    .status(200)
    .json({ success: true, message: "Reservation deleted successfully" });
});
// @desc: Create new reservation
// @route: POST /api/v1/users
// @access: Public

const updateReservation = asyncHandler(async (req, res) => {
  const {
    tripId,
    eventId,
    userId,
    numberOfPeople,
    totalPrice,
    notes,
    paymentMethod,
  } = req.body;

  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }

  reservation.tripId = tripId;
  reservation.eventId = eventId;
  reservation.userId = userId;
  reservation.numberOfPeople = numberOfPeople;
  reservation.totalPrice = totalPrice;
  reservation.notes = notes;
  reservation.paymentMethod = paymentMethod;

  await reservation.save();

  res.status(200).json({
    success: true,
    message: "Reservation updated successfully",
    reservation,
  });
});

// @desc    Get single trip
// @route   GET /api/v1/trips/:id
// @access  Public

const getReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate("tripId") // Get full trip info if available
    .populate("eventId"); // Get full event info if available

  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }

  res.status(200).json({ success: true, reservation });
});

// @desc    Update reservation status
// @route   PUT /api/v1/reservations/:id/status
// @access  Admin

const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }

  reservation.status = status;
  await reservation.save();

  res.status(200).json({
    success: true,
    message: "Reservation status updated successfully",
    reservation,
  });
});

// @desc    Get all reservations by user
// @route   GET /api/v1/reservations/user/:userId
// @access  Public

const getReservationsByUser = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ userId: req.params.userId })
    .populate("tripId")
    .populate("eventId");

  res.status(200).json({ success: true, reservations });
});

// @desc    Get all reservations by trip
// @route   GET /api/v1/reservations/trip/:tripId
// @access  Public

const getReservationsByTrip = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ tripId: req.params.tripId });
  res.status(200).json({ success: true, reservations });
});
// @desc    Get all reservations by event
// @route   GET /api/v1/reservations/event/:eventId
// @access  Public
const getReservationsByEvent = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ eventId: req.params.eventId })
    .populate("tripId")
    .populate("eventId");

  res.status(200).json({ success: true, reservations });
});

// @desc    Get all reservations by status
// @route   GET /api/v1/reservations/status/:status
// @access  Public

const getReservationsByStatus = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ status: req.params.status });
  res.status(200).json({ success: true, reservations });
});

// @desc    Get all reservations by date range
// @route   GET /api/v1/reservations/date-range
// @access  Public

const getReservationsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;
  const reservations = await Reservation.find({
    createdAt: { $gte: startDate, $lte: endDate },
  });
  res.status(200).json({ success: true, reservations });
});

module.exports = {
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
};
