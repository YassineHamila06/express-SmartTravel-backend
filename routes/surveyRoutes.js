const express = require("express");
const router = express.Router();
const {
  createSurvey,
  getSurveys,
  getSurveyById,
  publishSurvey,
  completeSurvey,
  deleteSurvey,
  updateSurvey,
} = require("../controllers/surveyController");

router.post("/add", createSurvey);
router.get("/get", getSurveys);
router.get("/get/:id", getSurveyById);
router.patch("/update/:id", updateSurvey);
router.delete("/delete/:id", deleteSurvey);
router.patch("/publish/:id", publishSurvey);
router.patch("/complete/:id", completeSurvey);

module.exports = router;