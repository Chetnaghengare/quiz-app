const express = require("express");
const { createQuestion, getAllQuestions, updateQuestion, deleteQuestion, submitTest, getTestSubmissions } = require("../controllers/questionController");

const router = express.Router();

router.post("/create", createQuestion);
router.get("/", getAllQuestions);          
router.put("/:id", updateQuestion);        
router.delete("/:id", deleteQuestion); 


router.post('/submit-test', submitTest);
router.get('/test-submissions', getTestSubmissions);

module.exports = router;
