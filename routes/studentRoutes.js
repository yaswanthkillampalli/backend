const express = require('express');
const router = express.Router();
const { getStudentDetails, getTotalCredits, coursesRegistered, coursesCompleted, getCurrentCGPA } = require('../controllers/studentController');
const authenticate = require('../middleware/authMiddleWare');

router.get('/details', authenticate, getStudentDetails);
router.get('/total-credits', authenticate, getTotalCredits);
router.get('/courses-registered', authenticate, coursesRegistered);
router.get('/courses-completed', authenticate, coursesCompleted);
router.get('/current-cgpa', authenticate, getCurrentCGPA);

module.exports = router;