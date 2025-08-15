import axios from 'axios';

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1';

export interface GeoapifyPlace {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    formatted: string;
    place_id: string;
    lat: number;
    lon: number;
  };
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface GeoapifyAutocompleteResponse {
  type: string;
  features: GeoapifyPlace[];
}

export interface PlaceAutocompleteResult {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
}

class GeoapifyService {
  private apiKey: string;

  constructor() {
    this.apiKey = GEOAPIFY_API_KEY;
    if (!this.apiKey) {
      console.warn('Geoapify API key not found.');
    }
  }

  async autocomplete(text: string, options: {
    limit?: number;
    bias?: string; // bias towards a specific location like "countrycode:vn"
    filter?: string; // filter by country, etc.
  } = {}): Promise<PlaceAutocompleteResult[]> {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is required');
    }

    if (!text || text.length < 2) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        text: text,
        apiKey: this.apiKey,
        limit: (options.limit || 10).toString(),
        format: 'geojson',
        ...(options.bias && { bias: options.bias }),
        ...(options.filter && { filter: options.filter })
      });

      const response = await axios.get<GeoapifyAutocompleteResponse>(
        `${GEOAPIFY_BASE_URL}/geocode/autocomplete?${params}`
      );

      return response.data.features.map(this.convertToAutocompleteResult);
    } catch (error) {
      console.error('Geoapify autocomplete error:', error);
      throw new Error('Failed to fetch place suggestions');
    }
  }

  async geocode(address: string): Promise<PlaceAutocompleteResult | null> {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is required');
    }

    try {
      const params = new URLSearchParams({
        text: address,
        apiKey: this.apiKey,
        limit: '1',
        format: 'geojson'
      });

      const response = await axios.get<GeoapifyAutocompleteResponse>(
        `${GEOAPIFY_BASE_URL}/geocode/search?${params}`
      );

      if (response.data.features.length > 0) {
        return this.convertToAutocompleteResult(response.data.features[0]);
      }

      return null;
    } catch (error) {
      console.error('Geoapify geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<PlaceAutocompleteResult | null> {
    if (!this.apiKey) {
      throw new Error('Geoapify API key is required');
    }

    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        apiKey: this.apiKey,
        format: 'geojson'
      });

      const response = await axios.get<GeoapifyAutocompleteResponse>(
        `${GEOAPIFY_BASE_URL}/geocode/reverse?${params}`
      );

      if (response.data.features.length > 0) {
        return this.convertToAutocompleteResult(response.data.features[0]);
      }

      return null;
    } catch (error) {
      console.error('Geoapify reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  private convertToAutocompleteResult(place: GeoapifyPlace): PlaceAutocompleteResult {
    const { properties, geometry } = place;
    
    // Extract coordinates (Geoapify uses [lng, lat] format)
    const [lng, lat] = geometry.coordinates;
    
    // Build a readable name from available properties
    let name = properties.name || '';
    if (!name && properties.street) {
      name = properties.street;
      if (properties.housenumber) {
        name = `${properties.housenumber} ${name}`;
      }
    }
    if (!name) {
      name = properties.suburb || properties.city || 'Unknown Place';
    }

    // Format address without postal code and country
    const formatCleanAddress = (formatted: string): string => {
      // Remove postal codes (5 digits) and country name (Vietnam)
      let cleanAddress = formatted
        .replace(/,?\s*\d{5}\s*,?/g, '') // Remove postal codes like "50207"
        .replace(/,?\s*Vietnam\s*$/i, '') // Remove "Vietnam" at the end
        .replace(/,?\s*Viet Nam\s*$/i, '') // Remove "Viet Nam" at the end
        .replace(/,\s*,/g, ',') // Remove double commas
        .replace(/,\s*$/g, '') // Remove trailing comma
        .replace(/^\s*,/g, '') // Remove leading comma
        .trim();
      
      return cleanAddress;
    };

    const cleanAddress = formatCleanAddress(properties.formatted);

    return {
      id: properties.place_id,
      name: name,
      address: cleanAddress,
      coordinates: {
        lat: lat,
        lng: lng
      },
      formattedAddress: cleanAddress
    };
  }

  // Helper method to get current location
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Failed to get current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }
}

export const geoapifyService = new GeoapifyService();
export default geoapifyService;
