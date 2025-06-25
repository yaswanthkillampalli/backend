const bcrypt = require('bcrypt');

const password = ''; // Replace this with the actual password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log(hash);
  }
});