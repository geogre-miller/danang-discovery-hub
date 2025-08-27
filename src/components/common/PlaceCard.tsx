import { motion } from 'framer-motion';
import { Heart, MapPin, Clock, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLikePlace, useDislikePlace } from '@/hooks/use-places';
import { useAuth } from '@/context/AuthContext';
import { useIsFavorite, useFavoriteToggle } from '@/hooks/use-favorites';
import { toast } from 'sonner';
import { getBestAddress } from '@/lib/address-utils';
import { getCompactHours, isPlaceOpen } from '@/lib/hours-utils';
import { AnimatedActionButton } from '@/components/ui/AnimatedActionButton';
import type { Place } from '@/types/place';

export default function PlaceCard({ place }: { place: Place }) {
  const { user } = useAuth();
  const isFavorite = useIsFavorite(place._id);
  const favoriteToggle = useFavoriteToggle();
  const likePlace = useLikePlace();
  const dislikePlace = useDislikePlace();
  
  const img = place.imageUrl || '/placeholder.svg';
  const isOpen = isPlaceOpen(place.openingHours);
  const hoursDisplay = place.openingHours ? getCompactHours(place.openingHours) : place.time;
  
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  // Handlers for AnimatedActionButton (no event parameter)
  const handleLikeClick = async () => {
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

  const handleDislikeClick = async () => {
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

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please log in to add favorites');
      return;
    }

    favoriteToggle.mutate(place._id);
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
              <MapPin size={16} /> {getBestAddress(place)}
            </p>
          </div>
          <motion.button
            onClick={handleFavoriteToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={isFavorite ? {
              scale: [1, 1.3, 1],
            } : {}}
            transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
            className={`p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-primary/15 text-primary shadow-md' 
                : 'bg-secondary text-foreground/70 hover:bg-primary/10 hover:text-primary/80'
            }`}
            aria-label="Toggle favorite"
          >
            <motion.div
              animate={isFavorite ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ duration: 0.4 }}
            >
              <Heart 
                size={18} 
                fill={isFavorite ? 'currentColor' : 'none'}
                className="transition-all duration-200"
              />
            </motion.div>
          </motion.button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            {place.category}
          </div>
          
          <div className="flex items-center gap-3">
            <AnimatedActionButton
              variant="like"
              isActive={place.userLiked}
              count={place.likes}
              isPending={likePlace.isPending}
              disabled={!user}
              onClick={handleLikeClick}
              className="text-xs"
              showLabel={false}
              aria-label={`Like ${place.name}`}
              aria-pressed={place.userLiked}
            />

            <AnimatedActionButton
              variant="dislike"
              isActive={place.userDisliked}
              count={place.dislikes}
              isPending={dislikePlace.isPending}
              disabled={!user}
              onClick={handleDislikeClick}
              className="text-xs"
              showLabel={false}
              aria-label={`Dislike ${place.name}`}
              aria-pressed={place.userDisliked}
            />
          </div>
        </div>
        
        {hoursDisplay && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{place.openingHours ? getCompactHours(place.openingHours).split(' • ')[0] : place.time}</span>
              {place.openingHours && (
                <Circle 
                  size={8} 
                  className={`ml-1 ${isOpen ? 'text-green-500 fill-current' : 'text-red-500 fill-current'}`}
                />
              )}
            </div>
            {place.openingHours && getCompactHours(place.openingHours).includes(' • ') && (
              <div className="text-xs text-muted-foreground ml-[18px]">
                {getCompactHours(place.openingHours).split(' • ')[1]}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
