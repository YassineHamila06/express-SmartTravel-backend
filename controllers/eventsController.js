// controllers/eventsController.js
const asyncHandler = require("express-async-handler");
const Event = require("../models/eventsModel");
const EventReservation = require("../models/eventReservationModel");


// @desc    Create new event
// @route   POST /api/v1/events
// @access  Admin
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, location, date, time, price } = req.body;
  const image = req.file?.path;

  if (!title || !description || !location || !date || !time || !image || price === undefined || price === null) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const event = await Event.create({
    title,
    description,
    location,
    date,
    time,
    image,
    price,
  }); 
  if (!event) {
    return res.status(400).json({ success: false, message: "Failed to create event" });
  }

  res.status(201).json({ success: true, data: event });
});

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ isActive: true });
  res.status(200).json({ success: true, data: events });
});

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  res.status(200).json({ success: true, data: event });
});

// @desc    Update event
// @route   PUT /api/v1/events/:id
// @access  Admin
const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
  
    const allowedFields = ["title", "description", "location", "date", "time", "image", "isActive", "price"];
    const updates = {};
  
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
  
    if (req.file?.path) {
      updates.image = req.file.path;
    }
  
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
  
    res.status(200).json({ success: true, data: updatedEvent });
  });
  

// @desc    Delete event
// @route   DELETE /api/v1/events/:id
// @access  Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Check if any reservations exist for this event
  const existingReservations = await EventReservation.find({ eventId: event._id });
  if (existingReservations.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete event with existing reservations",
    });
  }

  await Event.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Event deleted successfully" });
});

// @desc    Toggle event status (activate/deactivate)
// @route   PATCH /api/v1/events/:id/toggle-status
// @access  Admin
const toggleEventStatus = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  event.isActive = !event.isActive;
  await event.save();

  res.status(200).json({
    success: true,
    message: `Event ${event.isActive ? "activated" : "deactivated"}`,
    data: event,
  });
});
module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
};
