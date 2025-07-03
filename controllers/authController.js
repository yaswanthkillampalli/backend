const User = require('../models/User');

const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bycrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password is Wrong' });
    }

    const token = jwt.sign({ id: user._id, username: user.username , passwordVersion : user.passwordVersion }, process.env.JSON_TOKEN, {
      expiresIn: '2d',
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyToken = (req, res) => {
  const user = req.user; // This comes from the auth middleware
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
  });
  
}