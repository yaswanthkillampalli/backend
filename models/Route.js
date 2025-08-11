const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  route_no: {
    type: Number,
    required: true // Makes this field mandatory
  },
  name: {
    type: String,
    required: true,
    trim: true // Removes whitespace from the beginning and end
  },
  lng: {
    type: Number,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  direction: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now // Automatically sets the current date and time
  }
});


const Route = mongoose.model('Route', routeSchema);

module.exports = Route;