const User = require('../models/User');
const jwt = require("jsonwebtoken");  
const bcrypt = require('bcrypt');     

const generateToken = (userId,username,passwordVersion) => {
  try {
    const token = jwt.sign({ 
      id: userId,
      username: username,
      passwordVersion: passwordVersion
    }, process.env.JSON_TOKEN, {
      expiresIn: '2d'
    });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const currentPasswordHash = user.passwordHash;
    const currentpasswordCheckResult = await bcrypt.compare(currentPassword, currentPasswordHash);
    if (!currentpasswordCheckResult) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const newPasswordVersion = Date.now();
    user.passwordHash = newPasswordHash;
    user.passwordVersion = newPasswordVersion; // Update password version
    await user.save();

    const token = generateToken(user._id, user.username, newPasswordVersion);

    res.status(200).json({
      message: 'Password changed successfully.',
      token,
      expiresIn: '2d'
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: 'Server error.' });
  }
};