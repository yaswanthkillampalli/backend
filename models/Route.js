const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const routeSchema = new mongoose.Schema({
  route_no: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
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
  stopPresent: {
    type:Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

routeSchema.plugin(AutoIncrement, { inc_field: 'routeId' });

const Route = mongoose.model('Route', routeSchema);

module.exports = Route;