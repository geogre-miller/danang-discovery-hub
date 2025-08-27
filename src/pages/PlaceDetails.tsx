import { useMemo, Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { usePlace, useLikePlace, useDislikePlace } from '@/hooks/use-places';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { getBestAddress } from '@/lib/address-utils';
import { getWeeklySchedule, isPlaceOpen, getTodayHours, getDaysPattern } from '@/lib/hours-utils';
import { AnimatedActionButton } from '@/components/ui/AnimatedActionButton';

// Lazy load the map component for better performance
const FastMapLibre = lazy(() => import('@/components/common/FastMapLibre'));

// Note: No need to import leaflet CSS anymore

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: place, isLoading, error } = usePlace(id!);
  const { user } = useAuth();
  const likePlace = useLikePlace();
  const dislikePlace = useDislikePlace();

  // All hooks must be called before any early returns
  const title = useMemo(() => 
    place?.name ? `${place.name} — Details` : 'Place Details', 
    [place?.name]
  );

  // Use place coordinates if available and valid, otherwise use default Da Nang coordinates
  const coords = useMemo(() => {
    if (place?.coordinates && 
        typeof place.coordinates.lat === 'number' && 
        typeof place.coordinates.lng === 'number' &&
        !isNaN(place.coordinates.lat) && 
        !isNaN(place.coordinates.lng)) {
      return { lat: place.coordinates.lat, lng: place.coordinates.lng };
    }
    // Default Da Nang coordinates
    return { lat: 16.0471, lng: 108.2068 };
  }, [place?.coordinates?.lat, place?.coordinates?.lng]);

  // Create stable place object for map (excluding mutable data like likes/dislikes)
  const stablePlace = useMemo(() => {
    if (!place) return null;
    return {
      _id: place._id,
      name: place.name,
      address: place.address,
      category: place.category,
      coordinates: place.coordinates,
      imageUrl: place.imageUrl,
      time: place.time,
      openingHours: place.openingHours,
      // Exclude likes, dislikes, userLiked, userDisliked to prevent map re-renders
      likes: 0,
      dislikes: 0,
      userLiked: false,
      userDisliked: false
    };
  }, [place?._id, place?.name, place?.address, place?.category, place?.coordinates, place?.imageUrl, place?.time, place?.openingHours]);

  const weeklySchedule = useMemo(() => 
    place ? getWeeklySchedule(place.openingHours) : [], 
    [place?.openingHours]
  );

  const isOpen = useMemo(() => 
    place ? isPlaceOpen(place.openingHours) : false, 
    [place?.openingHours]
  );

  const todayHours = useMemo(() => 
    place ? getTodayHours(place.openingHours) : null, 
    [place?.openingHours]
  );

  const daysPattern = useMemo(() => 
    place ? getDaysPattern(place.openingHours) : null, 
    [place?.openingHours]
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
          {(place.openingHours || place.time) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={16} />
              <div className="flex flex-col">
                <span>{place.openingHours ? todayHours?.split(' • ')[0] : place.time}</span>
                {place.openingHours && daysPattern && (
                  <span className="text-xs">{daysPattern}</span>
                )}
              </div>
              {place.openingHours && (
                <Circle 
                  size={8} 
                  className={`${isOpen ? 'text-green-500 fill-current' : 'text-red-500 fill-current'}`}
                />
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatedActionButton
            variant="like"
            isActive={place.userLiked}
            count={place.likes}
            isPending={likePlace.isPending}
            disabled={!user}
            onClick={handleLike}
            aria-label={`Like ${place.name}`}
            aria-pressed={place.userLiked}
          />
          
          <AnimatedActionButton
            variant="dislike"
            isActive={place.userDisliked}
            count={place.dislikes}
            isPending={dislikePlace.isPending}
            disabled={!user}
            onClick={handleDislike}
            aria-label={`Dislike ${place.name}`}
            aria-pressed={place.userDisliked}
          />
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
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Category:</span>
                <Badge variant="secondary">{place.category}</Badge>
              </div>
              
              {place.openingHours ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Opening Hours:</span>
                    {isOpen !== null && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isOpen 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    {weeklySchedule.map(({ day, hours, isToday }) => (
                      <div 
                        key={day} 
                        className={`flex justify-between py-1 px-2 rounded ${
                          isToday ? 'bg-primary/10 font-medium' : ''
                        }`}
                      >
                        <span>{day}:</span>
                        <span className={hours === 'Closed' ? 'text-muted-foreground' : ''}>
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : place.time ? (
                <div className="flex justify-between">
                  <span className="font-medium">Hours:</span>
                  <span>{place.time}</span>
                  <span></span>
                </div>
              ) : null}
              
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
              places={stablePlace ? [stablePlace] : []}
              selectedPlace={stablePlace}
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
