// controllers/tripController.js
const asyncHandler = require("express-async-handler");
const Trip = require("../models/tripModel");

// @desc    Create new trip
// @route   POST /api/v1/trips
// @access  Admin
const createTrip = asyncHandler(async (req, res) => {
  const { destination, price, description, debutDate, endDate } = req.body;
const image = req.file?.path;

  if (!destination || !price || !description || !debutDate || !endDate || !image) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const trip = await Trip.create({
    destination,
    price,
    description,
    debutDate,
    endDate,
    image,
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
  if (req.file && req.file.path){
    req.body.image = req.file.path;
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

  await Trip.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Trip deleted successfully" });
});

// @desc    Activate trip
// @route   PATCH /api/v1/trips/:id/activate
// @access  Admin
const activateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, message: "Trip not found" });
  }

  trip.isActive = true;
  await trip.save();

  res.status(200).json({ success: true, message: "Trip activated", data: trip });
});

module.exports = {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  activateTrip,
};
