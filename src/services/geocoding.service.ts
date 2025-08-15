// Geocoding service using OpenStreetMap Nominatim API (free)
export interface GeocodingResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
  importance: number;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AddressSuggestion {
  id: string;
  display_name: string;
  coordinates: Coordinates;
}

class GeocodingService {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';
  
  // Debounced search function
  private debounceTimer: number | null = null;

  async searchAddresses(query: string): Promise<AddressSuggestion[]> {
    if (!query || query.length < 3) {
      return [];
    }

    try {
      // Add Vietnam and Da Nang context for better results
      const searchQuery = `${query}, Da Nang, Vietnam`;
      const url = `${this.baseUrl}/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&accept-language=en`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DaNangDiscoveryHub/1.0 (your-email@example.com)' // Required by Nominatim
        }
      });

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const results: GeocodingResult[] = await response.json();
      
      return results.map((result, index) => ({
        id: `${result.place_id || index}`,
        display_name: result.display_name,
        coordinates: {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        }
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  // Debounced search to avoid too many API calls
  searchAddressesDebounced(query: string, callback: (results: AddressSuggestion[]) => void, delay = 500): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      const results = await this.searchAddresses(query);
      callback(results);
    }, delay);
  }

  // Reverse geocoding - get address from coordinates
  async getAddressFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      const url = `${this.baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DaNangDiscoveryHub/1.0 (your-email@example.com)'
        }
      });

      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const result = await response.json();
      return result.display_name || `${lat}, ${lng}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat}, ${lng}`;
    }
  }

  // Default coordinates for Da Nang city center
  getDefaultCoordinates(): Coordinates {
    return {
      lat: 16.0544,
      lng: 108.2022
    };
  }
}

export const geocodingService = new GeocodingService();
