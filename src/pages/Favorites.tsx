import { Helmet } from 'react-helmet-async';
<<<<<<< HEAD
import api from '@/lib/api';
import PlaceCard from '@/components/common/PlaceCard';
import { Place } from '@/types/place';
=======
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/use-favorites';
import PlaceCard from '@/components/common/PlaceCard';
>>>>>>> productsDetail

export default function Favorites() {
  const { user } = useAuth();
  const { data: favorites = [], isLoading, error } = useFavorites();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Helmet>
          <title>Favorites — Da Nang Discovery Hub</title>
          <meta name="description" content="Your saved favorite places in Da Nang." />
        </Helmet>
        <div className="text-center py-12">
          <h1 className="font-display text-3xl mb-4">Favorites</h1>
          <p className="text-muted-foreground">Please log in to view your favorite places.</p>
        </div>
      </div>
    );
  }

  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Favorites — Da Nang Discovery Hub</title>
        <meta name="description" content="Your saved favorite places in Da Nang." />
      </Helmet>
      <h1 className="font-display text-3xl mb-6">Your Favorites</h1>
      
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive">
          Error loading favorites: {(error as any)?.message}
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : safeFavorites.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeFavorites.map((favorite: any) => {
            // favorite might be a populated place object or have a place field
            const place = favorite.place || favorite;
            if (!place || !place._id) return null;
            return <PlaceCard key={place._id} place={place} />;
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No favorites yet.</p>
          <p className="text-sm text-muted-foreground">
            Start exploring and click the heart icon on places you'd like to save!
          </p>
        </div>
      )}
    </div>
  );
}
