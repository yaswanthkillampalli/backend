const jwt = require('jsonwebtoken');

// Replace with actual values
const userId = '6855a3b124a19ff089b7f284'; // Example MongoDB _id
const username = '238T1A4252';
const secretKey = "288b6b7f8714720a683203f4700dc0f4e68775afd34d8fa8dfe4f2ac90ce9c3b"; // Ideally use process.env.JSON_TOKEN
const date = Date.now();
// Token payload
const payload = {
  id: userId,
  username: username,
  passwordVersion: date // Example field to track password changes
};

console.log(date);
// Token options
const options = {
  expiresIn: '2d' // Token validity
};

// Generate token
const token = jwt.sign(payload, secretKey, options);

console.log(token);

