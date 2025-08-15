const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // Pin/Marker configuration
  pinConfig: {
    // Emoji icon for the pin
    icon: {
      type: String,
      required: true,
      default: '📍'
    },
    // Hex color for the pin background
    color: {
      type: String,
      required: true,
      default: '#e74c3c',
      validate: {
        validator: function(v) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Color must be a valid hex color code'
      }
    },
    // Optional SVG icon data
    svgIcon: {
      type: String,
      default: null
    },
    // Pin size configuration
    size: {
      width: { type: Number, default: 32 },
      height: { type: Number, default: 40 }
    }
  },
  // Category metadata
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  // Parent category for hierarchical structure (optional)
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  // Search keywords for better matching
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }]
}, {
  timestamps: true
});

// Create indexes for better performance
categorySchema.index({ slug: 1 });
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Pre-save middleware to generate slug from name
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-')        // Replace spaces with hyphens
      .replace(/-+/g, '-')         // Replace multiple hyphens with single
      .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
      .trim();
  }
  next();
});

// Static method to find category by name with fuzzy matching
categorySchema.statics.findByNameFuzzy = async function(categoryName) {
  if (!categoryName) return null;
  
  const normalizedName = categoryName.toLowerCase().trim();
  
  // Try exact match first
  let category = await this.findOne({ 
    $or: [
      { name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } },
      { slug: normalizedName },
      { displayName: { $regex: new RegExp(`^${normalizedName}$`, 'i') } }
    ],
    isActive: true 
  });
  
  if (category) return category;
  
  // Try keyword matching
  category = await this.findOne({ 
    keywords: { $in: [normalizedName] },
    isActive: true 
  });
  
  if (category) return category;
  
  // Try partial matching
  category = await this.findOne({ 
    $or: [
      { name: { $regex: normalizedName, $options: 'i' } },
      { displayName: { $regex: normalizedName, $options: 'i' } },
      { keywords: { $elemMatch: { $regex: normalizedName, $options: 'i' } } }
    ],
    isActive: true 
  });
  
  return category;
};

// Static method to get default category
categorySchema.statics.getDefault = async function() {
  return await this.findOne({ slug: 'other' }) || 
         await this.findOne({ isActive: true }).sort({ sortOrder: 1 });
};

// Instance method to get pin configuration
categorySchema.methods.getPinConfig = function() {
  return {
    icon: this.pinConfig.icon,
    color: this.pinConfig.color,
    svgIcon: this.pinConfig.svgIcon,
    size: this.pinConfig.size
  };
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
