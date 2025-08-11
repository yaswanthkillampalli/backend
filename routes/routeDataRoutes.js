const express = require('express');
const router = express.Router();

const { addRouteData } = require('../controllers/routeController'); 

router.post('/add', addRouteData);

module.exports = router;