const express = require('express');
const router = express.Router();
const { Login } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleWare');

router.post('/login', Login);


module.exports = router;