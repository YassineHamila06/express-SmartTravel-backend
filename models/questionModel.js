const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Survey",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  type: {
    type: String,
    enum: [
      "short-text",
      "long-text",
      "multiple-choice", //fix this
      "checkbox", //fix this
      "date", //fix this
      "time", //fix this
    ],
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: false,
  },
});

module.exports = mongoose.model("Question", questionSchema);