const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, required: true },
  time: { type: String, default: "Hours not specified" },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  imageUrl: { type: String },
}, {
  timestamps: true, // This adds createdAt and updatedAt fields
});

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
