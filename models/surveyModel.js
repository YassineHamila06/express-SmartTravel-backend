const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["draft", "published", "completed"],
    default: "draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
    required: false,  
  },
  numberOfRespondents: {
    type: Number,
    default: 0,
    required: false,
  },
}, { timestamps: true });
module.exports = mongoose.model("Survey", surveySchema);