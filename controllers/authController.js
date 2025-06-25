const User = require('../models/User');

const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.Login = async (req, res) => {
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

    const token = jwt.sign({ id: user._id, username: user.username , passwordVersion : Date.now() }, process.env.JSON_TOKEN, {
      expiresIn: '2d',
    });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};