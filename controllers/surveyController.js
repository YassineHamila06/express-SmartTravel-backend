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
      order: question.order || index + 1,
    }));

    // Create all questions in the database
    await Question.insertMany(questionsWithSurveyId);

    // Get the created questions to return with the response
    const createdQuestions = await Question.find({ surveyId: survey._id }).sort(
      { order: 1 }
    );


    return res.status(201).json({
      ...survey.toObject(),
      questions: createdQuestions,
    });
  }

  res.status(201).json(survey);
});



const getSurveys = asyncHandler(async (req, res) => {
  const surveys = await Survey.find();
  res.status(200).json(surveys);
});


const getSurveyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await Survey.findById(id);

 
  const questions = await Question.find({ surveyId: id }).sort({ order: 1 });

  res.status(200).json({
    ...survey.toObject(),
    questions,
  });
});


const updateSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, questions } = req.body;


  const survey = await Survey.findByIdAndUpdate(
    id,
    { title, description },
    { new: true }
  );

  if (!survey) {
    res.status(404);
    throw new Error("Survey not found");
  }


  if (questions && Array.isArray(questions)) {
    const updatedQuestions = [];
    const newQuestions = [];
    const existingQuestionIds = [];

    for (const question of questions) {
      if (question._id) {
       
        updatedQuestions.push(question);
        existingQuestionIds.push(question._id);
      } else {

        newQuestions.push({
          ...question,
          surveyId: id,
          order:
            question.order || updatedQuestions.length + newQuestions.length + 1,
        });
      }
    }


    if (updatedQuestions.length > 0) {
      const updatePromises = updatedQuestions.map((question) => {
        const { _id, ...updateData } = question;
    
        updateData.surveyId = id;
    
        updateData.updatedAt = Date.now();

        return Question.findByIdAndUpdate(_id, updateData, { new: true });
      });

      await Promise.all(updatePromises);
    }

    if (newQuestions.length > 0) {
      await Question.insertMany(newQuestions);
    }


    const currentQuestions = await Question.find({ surveyId: id });

  
    const questionsToDelete = currentQuestions.filter(
      (question) => !existingQuestionIds.includes(question._id.toString())
    );

  
    if (questionsToDelete.length > 0) {
      const deletePromises = questionsToDelete.map((question) =>
        Question.findByIdAndDelete(question._id)
      );

      await Promise.all(deletePromises);
    }

  
    const allQuestions = await Question.find({ surveyId: id }).sort({
      order: 1,
    });


    return res.status(200).json({
      ...survey.toObject(),
      questions: allQuestions,
    });
  }

  res.status(200).json(survey);
});



const deleteSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const survey = await Survey.findById(id);

  if (!survey) {
    res.status(404);
    throw new Error("Survey not found");
  }
   if (survey.status === "published" ){
    res.status(400);
    throw new Error("Cannot delete a published survey");
  }

  
  await Survey.findByIdAndDelete(id);

  
  await Question.deleteMany({ surveyId: id });

  res
    .status(200)
    .json({ message: "Survey and its questions deleted successfully" });
});


const publishSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await Survey.findByIdAndUpdate(
    id,
    { status: "published" },
    { new: true }
  );
  res.status(200).json(survey);
});


const completeSurvey = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const survey = await Survey.findByIdAndUpdate(
    id,
    { status: "completed" },
    { new: true }
  );
  res.status(200).json(survey);
});


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