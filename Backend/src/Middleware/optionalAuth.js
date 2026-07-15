const { verifyToken } = require("../Utils/jwt");

// Like the auth middleware, but never rejects the request.
// If a valid token is present → req.user is set (so controllers can add
// user-specific data like "did I like this post"). If the token is missing
// or invalid → req.user stays undefined and the request continues as public.
module.exports = function (req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (token) {
    const decoded = verifyToken(token); // returns { userId, email } or null
    if (decoded) req.user = decoded;
  }

  next();
};
