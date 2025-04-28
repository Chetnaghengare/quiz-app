const db = require("../config/db");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); 
  }
});

const upload = multer({ storage: storage }).single("image"); 

// Create Question
exports.createQuestion = (req, res) => {
  upload(req, res, (err) => {
    if (err) return res.status(500).json({ message: "File upload error", error: err });

    const { question_text, option_a, option_b, option_c, option_d, correct_option, created_by } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Store file path

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option || !created_by) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const query = `
      INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option, image_url, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [question_text, option_a, option_b, option_c, option_d, correct_option, image_url, created_by], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      res.status(201).json({ message: "Question added successfully", image_url });
    });
  });

};

// Fetch All Questions
exports.getAllQuestions = (req, res) => {
  db.query("SELECT * FROM questions", (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(200).json(result);
  });
};

// Update Question
exports.updateQuestion = (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  const { id } = req.params;

  if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_option) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `
    UPDATE questions 
    SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=? 
    WHERE id=?`;

  db.query(query, [question_text, option_a, option_b, option_c, option_d, correct_option, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(200).json({ message: "Question updated successfully" });
  });
};

// Delete Question
exports.deleteQuestion = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM questions WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(200).json({ message: "Question deleted successfully" });
  });
};



exports.submitTest = (req, res) => {
  const { studentName, answers, timeTaken } = req.body;

  if (!studentName || !answers || !timeTaken) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Fetch correct answers from the database
  const correctAnswersQuery = "SELECT id, correct_option FROM questions";
  
  db.query(correctAnswersQuery, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Failed to fetch correct answers." });
    }

    console.log("Correct Answers from DB:", results); // Debugging line

    // Create a map of questionId → correctAnswer
    const correctAnswersMap = {};
    results.forEach((q) => {
      correctAnswersMap[q.id] = q.correct_option.trim().toUpperCase(); // Ensure uniform case
    });

    console.log("Correct Answers Map:", correctAnswersMap); // Debugging line

    // Calculate score
    let score = 0;
    for (const questionId in answers) {
      if (answers.hasOwnProperty(questionId)) {
        const submittedAnswer = answers[questionId].trim().toUpperCase(); // Ensure same format
        const correctAnswer = correctAnswersMap[questionId];

        console.log(`Q${questionId}: Submitted=${submittedAnswer}, Correct=${correctAnswer}`); // Debugging line

        if (submittedAnswer === correctAnswer) {
          score++; // Increment score if the answer is correct
        }
      }
    }

    console.log("Final Score:", score); // Debugging line

    // Convert answers object to JSON
    const answersJSON = JSON.stringify(answers);

    // Insert submission into the database with the calculated score
    const insertSubmissionQuery = `
      INSERT INTO test_submissions (student_name, answers, time_taken, score) 
      VALUES (?, ?, ?, ?)`;

    db.query(insertSubmissionQuery, [studentName, answersJSON, timeTaken, score], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Failed to submit test." });
      }
      res.json({ 
        message: "Test submitted successfully!", 
        submissionId: result.insertId,
        score: score 
      });
    });
  });
};





// Get All Test Submissions (For Viewing Scores)
exports.getTestSubmissions = (req, res) => {
  const sql = `SELECT * FROM test_submissions ORDER BY submitted_at DESC`;

  db.query(sql, (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Failed to fetch test submissions." });
      }
      res.json(results);
  });
};