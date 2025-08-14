import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Query keys for favorites
export const favoritesKeys = {
  all: ['favorites'] as const,
  user: (userId: string) => [...favoritesKeys.all, userId] as const,
};

// Hook to get user's favorites using React Query
export const useFavorites = () => {
  const { user, token } = useAuth();
  
  return useQuery({
    queryKey: favoritesKeys.user(user?.id || ''),
    queryFn: async () => {
      if (!user || !token) return [];
      
      const response = await authService.getFavorites();
      return response.favorites || response.data || response || [];
    },
    enabled: !!user && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in newer React Query)
  });
};

// Hook to add/remove favorites
export const useFavoriteToggle = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (placeId: string) => {
      const response = await authService.addToFavorites(placeId);
      return { placeId, action: response.action };
    },
    onSuccess: ({ action }) => {
      // Invalidate favorites query to refetch
      if (user) {
        queryClient.invalidateQueries({ 
          queryKey: favoritesKeys.user(user.id) 
        });
      }
      
      // Show success message
      const message = action === 'added' ? 'Added to favorites' : 'Removed from favorites';
      toast.success(message);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update favorites';
      toast.error(message);
    },
  });
};

// Hook to check if a place is favorited
export const useIsFavorite = (placeId: string) => {
  const { data: favorites = [] } = useFavorites();
  
  // Ensure favorites is an array before using some
  if (!Array.isArray(favorites)) return false;
  
  return favorites.some((fav: any) => {
    const favPlaceId = fav?.place?._id || fav?.place || fav?._id;
    return favPlaceId === placeId;
  });
};
