const express = require('express');
const router = express.Router();
const { login, verifyToken } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleWare');
router.post('/login', login);
router.get('/verify',authenticate,verifyToken);
module.exports = router;