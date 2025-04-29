const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        tripId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Trip",
            required: false,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: false,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
        createdAt: {
            type: Date,
            default: Date.now,
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

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;




