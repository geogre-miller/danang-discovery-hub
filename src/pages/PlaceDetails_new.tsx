import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePlace, useLikePlace, useDislikePlace } from '@/hooks/use-places';
import MapView from '@/components/common/MapView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, ThumbsUp, ThumbsDown } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

export default function PlaceDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: place, isLoading, error } = usePlace(id!);
  const likePlace = useLikePlace();
  const dislikePlace = useDislikePlace();

  const title = useMemo(() => 
    place?.name ? `${place.name} — Details` : 'Place Details', 
    [place?.name]
  );

  const handleLike = async () => {
    if (!place) return;
    try {
      await likePlace.mutateAsync(place._id);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleDislike = async () => {
    if (!place) return;
    try {
      await dislikePlace.mutateAsync(place._id);
    } catch (error) {
      // Error is handled in the mutation
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

  // Default coordinates for Da Nang if not available
  const coords = { lat: 16.0471, lng: 108.2068 };

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
          <span>{place.address}</span>
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
          <Button
            variant="outline"
            onClick={handleLike}
            disabled={likePlace.isPending}
            className="flex items-center gap-2"
          >
            <ThumbsUp size={18} />
            <span>{place.likes}</span>
            <span className="text-muted-foreground">Likes</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDislike}
            disabled={dislikePlace.isPending}
            className="flex items-center gap-2"
          >
            <ThumbsDown size={18} />
            <span>{place.dislikes}</span>
            <span className="text-muted-foreground">Dislikes</span>
          </Button>
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
        
        <div className="rounded-xl border overflow-hidden h-80">
          <MapView center={[coords.lat, coords.lng]} label={place.name} className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}
