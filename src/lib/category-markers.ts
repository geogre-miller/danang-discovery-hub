import { MapPin, Coffee, ShoppingBag, Utensils, Car, Hotel, Zap, Building } from 'lucide-react';

// Category-based marker colors and icons
export const CATEGORY_CONFIGS = {
  'Restaurant': {
    color: '#ef4444', // red
    icon: Utensils
  },
  'Cafe': {
    color: '#8b5cf6', // purple
    icon: Coffee
  },
  'Shop': {
    color: '#3b82f6', // blue
    icon: ShoppingBag
  },
  'Hotel': {
    color: '#10b981', // green
    icon: Hotel
  },
  'Parking': {
    color: '#6b7280', // gray
    icon: Car
  },
  'EV Station': {
    color: '#f59e0b', // yellow/orange
    icon: Zap
  },
  'Building': {
    color: '#84cc16', // lime
    icon: Building
  }
} as const;

export type PlaceCategory = keyof typeof CATEGORY_CONFIGS;

export function getCategoryColor(category: string): string {
  return CATEGORY_CONFIGS[category as PlaceCategory]?.color || '#6b7280';
}

export function getCategoryIcon(category: string) {
  return CATEGORY_CONFIGS[category as PlaceCategory]?.icon || MapPin;
}
