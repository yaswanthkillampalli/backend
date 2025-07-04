const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dz7moyhci', 
  api_key: '423888446479688', 
  api_secret: 'J5bDUMS3hVexehFv96EpO5dGcUY'
});

module.exports = cloudinary;