const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Assuming you have a User model// Use environment variable for secret key

module.exports = async (req, res, next) => { // Make it async to use await
  const headers = req.headers.authorization;
  const token = headers && headers.startsWith("Bearer ") ? headers.split(" ")[1] : null; // Extract token from Bearer header

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JSON_TOKEN , async (err, decoded) => { // Use async callback
    if (err) {
      return res.status(403).json({ message: "Invalid Token"});
    }

    try {
      // 1. Get user from DB based on decoded userId
      const user = await User.findById(decoded.id); // Assuming _id is in token payload
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // 2. Check if the password version matches
      if(user.passwordVersion !== decoded.passwordVersion) {
        return res.status(401).json({ message: "Password has been changed, please log in again." });
      }

      req.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      next();
    } catch (dbError) {
      console.error("Database error during token verification:", dbError);
      return res.status(500).json({ message: "Internal server error during authentication." });
    }
  });
};

