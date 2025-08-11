const Route = require('../models/Route'); 

const addRouteData = async (req, res) => {
  try {
    const { route_no, name, lng, lat, direction, stopPresent  } = req.body;
    if (!route_no || !name || !lng || !lat || !direction) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const newRoute = new Route({
      route_no,
      name,
      lng,
      lat,
      direction,
      stopPresent,
    });

    const savedRoute = await newRoute.save();

    res.status(201).json({ 
      message: 'Route data added successfully!',
      data: savedRoute 
    });

  } catch (error) {
    console.error('Error adding route data:', error);
    res.status(500).json({ message: 'Server error while adding route data.' });
  }
};

module.exports = {
  addRouteData,
};