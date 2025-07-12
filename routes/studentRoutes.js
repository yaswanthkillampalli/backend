const express = require('express');
const router = express.Router();
const { getStudentDetails, getTotalCredits,getCertificatesCount ,coursesRegistered, getCalendarDetails, getNearestExamDetails, getCurrentCGPA, getAttendenceDays } = require('../controllers/studentController');
const authenticate = require('../middleware/authMiddleWare');

router.get('/details', authenticate, getStudentDetails);
router.get('/total-credits', authenticate, getTotalCredits);
router.get('/courses-registered', authenticate, coursesRegistered);
router.get('/current-cgpa', authenticate, getCurrentCGPA);
router.get('/attendance-days', authenticate, getAttendenceDays);
router.get('/nearest-exam', authenticate, getNearestExamDetails);
router.get('/calendar', authenticate, getCalendarDetails);
router.get('/certificates-count', authenticate, getCertificatesCount);
module.exports = router;