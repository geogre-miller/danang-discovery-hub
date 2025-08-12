import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/api';
import PlaceCard, { Place } from '@/components/common/PlaceCard';

export default function Favorites() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ids: string[] = JSON.parse(localStorage.getItem('ddh_favorites') || '[]');
        if (ids.length === 0) { setPlaces([]); return; }
        const { data } = await api.get('/places', { params: { ids: ids.join(',') } });
        setPlaces(data.data || data.places || []);
      } catch {
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Favorites — Da Nang Discovery Hub</title>
        <meta name="description" content="Your saved favorite places in Da Nang." />
      </Helmet>
      <h1 className="font-display text-3xl mb-6">Your Favorites</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : places.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((p) => (
            <PlaceCard key={p._id} place={p} isFavorite />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No favorites yet.</p>
      )}
    </div>
  );
}
