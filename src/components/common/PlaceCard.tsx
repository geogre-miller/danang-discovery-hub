import { motion } from 'framer-motion';
import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export type Place = {
  _id: string;
  name: string;
  address: string;
  images?: string[];
  rating?: number;
  category?: string;
};

export default function PlaceCard({ place, onFavoriteToggle, isFavorite }: { place: Place; onFavoriteToggle?: (id: string) => void; isFavorite?: boolean; }) {
  const img = place.images?.[0] || '/placeholder.svg';
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
          <div>
            <h3 className="text-lg font-semibold leading-tight">{place.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin size={16} /> {place.address}</p>
          </div>
          <button
            onClick={() => onFavoriteToggle?.(place._id)}
            className={`p-2 rounded-full ${isFavorite ? 'bg-primary/15 text-primary' : 'bg-secondary text-foreground/70'}`}
            aria-label="Toggle favorite"
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Star size={16} />
          <span className="text-sm">{place.rating ?? 'No rating'}</span>
        </div>
        <div className="text-xs text-muted-foreground">{place.category}</div>
      </div>
    </motion.article>
  );
}
