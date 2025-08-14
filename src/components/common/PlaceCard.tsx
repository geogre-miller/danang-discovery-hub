import { motion } from 'framer-motion';
import { Heart, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLikePlace, useDislikePlace } from '@/hooks/use-places';
import { useAuth } from '@/context/AuthContext';
import { useIsFavorite, useFavoriteToggle } from '@/hooks/use-favorites';
import { toast } from 'sonner';
import type { Place } from '@/types/place';

export default function PlaceCard({ place }: { place: Place }) {
  const { user } = useAuth();
  const isFavorite = useIsFavorite(place._id);
  const favoriteToggle = useFavoriteToggle();
  const likePlace = useLikePlace();
  const dislikePlace = useDislikePlace();
  
  const img = place.imageUrl || '/placeholder.svg';
  
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
              <MapPin size={16} /> {place.address}
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
            <motion.button
              onClick={handleLike}
              disabled={likePlace.isPending || !user}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={place.userLiked ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
              className={`flex items-center gap-1 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                place.userLiked 
                  ? 'text-green-700 bg-green-50 px-2 py-1 rounded-md shadow-sm border border-green-200' 
                  : 'text-green-600 hover:text-green-700 hover:bg-green-50/50 px-2 py-1 rounded-md'
              }`}
            >
              <motion.div
                animate={place.userLiked ? { rotate: [0, 20, -20, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <ThumbsUp size={16} fill={place.userLiked ? 'currentColor' : 'none'} />
              </motion.div>
              <span className="font-medium">{place.likes}</span>
              {likePlace.isPending && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-current border-t-transparent rounded-full"
                />
              )}
            </motion.button>

            <motion.button
              onClick={handleDislike}
              disabled={dislikePlace.isPending || !user}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={place.userDisliked ? { 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, 0]
              } : {}}
              transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
              className={`flex items-center gap-1 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                place.userDisliked 
                  ? 'text-red-700 bg-red-50 px-2 py-1 rounded-md shadow-sm border border-red-200' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50/50 px-2 py-1 rounded-md'
              }`}
            >
              <motion.div
                animate={place.userDisliked ? { rotate: [0, -20, 20, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <ThumbsDown size={16} fill={place.userDisliked ? 'currentColor' : 'none'} />
              </motion.div>
              <span className="font-medium">{place.dislikes}</span>
              {dislikePlace.isPending && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-current border-t-transparent rounded-full"
                />
              )}
            </motion.button>
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
