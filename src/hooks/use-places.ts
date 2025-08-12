import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { placesService } from '@/services/places.service';
import type { Place, CreatePlaceRequest, UpdatePlaceRequest, PlaceFilters } from '@/types/place';
import { toast } from 'sonner';

// Query keys
export const placeKeys = {
  all: ['places'] as const,
  lists: () => [...placeKeys.all, 'list'] as const,
  list: (filters?: PlaceFilters) => [...placeKeys.lists(), { filters }] as const,
  details: () => [...placeKeys.all, 'detail'] as const,
  detail: (id: string) => [...placeKeys.details(), id] as const,
};

// Hooks
export const usePlaces = (filters?: PlaceFilters) => {
  return useQuery({
    queryKey: placeKeys.list(filters),
    queryFn: () => placesService.getAllPlaces(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePlace = (id: string) => {
  return useQuery({
    queryKey: placeKeys.detail(id),
    queryFn: () => placesService.getPlaceById(id),
    enabled: !!id,
  });
};

export const useCreatePlace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePlaceRequest) => placesService.createPlace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
      toast.success('Place created successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create place');
    },
  });
};

export const useUpdatePlace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlaceRequest }) => 
      placesService.updatePlace(id, data),
    onSuccess: (updatedPlace) => {
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: placeKeys.detail(updatedPlace._id) });
      toast.success('Place updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update place');
    },
  });
};

export const useDeletePlace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => placesService.deletePlace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
      toast.success('Place deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete place');
    },
  });
};

export const useLikePlace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => placesService.likePlace(id),
    onSuccess: (updatedPlace) => {
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: placeKeys.detail(updatedPlace._id) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to like place');
    },
  });
};

export const useDislikePlace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => placesService.dislikePlace(id),
    onSuccess: (updatedPlace) => {
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: placeKeys.detail(updatedPlace._id) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to dislike place');
    },
  });
};
