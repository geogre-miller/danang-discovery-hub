import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', address: '', category: '' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/places', { params: { limit: 100 } });
      setPlaces(data.data || data.places || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await api.post('/places', form);
    setForm({ name: '', address: '', category: '' });
    await load();
  };

  const remove = async (id: string) => {
    await api.delete(`/places/${id}`);
    await load();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Admin — Da Nang Discovery Hub</title>
        <meta name="description" content="Manage places in the catalog." />
      </Helmet>
      <h1 className="font-display text-3xl mb-4">Admin Dashboard</h1>

      <div className="rounded-xl border p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} className="rounded-md border px-3 py-2" placeholder="Name" />
        <input value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} className="rounded-md border px-3 py-2" placeholder="Address" />
        <input value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} className="rounded-md border px-3 py-2" placeholder="Category" />
        <button onClick={create} className="rounded-full bg-primary text-primary-foreground px-4 py-2">Create</button>
      </div>

      {loading ? (
        <div className="h-40 rounded-xl bg-muted animate-pulse" />
      ) : (
        <ul className="space-y-2">
          {places.map((p) => (
            <li key={p._id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.address}</div>
              </div>
              <button onClick={() => remove(p._id)} className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
