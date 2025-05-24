// controllers/tripController.js
const asyncHandler = require("express-async-handler");
const Trip = require("../models/tripModel");
const Reservation = require("../models/reservationModel");


// @desc    Create new trip
// @route   POST /api/v1/trips
// @access  Admin
const createTrip = asyncHandler(async (req, res) => {
  const {
    destination,
    price,
    description,
    debutDate,
    endDate,
    tripType,
    reduction,
  } = req.body;
  const image = req.file?.path;

  if (
    !destination ||
    price === undefined ||
    price === null ||
    !description ||
    !debutDate ||
    !endDate ||
    !image
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  // Calculate discounted price if reduction exists
  let finalPrice = price;
  if (reduction && reduction > 0) {
    finalPrice = (parseFloat(price) * (1 - reduction / 100)).toFixed(2);
  }

  const trip = await Trip.create({
    destination,
    price: finalPrice,
    description,
    debutDate,
    endDate,
    image,
    tripType,
    reduction,
  });

  res.status(201).json({ success: true, data: trip });
});

// @desc    Get all trips
// @route   GET /api/v1/trips
// @access  Public
const getTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find();
  res.status(200).json({ success: true, data: trips });
});

// @desc    Get single trip
// @route   GET /api/v1/trips/:id
// @access  Public
const getTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }
  res.status(200).json({ success: true, data: trip });
});

// @desc    Update trip
// @route   PUT /api/v1/trips/:id
// @access  Admin
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  if (req.file && req.file.path) {
    req.body.image = req.file.path;
  }

  // If admin updates reduction or price, recalculate final price
  if (req.body.reduction || req.body.price) {
    const reduction =
      req.body.reduction !== undefined ? req.body.reduction : trip.reduction;
    const price = req.body.price !== undefined ? req.body.price : trip.price;

    if (reduction && reduction > 0) {
      req.body.price = (parseFloat(price) * (1 - reduction / 100)).toFixed(2);
    }
  }

  const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ success: true, data: updatedTrip });
});

// @desc    Delete trip
// @route   DELETE /api/v1/trips/:id
// @access  Admin
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  // 🔍 Check for existing reservations
  const existingReservations = await Reservation.find({ tripId: trip._id });
  if (existingReservations.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete trip with existing reservations",
    });
  }

  // ✅ No reservations → proceed with deletion
  await Trip.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Trip deleted successfully" });
});


// @desc    Toggle trip status (activate/deactivate)
// @route   PATCH /api/v1/trips/:id/toggle-status
// @access  Admin
const toggleTripStatus = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  trip.isActive = !trip.isActive;
  await trip.save();

  res.status(200).json({
    success: true,
    message: `Trip ${trip.isActive ? "activated" : "deactivated"}`,
    data: trip,
  });
});
module.exports = {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  toggleTripStatus,
};
