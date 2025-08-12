import { motion } from 'framer-motion';
import { Heart, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLikePlace, useDislikePlace } from '@/hooks/use-places';
import type { Place } from '@/types/place';

export default function PlaceCard({ 
  place, 
  onFavoriteToggle, 
  isFavorite 
}: { 
  place: Place; 
  onFavoriteToggle?: (id: string) => void; 
  isFavorite?: boolean; 
}) {
  const likePlace = useLikePlace();
  const dislikePlace = useDislikePlace();
  
  const img = place.imageUrl || '/placeholder.svg';
  
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await likePlace.mutateAsync(place._id);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dislikePlace.mutateAsync(place._id);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border bg-card shadow-sm hover:shadow-lg hover-scale overflow-hidden"
    >
      <Link to={`/places/${place._id}`} className="block">
        <img src={img} alt={`${place.name} cover`} loading="lazy" className="w-full h-44 object-cover" />
      </Link>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold leading-tight">{place.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin size={16} /> {place.address}
            </p>
          </div>
          <button
            onClick={() => onFavoriteToggle?.(place._id)}
            className={`p-2 rounded-full ${isFavorite ? 'bg-primary/15 text-primary' : 'bg-secondary text-foreground/70'}`}
            aria-label="Toggle favorite"
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            {place.category}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={likePlace.isPending}
              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 disabled:opacity-50"
            >
              <ThumbsUp size={16} />
              <span>{place.likes}</span>
            </button>
            <button
              onClick={handleDislike}
              disabled={dislikePlace.isPending}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <ThumbsDown size={16} />
              <span>{place.dislikes}</span>
            </button>
          </div>
        </div>
        
        {place.time && (
          <div className="text-xs text-muted-foreground">
            Hours: {place.time}
          </div>
        )}
      </div>
    </motion.article>
  );
}
