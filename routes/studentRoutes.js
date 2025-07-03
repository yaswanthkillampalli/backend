const express = require('express');
const router = express.Router();
const { getStudentDetails, getTotalCredits, coursesRegistered, getCurrentCGPA } = require('../controllers/studentController');
const authenticate = require('../middleware/authMiddleWare');

router.get('/details', authenticate, getStudentDetails);
router.get('/total-credits', authenticate, getTotalCredits);
router.get('/courses-registered', authenticate, coursesRegistered);
router.get('/current-cgpa', authenticate, getCurrentCGPA);

module.exports = router;