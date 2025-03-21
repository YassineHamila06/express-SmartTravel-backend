const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: [true, "Please provide a destination"],
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
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);

