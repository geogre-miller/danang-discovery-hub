import type { PlaceFormData, FormErrors } from '@/types/place-form';

// Time validation utilities
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const isTimeAfter = (laterTime: string, earlierTime: string): boolean => {
  const [laterHour, laterMin] = laterTime.split(':').map(Number);
  const [earlierHour, earlierMin] = earlierTime.split(':').map(Number);
  
  const laterMinutes = laterHour * 60 + laterMin;
  const earlierMinutes = earlierHour * 60 + earlierMin;
  
  return laterMinutes > earlierMinutes;
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return true; // Optional field
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

// Coordinates validation
export const isValidLatitude = (lat: number): boolean => {
  return lat >= -90 && lat <= 90;
};

export const isValidLongitude = (lng: number): boolean => {
  return lng >= -180 && lng <= 180;
};

// Main validation function
export const validatePlaceForm = (data: PlaceFormData): FormErrors => {
  const errors: FormErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Place name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Place name must be at least 2 characters';
  }

  // Address/Coordinates validation
  const hasAddress = data.address.trim();
  const hasCoordinates = data.coordinates && 
    typeof data.coordinates.lat === 'number' && 
    typeof data.coordinates.lng === 'number' &&
    !isNaN(data.coordinates.lat) && 
    !isNaN(data.coordinates.lng);

  if (!hasAddress && !hasCoordinates) {
    errors.address = 'Either address or coordinates are required';
    errors.coordinates = 'Either address or coordinates are required';
  }

  // Coordinates validation if provided
  if (hasCoordinates) {
    if (!isValidLatitude(data.coordinates!.lat)) {
      errors.coordinates = 'Latitude must be between -90 and 90';
    } else if (!isValidLongitude(data.coordinates!.lng)) {
      errors.coordinates = 'Longitude must be between -180 and 180';
    }
  }

  // Category validation
  if (!data.category.trim()) {
    errors.category = 'Category is required';
  }

  // Image URL validation
  if (data.imageUrl && !isValidUrl(data.imageUrl)) {
    errors.imageUrl = 'Please enter a valid URL (starting with http:// or https://)';
  }

  // Opening hours validation
  if (data.openingHours) {
    const hoursErrors: { [key: string]: string } = {};
    
    Object.entries(data.openingHours).forEach(([day, hours]) => {
      if (!hours.closed) {
        if (!isValidTimeFormat(hours.open)) {
          hoursErrors[`${day}_open`] = 'Invalid time format (use HH:MM)';
        }
        if (!isValidTimeFormat(hours.close)) {
          hoursErrors[`${day}_close`] = 'Invalid time format (use HH:MM)';
        }
        if (
          isValidTimeFormat(hours.open) && 
          isValidTimeFormat(hours.close) && 
          !isTimeAfter(hours.close, hours.open)
        ) {
          hoursErrors[`${day}_time`] = 'Closing time must be after opening time';
        }
      }
    });

    if (Object.keys(hoursErrors).length > 0) {
      errors.openingHours = hoursErrors;
    }
  }

  return errors;
};

// Helper to check if form has errors
export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(error => {
    if (typeof error === 'string') return true;
    if (typeof error === 'object' && error !== null) {
      return Object.keys(error).length > 0;
    }
    return false;
  });
};
