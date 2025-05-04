const express = require("express");
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionById,
} = require("../controllers/questionController");

router.post("/add", createQuestion);
router.get("/get", getQuestions);
router.get("/get/:id", getQuestionById);
router.delete("/delete/:id", deleteQuestion);
router.put("/update/:id", updateQuestion);

module.exports = router;