const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleWare');
const { changePassword } = require('../controllers/passwordController');

router.put('/change-password', authenticate, changePassword);

module.exports = router;