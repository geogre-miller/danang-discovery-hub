/**
 * Centralized place category management
 * This ensures consistency across markers, colors, and database values
 */

export interface CategoryConfig {
  id: string;
  label: string;
  color: string;
  icon: string;
  description?: string;
}

// Main category configurations
export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    id: 'coffee-shop',
    label: 'Coffee Shop',
    color: '#8B4513', // Brown
    icon: '☕',
    description: 'Cafes, coffee shops, and bakeries'
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    color: '#FF6347', // Tomato red
    icon: '🍽️',
    description: 'Restaurants, fast food, and dining places'
  },
  {
    id: 'bar',
    label: 'Bar',
    color: '#DAA520', // Golden rod
    icon: '🍻',
    description: 'Bars, pubs, and nightlife venues'
  },
  {
    id: 'fast-food',
    label: 'Fast Food',
    color: '#FF6347', // Same as restaurant
    icon: '🍔',
    description: 'Quick service restaurants'
  },
  {
    id: 'dessert',
    label: 'Dessert',
    color: '#FF69B4', // Hot pink
    icon: '🍰',
    description: 'Dessert shops and ice cream parlors'
  },
  {
    id: 'bakery',
    label: 'Bakery',
    color: '#8B4513', // Same as coffee shop
    icon: '🥖',
    description: 'Bakeries and pastry shops'
  },
  {
    id: 'tourist-attraction',
    label: 'Tourist Attraction',
    color: '#32CD32', // Lime green
    icon: '🏛️',
    description: 'Landmarks and tourist destinations'
  },
  {
    id: 'shopping',
    label: 'Shopping',
    color: '#FF69B4', // Hot pink
    icon: '🛍️',
    description: 'Shopping centers and retail stores'
  },
  {
    id: 'hotel',
    label: 'Hotel',
    color: '#4169E1', // Royal blue
    icon: '🏨',
    description: 'Hotels and accommodations'
  },
  {
    id: 'park',
    label: 'Park',
    color: '#228B22', // Forest green
    icon: '🌳',
    description: 'Parks and recreational areas'
  },
  {
    id: 'museum',
    label: 'Museum',
    color: '#9932CC', // Dark orchid
    icon: '🏛️',
    description: 'Museums and cultural sites'
  },
  {
    id: 'beach',
    label: 'Beach',
    color: '#00CED1', // Dark turquoise
    icon: '🏖️',
    description: 'Beaches and waterfront areas'
  },
  {
    id: 'temple',
    label: 'Temple',
    color: '#FFD700', // Gold
    icon: '⛩️',
    description: 'Temples and religious sites'
  },
  {
    id: 'other',
    label: 'Other',
    color: '#e74c3c', // Red
    icon: '📍',
    description: 'Other places and services'
  }
];

// Create lookup maps for efficient access
export const CATEGORY_BY_ID = CATEGORY_CONFIGS.reduce((acc, config) => {
  acc[config.id] = config;
  return acc;
}, {} as Record<string, CategoryConfig>);

export const CATEGORY_BY_LABEL = CATEGORY_CONFIGS.reduce((acc, config) => {
  acc[config.label.toLowerCase()] = config;
  return acc;
}, {} as Record<string, CategoryConfig>);

// Helper functions
export const getCategoryConfig = (categoryInput?: string): CategoryConfig => {
  if (!categoryInput) return CATEGORY_BY_ID['other'];
  
  const normalized = categoryInput.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = CATEGORY_BY_LABEL[normalized];
  if (exactMatch) return exactMatch;
  
  // Try fuzzy matching for common variations
  const fuzzyMatches: Record<string, string> = {
    'cafe': 'coffee shop',
    'coffee': 'coffee shop',
    'food': 'restaurant',
    'dining': 'restaurant',
    'pub': 'bar',
    'nightclub': 'bar',
    'attraction': 'tourist attraction',
    'landmark': 'tourist attraction',
    'mall': 'shopping',
    'store': 'shopping',
    'accommodation': 'hotel',
    'resort': 'hotel',
    'garden': 'park',
    'recreation': 'park',
    'gallery': 'museum',
    'culture': 'museum',
    'shore': 'beach',
    'waterfront': 'beach',
    'shrine': 'temple',
    'pagoda': 'temple',
    'church': 'temple'
  };
  
  const fuzzyMatch = fuzzyMatches[normalized];
  if (fuzzyMatch) {
    return CATEGORY_BY_LABEL[fuzzyMatch] || CATEGORY_BY_ID['other'];
  }
  
  return CATEGORY_BY_ID['other'];
};

export const getCategoryColor = (category?: string): string => {
  return getCategoryConfig(category).color;
};

export const getCategoryIcon = (category?: string): string => {
  return getCategoryConfig(category).icon;
};

export const getCategoryLabel = (category?: string): string => {
  return getCategoryConfig(category).label;
};

// For form dropdowns - matches your existing PLACE_CATEGORIES
export const PLACE_CATEGORIES = CATEGORY_CONFIGS.map(config => config.label);

// Export for backward compatibility
export { PLACE_CATEGORIES as PLACE_CATEGORY_OPTIONS };

// Validation helper
export const isValidCategory = (category: string): boolean => {
  return PLACE_CATEGORIES.includes(category);
};
