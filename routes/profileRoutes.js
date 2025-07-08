const express = require('express');
const router = express.Router();
const { getProfileDetails,getPersonalProfileDetails,getParentDetails } = require('../controllers/profileController');
const authenticate = require('../middleware/authMiddleWare');
router.get('/student',authenticate, getProfileDetails);
router.get('/personal-student', authenticate, getPersonalProfileDetails);
router.get('/student-parents', authenticate, getParentDetails);
module.exports = router;