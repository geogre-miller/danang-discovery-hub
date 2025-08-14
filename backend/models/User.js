const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.facebookId; // Password only required if not using OAuth
    },
  },
  googleId: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  instagramId: {
    type: String,
  },
  avatar: {
    type: String,
  },
  favorites: [
    {
      place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
      addedAt: { type: Date, default: Date.now },
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);
