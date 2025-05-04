const Question = require("../models/questionModel");
const asyncHandler = require("express-async-handler");

// Define question types that require options - moved to top-level for reuse
const typesWithOptions = [
  "multiple-choice",
  "checkbox",
  "dropdown",
  "linear-scale",
];

// Helper function to validate question data
const validateQuestionData = (questionData) => {
  const { surveyId, text, type, options } = questionData;

  // Validate required fields
  if (!surveyId || !text || !type) {
    return { isValid: false, error: "Please provide surveyId, text, and type" };
  }

  // Validate options based on question type
  if (typesWithOptions.includes(type)) {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return {
        isValid: false,
        error: `Question type '${type}' requires options`,
      };
    }
  }

  return { isValid: true };
};

// Create a new question
const createQuestion = asyncHandler(async (req, res) => {
  const { surveyId, text, type, options, order } = req.body;

  // Validate question data
  const validation = validateQuestionData({ surveyId, text, type, options });
  if (!validation.isValid) {
    res.status(400);
    throw new Error(validation.error);
  }

  // Create question
  const question = await Question.create({
    surveyId,
    text,
    type,
    options: typesWithOptions.includes(type) ? options : [],
    order: order || 1,
  });

  res.status(201).json(question);
});

// Get all questions for a survey
const getQuestions = asyncHandler(async (req, res) => {
  const { surveyId } = req.params;

  if (!surveyId) {
    res.status(400);
    throw new Error("Please provide a survey ID");
  }

  const questions = await Question.find({ surveyId }).sort({ order: 1 });
  res.status(200).json(questions);
});

// Get a single question by ID
const getQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findById(id);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.status(200).json(question);
});

// Update a question
const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { surveyId, text, type, options, order } = req.body;

  // Find the question first
  const question = await Question.findById(id);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  // Prepare update data
  const updateData = {
    ...(surveyId && { surveyId }),
    ...(text && { text }),
    ...(type && { type }),
    updatedAt: Date.now(),
  };

  // If type is being updated, validate the data
  if (type) {
    const validation = validateQuestionData({
      surveyId: surveyId || question.surveyId,
      text: text || question.text,
      type,
      options,
    });

    if (!validation.isValid) {
      res.status(400);
      throw new Error(validation.error);
    }

    // Update options based on the new type
    updateData.options = typesWithOptions.includes(type) ? options : [];
  }
  // If only options are being updated but type remains the same
  else if (options && typesWithOptions.includes(question.type)) {
    // Validate options for existing type
    if (!Array.isArray(options) || options.length === 0) {
      res.status(400);
      throw new Error(`Question type '${question.type}' requires options`);
    }
    updateData.options = options;
  }

  if (order !== undefined) {
    updateData.order = order;
  }

  // Update the question
  const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(updatedQuestion);
});

// Delete a question
const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findById(id);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  await Question.findByIdAndDelete(id);

  res.status(200).json({ message: "Question deleted successfully" });
});

// Reorder questions within a survey
const reorderQuestions = asyncHandler(async (req, res) => {
  const { surveyId } = req.params;
  const { questionOrders } = req.body;

  if (!questionOrders || !Array.isArray(questionOrders)) {
    res.status(400);
    throw new Error("Please provide questionOrders array");
  }

  // Validate the format of questionOrders
  const isValidFormat = questionOrders.every(
    (item) => item._id && item.order !== undefined
  );

  if (!isValidFormat) {
    res.status(400);
    throw new Error("Each item in questionOrders must have _id and order");
  }

  // Update each question's order
  const updatePromises = questionOrders.map((item) => {
    return Question.findByIdAndUpdate(
      item._id,
      { order: item.order, updatedAt: Date.now() },
      { new: true }
    );
  });

  await Promise.all(updatePromises);

  // Get the updated questions
  const updatedQuestions = await Question.find({ surveyId }).sort({ order: 1 });

  res.status(200).json(updatedQuestions);
});

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
};