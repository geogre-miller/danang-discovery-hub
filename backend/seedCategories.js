const mongoose = require('mongoose');
const Category = require('./models/Category');

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use the same connection string as the main server
    let MONGO_URI = process.env.MONGO_URI || 
      "mongodb+srv://quanghuy00433:CkU3od4LgelNnkL6@cafeteria.5hmqgxy.mongodb.net/?retryWrites=true&w=majority&appName=Cafeteria";
    
    // Clean up the URI by removing potential spaces or line breaks
    MONGO_URI = MONGO_URI.replace(/\s+/g, "").trim();
    
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding categories');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Initial categories data
const initialCategories = [
  {
    name: 'Coffee Shop',
    slug: 'coffee-shop',
    displayName: 'Coffee Shop',
    description: 'Cafes, coffee shops, and specialty coffee places',
    pinConfig: {
      icon: '☕',
      color: '#8B4513', // Saddle brown
      size: { width: 32, height: 40 }
    },
    keywords: ['cafe', 'coffee', 'espresso', 'latte', 'cappuccino'],
    sortOrder: 1
  },
  {
    name: 'Restaurant',
    slug: 'restaurant',
    displayName: 'Restaurant',
    description: 'Full-service restaurants and dining establishments',
    pinConfig: {
      icon: '🍽️',
      color: '#FF6347', // Tomato red
      size: { width: 32, height: 40 }
    },
    keywords: ['dining', 'food', 'meal', 'cuisine'],
    sortOrder: 2
  },
  {
    name: 'Fast Food',
    slug: 'fast-food',
    displayName: 'Fast Food',
    description: 'Quick service restaurants and takeaway places',
    pinConfig: {
      icon: '🍔',
      color: '#FFA500', // Orange
      size: { width: 32, height: 40 }
    },
    keywords: ['takeaway', 'quick', 'burger', 'pizza'],
    sortOrder: 3
  },
  {
    name: 'Bar',
    slug: 'bar',
    displayName: 'Bar',
    description: 'Bars, pubs, and nightlife venues',
    pinConfig: {
      icon: '🍻',
      color: '#DAA520', // Goldenrod
      size: { width: 32, height: 40 }
    },
    keywords: ['pub', 'nightlife', 'drinks', 'alcohol', 'beer'],
    sortOrder: 4
  },
  {
    name: 'Dessert',
    slug: 'dessert',
    displayName: 'Dessert',
    description: 'Dessert shops, ice cream parlors, and sweet treats',
    pinConfig: {
      icon: '🍰',
      color: '#FF69B4', // Hot pink
      size: { width: 32, height: 40 }
    },
    keywords: ['ice cream', 'cake', 'sweets', 'bakery'],
    sortOrder: 5
  },
  {
    name: 'Tourist Attraction',
    slug: 'tourist-attraction',
    displayName: 'Tourist Attraction',
    description: 'Landmarks, monuments, and tourist destinations',
    pinConfig: {
      icon: '🗺️',
      color: '#32CD32', // Lime green
      size: { width: 32, height: 40 }
    },
    keywords: ['landmark', 'monument', 'attraction', 'sightseeing'],
    sortOrder: 6
  },
  {
    name: 'Shopping',
    slug: 'shopping',
    displayName: 'Shopping',
    description: 'Shopping centers, malls, and retail stores',
    pinConfig: {
      icon: '🛍️',
      color: '#9932CC', // Dark orchid
      size: { width: 32, height: 40 }
    },
    keywords: ['mall', 'store', 'retail', 'market'],
    sortOrder: 7
  },
  {
    name: 'Hotel',
    slug: 'hotel',
    displayName: 'Hotel',
    description: 'Hotels, resorts, and accommodations',
    pinConfig: {
      icon: '🏨',
      color: '#4169E1', // Royal blue
      size: { width: 32, height: 40 }
    },
    keywords: ['accommodation', 'resort', 'lodge', 'hostel'],
    sortOrder: 8
  },
  {
    name: 'Park',
    slug: 'park',
    displayName: 'Park',
    description: 'Parks, gardens, and recreational areas',
    pinConfig: {
      icon: '🌳',
      color: '#228B22', // Forest green
      size: { width: 32, height: 40 }
    },
    keywords: ['garden', 'recreation', 'nature', 'outdoor'],
    sortOrder: 9
  },
  {
    name: 'Museum',
    slug: 'museum',
    displayName: 'Museum',
    description: 'Museums, galleries, and cultural sites',
    pinConfig: {
      icon: '🏛️',
      color: '#800080', // Purple
      size: { width: 32, height: 40 }
    },
    keywords: ['gallery', 'culture', 'art', 'history'],
    sortOrder: 10
  },
  {
    name: 'Beach',
    slug: 'beach',
    displayName: 'Beach',
    description: 'Beaches, waterfront, and coastal areas',
    pinConfig: {
      icon: '🏖️',
      color: '#00CED1', // Dark turquoise
      size: { width: 32, height: 40 }
    },
    keywords: ['coast', 'shore', 'waterfront', 'sea'],
    sortOrder: 11
  },
  {
    name: 'Temple',
    slug: 'temple',
    displayName: 'Temple',
    description: 'Temples, churches, and religious sites',
    pinConfig: {
      icon: '⛩️',
      color: '#FFD700', // Gold
      size: { width: 32, height: 40 }
    },
    keywords: ['church', 'shrine', 'pagoda', 'religious', 'worship'],
    sortOrder: 12
  },
  {
    name: 'Other',
    slug: 'other',
    displayName: 'Other',
    description: 'Other places and services',
    pinConfig: {
      icon: '📍',
      color: '#e74c3c', // Red
      size: { width: 32, height: 40 }
    },
    keywords: ['general', 'service', 'miscellaneous'],
    sortOrder: 999
  }
];

const seedCategories = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Seeding categories...');
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    // Insert new categories
    const categories = await Category.insertMany(initialCategories);
    console.log(`✅ Successfully seeded ${categories.length} categories:`);
    
    categories.forEach(cat => {
      console.log(`  - ${cat.displayName} (${cat.pinConfig.icon} ${cat.pinConfig.color})`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function
if (require.main === module) {
  seedCategories();
}

module.exports = { seedCategories, initialCategories };
