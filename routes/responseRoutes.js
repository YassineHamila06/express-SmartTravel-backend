const express = require("express");
const router = express.Router();
const {
  createResponse,
  getResponses,
  getResponse,
  updateResponse,
  deleteResponse,
  getResponsesByQuestion,
  getResponsesByUser,
  getResponsesBySurvey,
} = require("../controllers/responseController");

router.post("/add", createResponse);
router.get("/get", getResponses);
router.get("/get/:id", getResponse);
router.put("/update/:id", updateResponse);
router.delete("/delete/:id", deleteResponse);
router.get("/get-by-question/:questionId", getResponsesByQuestion);
router.get("/get-by-user/:userId", getResponsesByUser);
router.get("/get-by-survey/:surveyId", getResponsesBySurvey);


module.exports = router;