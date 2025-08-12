const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const { authenticate, isAdmin } = require("../middleware/auth");
require("dotenv").config();

// JWT Access Token time (15 minutes)
const ACCESS_TOKEN_EXPIRES = "15m";
// JWT Refresh Token time (7 days)
const REFRESH_TOKEN_EXPIRES = "7d";

// Helper function to generate tokens
const generateTokens = (payload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret",
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );

  return { accessToken, refreshToken };
};

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      name,
      email,
      password,
      role: role || "user", // Default to 'user' if role is not provided
    });
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(payload);

    res.json({
      success: true,
      accessToken: "Bearer " + accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(payload);

    res.json({
      success: true,
      accessToken: "Bearer " + accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret"
    );

    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new payload
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Generate new access token
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    res.json({
      success: true,
      accessToken: "Bearer " + accessToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

// @route   GET api/auth/current
// @desc    Return current user
// @access  Private
router.get("/current", authenticate, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
  });
});

// @route   GET api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// @route   GET api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Create JWT payload
    const payload = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        // Redirect to frontend with token
        res.redirect(
          `${
            process.env.CLIENT_URL || "http://localhost:5173"
          }/auth/success?token=Bearer ${token}`
        );
      }
    );
  }
);

// @route   GET api/auth/facebook
// @desc    Facebook OAuth login
// @access  Public
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

// @route   GET api/auth/facebook/callback
// @desc    Facebook OAuth callback
// @access  Public
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    // Create JWT payload
    const payload = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        // Redirect to frontend with token
        res.redirect(
          `${
            process.env.CLIENT_URL || "http://localhost:5173"
          }/auth/success?token=Bearer ${token}`
        );
      }
    );
  }
);

// @route   PUT api/auth/user
// @desc    Update user information
// @access  Private
router.put("/user", authenticate, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const updates = {};

    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic info if provided
    if (name) updates.name = name;
    if (email) updates.email = email;

    // If changing password, verify current password first
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT api/auth/user/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put("/user/role/:userId", authenticate, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.userId;

    // Validate role
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
