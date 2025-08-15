const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  category: { 
    type: String, 
    required: true 
  },
  // Reference to the Category collection for pin configuration
  categoryRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  time: { type: String, default: "Hours not specified" },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  imageUrl: { type: String },
  // Geographic coordinates
  coordinates: {
    lat: { type: Number, required: false },
    lng: { type: Number, required: false }
  },
  // Store formatted address from geocoding service
  formattedAddress: { type: String },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true, // This adds createdAt and updatedAt fields
});

// Pre-save middleware to auto-link category reference
placeSchema.pre('save', async function(next) {
  if (this.isModified('category') || (this.isNew && !this.categoryRef)) {
    try {
      const Category = mongoose.model('Category');
      const category = await Category.findByNameFuzzy(this.category);
      
      if (category) {
        this.categoryRef = category._id;
      } else {
        // Set to default 'Other' category
        const defaultCategory = await Category.getDefault();
        if (defaultCategory) {
          this.categoryRef = defaultCategory._id;
        }
      }
    } catch (error) {
      console.warn('Could not resolve category reference:', error.message);
    }
  }
  next();
});

// Virtual to get category pin configuration
placeSchema.virtual('categoryConfig', {
  ref: 'Category',
  localField: 'categoryRef',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
placeSchema.set('toJSON', { virtuals: true });
placeSchema.set('toObject', { virtuals: true });

const Place = mongoose.model("Place", placeSchema);

module.exports = Place;
