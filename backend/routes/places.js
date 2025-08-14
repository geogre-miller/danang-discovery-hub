const express = require("express");
const Place = require("../models/Place");
const { authenticate } = require("../middleware/auth");
const { p } = require("framer-motion/client");

const router = express.Router();

// Optional auth middleware - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token || !token.startsWith('Bearer ')) {
    return next();
  }

  try {
    const jwt = require('jsonwebtoken');
    const actualToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.user = decoded.user;
  } catch (error) {
    // Continue without user if token is invalid
  }
  
  next();
};

// @route   GET api/places
// @desc    Get all places with user interaction status
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const places = await Place.find();
    
    // If user is authenticated, include their interaction status
    const placesWithUserStatus = places.map(place => {
      const placeObj = place.toObject();
      
      if (req.user) {
        placeObj.userLiked = place.likedBy.includes(req.user.id);
        placeObj.userDisliked = place.dislikedBy.includes(req.user.id);
      } else {
        placeObj.userLiked = false;
        placeObj.userDisliked = false;
      }
      
      // Don't expose the likedBy and dislikedBy arrays to frontend
      delete placeObj.likedBy;
      delete placeObj.dislikedBy;
      
      return placeObj;
    });
    
    res.json({
      success: true,
      places: placesWithUserStatus,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error when fetching places",
    });
  }
});

// @route   POST api/places
// @desc    Create a new place
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { name, address, category, imageUrl } = req.body;

    // Create new place instance
    const newPlace = new Place({
      name,
      address,
      category,
      imageUrl,
    });

    // Save to database
    const savedPlace = await newPlace.save();

    res.status(201).json({
      success: true,
      place: savedPlace,
    });
  } catch (error) {
    console.error(error.message);
    res.status(400).json({
      success: false,
      message: "Error creating new place",
    });
  }
});

// @route   GET api/places/:id
// @desc    Get place by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    res.json({
      success: true,
      place,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error when fetching place",
    });
  }
});

// @route   PUT api/places/:id
// @desc    Update place by ID
// @access  Public
router.put("/:id", async (req, res) => {
  try {
    const { name, address, category, imageUrl } = req.body;
    const updateFields = {};

    // Only add fields that are provided
    if (name) updateFields.name = name;
    if (address) updateFields.address = address;
    if (category) updateFields.category = category;
    if (imageUrl) updateFields.imageUrl = imageUrl;

    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    res.json({
      success: true,
      place,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error when updating place",
    });
  }
});

// @route   DELETE api/places/:id
// @desc    Delete place by ID
// @access  Public
router.delete("/:id", async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    res.json({
      success: true,
      message: "Place successfully deleted",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error when deleting place",
    });
  }
});

// @route   POST api/places/:id/like
// @desc    Like a place
// @access  Private
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const placeId = req.params.id;

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    // Check if user already liked this place
    const alreadyLiked = place.likedBy.includes(userId);
    const alreadyDisliked = place.dislikedBy.includes(userId);

    if (alreadyLiked) {
      // User already liked, so unlike it
      place.likedBy = place.likedBy.filter(id => !id.equals(userId));
      place.likes = Math.max(0, place.likes - 1);
    } else {
      // If user had disliked, remove dislike first
      if (alreadyDisliked) {
        place.dislikedBy = place.dislikedBy.filter(id => !id.equals(userId));
        place.dislikes = Math.max(0, place.dislikes - 1);
      }
      
      // Add like
      place.likedBy.push(userId);
      place.likes += 1;
    }

    await place.save();

    res.json({
      success: true,
      place,
      userLiked: !alreadyLiked,
      userDisliked: false,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error when liking place",
    });
  }
});

// @route   POST api/places/:id/dislike
// @desc    Dislike a place
// @access  Private
router.post("/:id/dislike", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const placeId = req.params.id;

    const place = await Place.findById(placeId);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    // Check if user already disliked this place
    const alreadyDisliked = place.dislikedBy.includes(userId);
    const alreadyLiked = place.likedBy.includes(userId);

    if (alreadyDisliked) {
      // User already disliked, so remove dislike
      place.dislikedBy = place.dislikedBy.filter(id => !id.equals(userId));
      place.dislikes = Math.max(0, place.dislikes - 1);
    } else {
      // If user had liked, remove like first
      if (alreadyLiked) {
        place.likedBy = place.likedBy.filter(id => !id.equals(userId));
        place.likes = Math.max(0, place.likes - 1);
      }
      
      // Add dislike
      place.dislikedBy.push(userId);
      place.dislikes += 1;
    }

    await place.save();

    res.json({
      success: true,
      place,
      userLiked: false,
      userDisliked: !alreadyDisliked,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server error when disliking place",
    });
  }
});

module.exports = router;
