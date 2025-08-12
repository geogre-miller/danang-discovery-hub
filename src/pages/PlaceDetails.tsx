import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function PlaceDetails() {
  const { id } = useParams();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const { data } = await api.get(`/places/${id}`);
        setPlace(data);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load place');
      } finally {
        setLoading(false);
      }
    };
    fetchPlace();
  }, [id]);

  const title = useMemo(() => (place?.name ? `${place.name} — Details` : 'Place Details'), [place?.name]);

  if (loading) return <div className="container mx-auto px-4 py-10"><div className="h-80 bg-muted rounded-xl animate-pulse" /></div>;
  if (error) return <div className="container mx-auto px-4 py-10"><div className="p-4 rounded-lg bg-destructive/10 text-destructive">{error}</div></div>;
  if (!place) return null;

  const images: string[] = place.images || [];
  const coords = place.coordinates || { lat: 16.0471, lng: 108.2068 };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={`Explore ${place.name} in Da Nang — ${place.category}.`} />
        <link rel="canonical" href={`/places/${place._id}`} />
      </Helmet>
      <h1 className="font-display text-3xl mb-4">{place.name}</h1>
      <p className="text-muted-foreground">{place.address}</p>
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {images.slice(0,3).map((src: string, i: number) => (
            <img key={i} src={src} alt={`${place.name} ${i+1}`} className="w-full h-56 object-cover rounded-lg" loading="lazy"/>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-xl border p-4">
            <h2 className="font-semibold mb-2">Opening Hours</h2>
            <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{place.openingHours || 'N/A'}</pre>
          </div>
          <div className="rounded-xl border p-4">
            <h2 className="font-semibold mb-2">Reviews</h2>
            {place.reviews?.length ? (
              <ul className="space-y-3">
                {place.reviews.map((r: any, i: number) => (
                  <li key={i} className="rounded-md bg-secondary p-3">
                    <div className="text-sm font-medium">{r.user?.username || 'Anonymous'} — {r.stars}★</div>
                    <div className="text-sm text-muted-foreground">{r.comment}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border overflow-hidden h-80">
          <MapContainer center={[coords.lat, coords.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>{place.name}</Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
