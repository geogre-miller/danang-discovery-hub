// backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const passport = require("passport");

// Authentication middleware using passport JWT
exports.authenticate = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized access - No token provided" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Admin role middleware
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access denied - Admin permission required" });
};

// Refresh token middleware
exports.verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret"
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};
