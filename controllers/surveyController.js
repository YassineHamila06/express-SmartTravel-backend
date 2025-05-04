const Survey = require("../models/surveyModel");
const Question = require("../models/questionModel");
const asyncHandler = require("express-async-handler");

// Create a new survey

const createSurvey = asyncHandler(async (req, res) => {
  const { title, description, questions } = req.body;

  // Create the survey
  const survey = await Survey.create({ title, description });

  // If questions are provided, create them
  if (questions && Array.isArray(questions) && questions.length > 0) {
    // Add the survey ID to each question
    const questionsWithSurveyId = questions.map((question, index) => ({
      ...question,
      surveyId: survey._id,
      order: question.order || index + 1, // Use provided order or default to index + 1
    }));

    // Create all questions in the database
    await Question.insertMany(questionsWithSurveyId);

    // Get the created questions to return with the response
    const createdQuestions = await Question.find({ surveyId: survey._id }).sort(
      { order: 1 }
    );

    // Return survey with its questions
    return res.status(201).json({
      ...survey.toObject(),
      questions: createdQuestions,
    });
  }

  // If no questions, just return the survey
  res.status(201).json(survey);
});

// Get all surveys

const getSurveys = asyncHandler(async (req, res) => {
  const surveys = await Survey.find();
  res.status(200).json(surveys);
});

// Get a single survey by ID

const getSurveyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await Survey.findById(id);

  // Get questions for this survey
  const questions = await Question.find({ surveyId: id }).sort({ order: 1 });

  // Return survey with its questions
  res.status(200).json({
    ...survey.toObject(),
    questions,
  });
});

// Update a survey

const updateSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, questions } = req.body;

  // Find and update the survey
  const survey = await Survey.findByIdAndUpdate(
    id,
    { title, description },
    { new: true }
  );

  if (!survey) {
    res.status(404);
    throw new Error("Survey not found");
  }

  // Handle questions if provided
  if (questions && Array.isArray(questions)) {
    const updatedQuestions = [];
    const newQuestions = [];
    const existingQuestionIds = [];

    // Separate questions into existing ones (with _id) and new ones
    for (const question of questions) {
      if (question._id) {
        // This is an existing question to update
        updatedQuestions.push(question);
        existingQuestionIds.push(question._id);
      } else {
        // This is a new question to create
        newQuestions.push({
          ...question,
          surveyId: id,
          order:
            question.order || updatedQuestions.length + newQuestions.length + 1,
        });
      }
    }

    // Update existing questions
    if (updatedQuestions.length > 0) {
      const updatePromises = updatedQuestions.map((question) => {
        const { _id, ...updateData } = question;
        // Ensure surveyId doesn't change
        updateData.surveyId = id;
        // Add timestamp
        updateData.updatedAt = Date.now();

        return Question.findByIdAndUpdate(_id, updateData, { new: true });
      });

      await Promise.all(updatePromises);
    }

    // Create new questions
    if (newQuestions.length > 0) {
      await Question.insertMany(newQuestions);
    }

    // Delete questions that are no longer in the survey
    // First, get all existing questions for this survey
    const currentQuestions = await Question.find({ surveyId: id });

    // Find questions to delete (those not in existingQuestionIds)
    const questionsToDelete = currentQuestions.filter(
      (question) => !existingQuestionIds.includes(question._id.toString())
    );

    // Delete those questions
    if (questionsToDelete.length > 0) {
      const deletePromises = questionsToDelete.map((question) =>
        Question.findByIdAndDelete(question._id)
      );

      await Promise.all(deletePromises);
    }

    // Get all questions for this survey (updated and new)
    const allQuestions = await Question.find({ surveyId: id }).sort({
      order: 1,
    });

    // Return updated survey with all questions
    return res.status(200).json({
      ...survey.toObject(),
      questions: allQuestions,
    });
  }

  // If no questions provided, just return the updated survey
  res.status(200).json(survey);
});

// Delete a survey

const deleteSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the survey first to check if it exists
  const survey = await Survey.findById(id);

  if (!survey) {
    res.status(404);
    throw new Error("Survey not found");
  }

  // Delete the survey
  await Survey.findByIdAndDelete(id);

  // Delete all questions associated with this survey
  await Question.deleteMany({ surveyId: id });

  res
    .status(200)
    .json({ message: "Survey and its questions deleted successfully" });
});

// Publish a survey

const publishSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await Survey.findByIdAndUpdate(
    id,
    { status: "published" },
    { new: true }
  );
  res.status(200).json(survey);
});

// Complete a survey

const completeSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await Survey.findByIdAndUpdate(
    id,
    { status: "completed" },
    { new: true }
  );
  res.status(200).json(survey);
});

// Get all questions for a survey

const getQuestionsForSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const questions = await Question.find({ surveyId: id }).sort({ order: 1 });
  res.status(200).json(questions);
});

module.exports = {
  createSurvey,
  getSurveys,
  getSurveyById,
  updateSurvey,
  deleteSurvey,
  publishSurvey,
  completeSurvey,
  getQuestionsForSurvey,
};