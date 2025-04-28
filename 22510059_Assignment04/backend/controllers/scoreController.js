const db = require('../config/db'); 

// Get Score & Submissions for a Student
exports.getUserScore = (req, res) => {
    const studentEmail = req.params.email;

    if (!studentEmail) {
        return res.status(400).json({ message: "Student email is required." });
    }

    const sql = `SELECT id, time_taken, score, answers, submitted_at 
                 FROM test_submissions 
                 WHERE student_name = ? 
                 ORDER BY submitted_at DESC`;

    db.query(sql, [studentEmail], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to fetch test scores." });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No test submissions found for this student." });
        }
        res.json(results);
    });
};
