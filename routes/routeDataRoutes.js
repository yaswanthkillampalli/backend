const express = require('express');
const router = express.Router();

const { addRouteData } = require('../controllers/routeController'); // Adjust path if needed

router.post('/add', addRouteData);

module.exports = router;