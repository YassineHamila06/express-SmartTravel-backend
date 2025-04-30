const mongoose = require("mongoose");

const eventReservationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    numberOfPeople: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
    paymentMethod: {
      type: String,
      enum: ["konnect", "paypal", "bank_transfer", "credit_card", "cash", "other"],
      default: "credit_card",
    },
  },
  { timestamps: true }
);

const EventReservation = mongoose.model("EventReservation", eventReservationSchema);

module.exports = EventReservation;
