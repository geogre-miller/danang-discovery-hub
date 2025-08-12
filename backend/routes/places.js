const express = require("express");
const Place = require("../models/Place");
const { p } = require("framer-motion/client");

const router = express.Router();
// @route   GET api/places
// @desc    Get all places
// @access  Public
router.get("/", async (req, res) => {
  try {
    const places = await Place.find();
    res.json({
      success: true,
      places,
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
// @access  Public
router.post("/:id/like", async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
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
      message: "Server error when liking place",
    });
  }
});

// @route   POST api/places/:id/dislike
// @desc    Dislike a place
// @access  Public
router.post("/:id/dislike", async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { $inc: { dislikes: 1 } },
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
      message: "Server error when disliking place",
    });
  }
});

module.exports = router;
