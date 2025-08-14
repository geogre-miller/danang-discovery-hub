import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { usePlaces } from '@/hooks/use-places';
import PlaceCard from '@/components/common/PlaceCard';
import { PLACE_CATEGORIES } from '@/types/place';

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const { data: places, isLoading, error } = usePlaces({
    search: search || undefined,
    category: selectedCategory || undefined
  });

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will be handled by React Query automatically due to dependency change
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
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }} 
          className="text-center"
        >
          <h1 className="font-display text-4xl md:text-5xl leading-tight">
            Discover Da Nang's Delights
          </h1>
          <p className="mt-2 text-muted-foreground">{heroSubtitle}</p>
          
          <form onSubmit={onSubmitSearch} className="mt-6 max-w-xl mx-auto space-y-4">
            <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2">
              <Search size={18} className="text-muted-foreground" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search by name or address..." 
                className="bg-transparent outline-none flex-1" 
              />
              <button 
                type="submit"
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 hover-scale"
              >
                Search
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 rounded-full text-sm ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
              >
                All Categories
              </button>
              {PLACE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </form>
        </motion.div>
      </section>

      <section className="container mx-auto px-4 pb-10">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-destructive/10 text-destructive">
            Error loading places: {error.message}
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : places && places.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No places found. Try adjusting your search or filters.</p>
          </div>
        )}
      </section>
    </div>
  );
}
