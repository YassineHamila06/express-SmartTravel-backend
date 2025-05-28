const EventReservation = require("../models/eventReservationModel");
const Event = require("../models/eventsModel");
const User = require("../models/userModel");
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

const createEventReservation = asyncHandler(async (req, res) => {
  const { eventId, userId, numberOfPeople, totalPrice, notes, paymentMethod } =
    req.body;

  if (!eventId) {
    return res.status(400).json({
      success: false,
      message: "eventId is required",
    });
  }

  const event = await Event.findById(eventId);
  if (!event)
    return res.status(404).json({ success: false, message: "Event not found" });

  const user = await User.findById(userId);
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const reservation = await EventReservation.create({
    eventId,
    userId,
    numberOfPeople,
    totalPrice,
    notes,
    paymentMethod,
  });
  //zid point to user
  user.points += 80;
  await user.save();

  // Send confirmation email
  if (user.email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Event Reservation Confirmed ✔️",
      text: `Hello ${user.firstname || user.name},

  Your reservation for the event "${event.title}" has been confirmed!

  📅 Date: ${event.date}
  📍 Location: ${event.location}
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
    message: "Event reservation created successfully",
    reservation,
  });
});

const getEventReservations = asyncHandler(async (req, res) => {
  const reservations = await EventReservation.find()
    .populate("eventId")
    .populate("userId");
  res.status(200).json({ success: true, reservations });
});

const getEventReservation = asyncHandler(async (req, res) => {
  const reservation = await EventReservation.findById(req.params.id)
    .populate("eventId")
    .populate("userId");
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }
  res.status(200).json({ success: true, reservation });
});

const updateEventReservation = asyncHandler(async (req, res) => {
  const { eventId, userId, numberOfPeople, totalPrice, notes, paymentMethod } =
    req.body;

  const reservation = await EventReservation.findById(req.params.id);
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }

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

const deleteEventReservation = asyncHandler(async (req, res) => {
  const reservation = await EventReservation.findById(req.params.id);
  if (!reservation) {
    return res
      .status(404)
      .json({ success: false, message: "Reservation not found" });
  }

  await EventReservation.findByIdAndDelete(req.params.id);
  res
    .status(200)
    .json({ success: true, message: "Reservation deleted successfully" });
});

const getEventReservationsByUser = asyncHandler(async (req, res) => {
  const reservations = await EventReservation.find({
    userId: req.params.userId,
  })
    .populate("eventId")
    .populate("userId");

  res.status(200).json({ success: true, reservations });
});

const getEventReservationsByEvent = asyncHandler(async (req, res) => {
  const reservations = await EventReservation.find({
    eventId: req.params.eventId,
  })
    .populate("eventId")
    .populate("userId");
  res.status(200).json({ success: true, reservations });
});

const updateEventReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const reservation = await EventReservation.findById(req.params.id);
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
const getEventReservationsByStatus = asyncHandler(async (req, res) => {
  const reservations = await EventReservation.find({
    status: req.params.status,
  })
    .populate("eventId")
    .populate("userId");

  res.status(200).json({ success: true, reservations });
});

module.exports = {
  createEventReservation,
  getEventReservations,
  getEventReservation,
  updateEventReservation,
  deleteEventReservation,
  getEventReservationsByUser,
  getEventReservationsByEvent,
  updateEventReservationStatus,
  getEventReservationsByStatus,
};