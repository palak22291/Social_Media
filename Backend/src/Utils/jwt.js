// Backend/src/Utils/jwt.js

const jwt = require("jsonwebtoken");

// ✅ Generate JWT Token
exports.generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// ✅ Verify JWT Token (optional utility - can be reused elsewhere)
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null; // return null if token is invalid or expired
  }
};
