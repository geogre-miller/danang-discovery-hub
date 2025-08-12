import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import PlaceCard, { Place } from '@/components/common/PlaceCard';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('ddh_favorites') || '[]'); } catch { return []; }
  });

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/places', { params: { page, limit: 12, search } });
      setPlaces(data.data || data.places || []);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlaces(); /* eslint-disable-next-line */ }, [page]);

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPlaces();
  };

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      localStorage.setItem('ddh_favorites', JSON.stringify(next));
      toast({ title: prev.includes(id) ? 'Removed from favorites' : 'Saved to favorites' });
      return next;
    });
  };

  const heroSubtitle = useMemo(() => 'Cafes, restaurants, and hidden gems in Da Nang', []);

  return (
    <div>
      <Helmet>
        <title>Da Nang Discovery Hub — Best Places</title>
        <meta name="description" content="Discover the best cafes and restaurants in Da Nang. Browse places, reviews and save favorites." />
        <link rel="canonical" href="/" />
      </Helmet>

      <section className="container mx-auto px-4 pt-8 pb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
          <h1 className="font-display text-4xl md:text-5xl leading-tight">Discover Da Nang's Delights</h1>
          <p className="mt-2 text-muted-foreground">{heroSubtitle}</p>
          <form onSubmit={onSubmitSearch} className="mt-6 max-w-xl mx-auto flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-full border bg-card px-4 py-2">
              <Search size={18} className="text-muted-foreground" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or category..." className="bg-transparent outline-none flex-1" />
            </div>
            <button className="px-5 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 hover-scale">Search</button>
          </form>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-10">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive">{error}</div>
        )}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((p) => (
              <PlaceCard key={p._id} place={p} onFavoriteToggle={toggleFav} isFavorite={favorites.includes(p._id)} />
            ))}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button disabled={page<=1} onClick={() => setPage((p)=>Math.max(1,p-1))} className="px-4 py-2 rounded-full border bg-secondary disabled:opacity-50">Prev</button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <button disabled={page>=totalPages} onClick={() => setPage((p)=>p+1)} className="px-4 py-2 rounded-full border bg-secondary disabled:opacity-50">Next</button>
        </div>
      </section>
    </div>
  );
}
