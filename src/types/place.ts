export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface Place {
  _id: string;
  name: string;
  address: string;
  category: string;
  time: string;
  likes: number;
  dislikes: number;
  imageUrl?: string;
  userLiked?: boolean;
  userDisliked?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  formattedAddress?: string;
  openingHours?: {
    [key: string]: DayHours;
  };
}

export interface PlacesResponse {
  success: boolean;
  places: Place[];
}

export interface PlaceResponse {
  success: boolean;
  place: Place;
}

export interface CreatePlaceRequest {
  name: string;
  address: string;
  category: string;
  imageUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  formattedAddress?: string;
  openingHours?: {
    [key: string]: DayHours;
  };
}

export interface UpdatePlaceRequest {
  name?: string;
  address?: string;
  category?: string;
  imageUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  formattedAddress?: string;
  openingHours?: {
    [key: string]: DayHours;
  };
}

export interface PlaceFilters {
  category?: string;
  search?: string;
}

// Place categories
export const PLACE_CATEGORIES = [
  'Coffee Shop',
  'Restaurant',
  'Bar',
  'Fast Food',
  'Dessert',
  'Bakery',
  'Other'
] as const;

export type PlaceCategory = typeof PLACE_CATEGORIES[number];
