import api from '@/lib/api';
import type { 
  Place, 
  PlacesResponse, 
  PlaceResponse, 
  CreatePlaceRequest, 
  UpdatePlaceRequest,
  PlaceFilters 
} from '@/types/place';

export const placesService = {
  // Get all places
  async getAllPlaces(filters?: PlaceFilters): Promise<Place[]> {
    const params = new URLSearchParams();
    
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    
    const response = await api.get(`/places?${params.toString()}`);
    return response.data.places;
  },

  // Get place by ID
  async getPlaceById(id: string): Promise<Place> {
    const response = await api.get(`/places/${id}`);
    return response.data.place;
  },

  // Create new place
  async createPlace(placeData: CreatePlaceRequest): Promise<Place> {
    const response = await api.post('/places', placeData);
    return response.data.place;
  },

  // Update place
  async updatePlace(id: string, placeData: UpdatePlaceRequest): Promise<Place> {
    const response = await api.put(`/places/${id}`, placeData);
    return response.data.place;
  },

  // Delete place
  async deletePlace(id: string): Promise<void> {
    await api.delete(`/places/${id}`);
  },

  // Like place
  async likePlace(id: string): Promise<Place> {
    const response = await api.post(`/places/${id}/like`);
    return response.data.place;
  },

  // Dislike place
  async dislikePlace(id: string): Promise<Place> {
    const response = await api.post(`/places/${id}/dislike`);
    return response.data.place;
  }
};
