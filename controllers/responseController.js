const Response = require("../models/responseModel");
const mongoose = require("mongoose");

// Create a new response
const createResponse = async (req, res) => {
  try {
    const { questionId, userId, value } = req.body;

    // Validate required fields
    if (!questionId || !userId || !value) {
      return res.status(400).json({
        status: "error",
        message:
          "Please provide all required fields: questionId, userId, value",
      });
    }

    // Check if valid ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(questionId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid questionId or userId format",
      });
    }

    // Check if user has already responded to this question
    const existingResponse = await Response.findOne({ questionId, userId });
    if (existingResponse) {
      return res.status(400).json({
        status: "error",
        message: "User has already responded to this question",
      });
    }

    const newResponse = await Response.create({
      questionId,
      userId,
      value,
    });

    res.status(201).json({
      status: "success",
      data: {
        response: newResponse,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all responses
const getResponses = async (req, res) => {
  try {
    const responses = await Response.find()
      .populate("userId", "name email")
      .populate("questionId", "text");

    res.status(200).json({
      status: "success",
      results: responses.length,
      data: {
        responses,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get a single response by ID
const getResponse = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id)
      .populate("userId", "name email")
      .populate("questionId", "text");

    if (!response) {
      return res.status(404).json({
        status: "error",
        message: "Response not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        response,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get responses by question ID
const getResponsesByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid questionId format",
      });
    }

    const responses = await Response.find({ questionId }).populate(
      "userId",
      "name email"
    );

    res.status(200).json({
      status: "success",
      results: responses.length,
      data: {
        responses,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get responses by user ID
const getResponsesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid userId format",
      });
    }

    const responses = await Response.find({ userId }).populate(
      "questionId",
      "text"
    );

    res.status(200).json({
      status: "success",
      results: responses.length,
      data: {
        responses,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update a response
const updateResponse = async (req, res) => {
  try {
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a value for the response",
      });
    }

    const response = await Response.findByIdAndUpdate(
      req.params.id,
      { value, answeredAt: Date.now() },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      return res.status(404).json({
        status: "error",
        message: "Response not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        response,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete a response
const deleteResponse = async (req, res) => {
  try {
    const response = await Response.findByIdAndDelete(req.params.id);

    if (!response) {
      return res.status(404).json({
        status: "error",
        message: "Response not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  createResponse,
  getResponses,
  getResponse,
  getResponsesByQuestion,
  getResponsesByUser,
  updateResponse,
  deleteResponse,
};