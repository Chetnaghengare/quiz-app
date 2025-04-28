const express = require('express');
const { getUserScore } = require('../controllers/scoreController');
 
const router = express.Router();


// Get score & submissions for a student
router.get('/getscore/:email', getUserScore);

module.exports = router;
