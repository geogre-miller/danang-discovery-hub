import { useMemo, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { usePlace, useLikePlace, useDislikePlace } from '@/hooks/use-places';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { getBestAddress } from '@/lib/address-utils';

// Lazy load the map component for better performance
const FastMapLibre = lazy(() => import('@/components/common/FastMapLibre'));

// Note: No need to import leaflet CSS anymore

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: place, isLoading, error } = usePlace(id!);
  const { user } = useAuth();
  const likePlace = useLikePlace();
  const dislikePlace = useDislikePlace();

  const title = useMemo(() => 
    place?.name ? `${place.name} — Details` : 'Place Details', 
    [place?.name]
  );

  const handleLike = async () => {
    if (!place) return;
    if (!user) {
      toast.error('Please log in to like places');
      return;
    }
    try {
      await likePlace.mutateAsync(place._id);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to like place';
      toast.error(message);
    }
  };

  const handleDislike = async () => {
    if (!place) return;
    if (!user) {
      toast.error('Please log in to dislike places');
      return;
    }
    try {
      await dislikePlace.mutateAsync(place._id);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to dislike place';
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-80 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
          {error.message}
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Place not found</h1>
          <p className="text-muted-foreground">The place you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Use place coordinates if available and valid, otherwise use default Da Nang coordinates
  const getValidCoordinates = () => {
    if (place?.coordinates && 
        typeof place.coordinates.lat === 'number' && 
        typeof place.coordinates.lng === 'number' &&
        !isNaN(place.coordinates.lat) && 
        !isNaN(place.coordinates.lng)) {
      return { lat: place.coordinates.lat, lng: place.coordinates.lng };
    }
    // Default Da Nang coordinates
    return { lat: 16.0471, lng: 108.2068 };
  };

  const coords = getValidCoordinates();

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={`Explore ${place.name} in Da Nang — ${place.category}.`} />
        <link rel="canonical" href={`/places/${place._id}`} />
      </Helmet>
      
      <div className="mb-6">
        <h1 className="font-display text-3xl mb-2">{place.name}</h1>
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin size={18} />
          <span>{getBestAddress(place)}</span>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="secondary">{place.category}</Badge>
          {place.time && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>{place.time}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={handleLike}
              disabled={likePlace.isPending || !user}
              className={`flex items-center gap-2 transition-all duration-200 ${
                place.userLiked 
                  ? 'bg-green-500 border-green-200 text-green-700 hover:bg-green-100' 
                  : 'hover:bg-green-200 hover:border-green-200/55'
              }`}
            >
              <motion.div
                animate={likePlace.isPending ? { 
                  y: [0, -3, 0],
                  transition: { duration: 0.5, repeat: Infinity }
                } : place.userLiked ? { 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ duration: 0.4 }}
              >
                <ThumbsUp size={18} fill={place.userLiked ? 'currentColor' : 'none'} />
              </motion.div>
              <motion.span
                animate={likePlace.isPending ? {
                  scale: [1, 1.05, 1],
                  transition: { duration: 0.3, repeat: Infinity }
                } : {}}
              >
                {place.likes}
              </motion.span>
              <span className="text-muted-foreground">Likes</span>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={handleDislike}
              disabled={dislikePlace.isPending || !user}
              className={`flex items-center gap-2 transition-all duration-200 ${
                place.userDisliked 
                  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                  : 'hover:bg-red-50/50 hover:border-red-200/50'
              }`}
            >
              <motion.div
                animate={dislikePlace.isPending ? { 
                  y: [0, 3, 0],
                  transition: { duration: 0.5, repeat: Infinity }
                } : place.userDisliked ? { 
                  rotate: [0, -15, 15, 0],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ duration: 0.4 }}
              >
                <ThumbsDown size={18} fill={place.userDisliked ? 'currentColor' : 'none'} />
              </motion.div>
              <motion.span
                animate={dislikePlace.isPending ? {
                  scale: [1, 1.05, 1],
                  transition: { duration: 0.3, repeat: Infinity }
                } : {}}
              >
                {place.dislikes}
              </motion.span>
              <span className="text-muted-foreground">Dislikes</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {place.imageUrl && (
        <div className="mb-6">
          <img 
            src={place.imageUrl} 
            alt={place.name} 
            className="w-full h-64 md:h-80 object-cover rounded-lg" 
            loading="lazy"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">About this place</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Category:</span>
                <Badge variant="secondary">{place.category}</Badge>
              </div>
              {place.time && (
                <div className="flex justify-between">
                  <span className="font-medium">Hours:</span>
                  <span>{place.time}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Community Rating:</span>
                <div className="flex gap-4">
                  <span className="text-green-600">👍 {place.likes}</span>
                  <span className="text-red-600">👎 {place.dislikes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border overflow-hidden">
          <Suspense 
            fallback={
              <div className="h-80 bg-muted rounded-xl animate-pulse flex items-center justify-center">
                <div className="text-muted-foreground">Loading map...</div>
              </div>
            }
          >
            <FastMapLibre
              center={[coords.lng, coords.lat]} // FastMapLibre expects [lng, lat]
              zoom={16}
              height="320px"
              places={[place]}
              selectedPlace={place}
              showSearch={false}
              showControls={true}
              showPlaceMarkers={true}
              interactive={true}
              className="rounded-xl"
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
