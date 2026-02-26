'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Star, Instagram } from 'lucide-react';
import ImageSelector from '@/components/admin/ImageSelector';

interface Celebrity {
  id: string;
  name: string;
  role: string;
  lensColor: string;
  image: string;
  quote: string;
  instagram: string;
  sortOrder: number;
  active: boolean;
}

const emptyCeleb: Omit<Celebrity, 'id'> = {
  name: '',
  role: '',
  lensColor: '',
  image: '',
  quote: '',
  instagram: '',
  sortOrder: 0,
  active: true,
};

export default function AdminCelebritiesPage() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Celebrity | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyCeleb);
  const [saving, setSaving] = useState(false);

  const fetchCelebrities = async () => {
    try {
      const res = await fetch('/api/celebrities?all=true');
      const data = await res.json();
      if (data.celebrities) setCelebrities(data.celebrities);
    } catch (e) {
      console.error('Failed to load celebrities:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCelebrities(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/celebrities/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/celebrities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      await fetchCelebrities();
      setEditing(null);
      setCreating(false);
      setForm(emptyCeleb);
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this celebrity?')) return;
    try {
      await fetch(`/api/celebrities/${id}`, { method: 'DELETE' });
      setCelebrities(celebrities.filter((c) => c.id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const startEdit = (celeb: Celebrity) => {
    setEditing(celeb);
    setCreating(false);
    setForm({
      name: celeb.name,
      role: celeb.role || '',
      lensColor: celeb.lensColor || '',
      image: celeb.image || '',
      quote: celeb.quote || '',
      instagram: celeb.instagram || '',
      sortOrder: celeb.sortOrder,
      active: celeb.active,
    });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ ...emptyCeleb, sortOrder: celebrities.length + 1 });
  };

  const cancelForm = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyCeleb);
  };

  const showForm = editing || creating;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-lobster">
            Celebrities
          </h1>
          <p className="text-gray-400 mt-1">{celebrities.length} celebrities</p>
        </div>
        {!showForm && (
          <button onClick={startCreate} className="btn-gold flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Celebrity
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              {editing ? 'Edit Celebrity' : 'Add Celebrity'}
            </h2>
            <button onClick={cancelForm} className="p-1 text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="e.g. Haifa Wehbe" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Role</label>
              <input type="text" name="role" value={form.role} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="e.g. Singer & Actress" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Lens Color</label>
              <input type="text" name="lensColor" value={form.lensColor} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="e.g. Hazel Lenses" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Instagram</label>
              <input type="text" name="instagram" value={form.instagram} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="@username" />
            </div>
          </div>

          <ImageSelector
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
            folder="celebrities"
            label="Celebrity Photo"
            aspectRatio="square"
          />

          <div>
            <label className="block text-sm text-gray-400 mb-1">Quote</label>
            <textarea name="quote" value={form.quote} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent resize-none" placeholder="Their testimonial about Rayn Look..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sort Order</label>
              <input type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange} min="0" className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="accent-admin-accent w-4 h-4" />
                <span className="text-sm text-gray-300">Active (visible on storefront)</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="btn-gold flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : editing ? 'Update Celebrity' : 'Add Celebrity'}
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : celebrities.length === 0 ? (
        <div className="bg-admin-card rounded-xl p-12 border border-white/5 text-center">
          <Star className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No celebrities added yet.</p>
          <button onClick={startCreate} className="btn-gold text-sm">Add Your First Celebrity</button>
        </div>
      ) : (
        <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Celebrity</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Lens Color</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Instagram</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Order</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Status</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {celebrities.map((celeb) => (
                  <tr key={celeb.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {celeb.image ? (
                          <img src={celeb.image} alt={celeb.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-admin-accent/20 flex items-center justify-center text-admin-accent font-bold">
                            {celeb.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{celeb.name}</p>
                          <p className="text-xs text-gray-400">{celeb.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{celeb.lensColor || '—'}</td>
                    <td className="p-4">
                      {celeb.instagram ? (
                        <span className="text-sm text-admin-accent flex items-center gap-1">
                          <Instagram className="h-3 w-3" />
                          {celeb.instagram}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-300">{celeb.sortOrder}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${celeb.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {celeb.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(celeb)} className="p-2 text-gray-400 hover:text-admin-accent transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(celeb.id)} className="p-2 text-gray-400 hover:text-error transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
