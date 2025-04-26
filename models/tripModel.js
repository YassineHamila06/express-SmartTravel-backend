const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: [true, "Please provide a destination"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    price: {
      type: String,
      required: [true, "Please provide a price"],
    },
    debutDate: {
      type: Date,
      required: [true, "Please provide a start date"],
    },
    endDate: {
      type: Date,
      required: [true, "Please provide an end date"],
    },
    image: {
      type: String, // store image URL or path
      required: [true, "Please provide an image"],
    },
    isActive: {
      type: Boolean,
      default: true,
      required: [false],
    },
    tripType: {
      type: String,
      enum: [
        "Beach destination",
        "Cultural tour",
        "Adventure travel",
        "Nature escape",
        "City break",
        "Luxury travel",
        "Budget travel",
        "Wellness retreat",
        "Family vacation",
      ],
      required: [false, "Please provide a trip type"],
    },
    reduction: {
      type: Number,
      default: 0,
      required: [false],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
