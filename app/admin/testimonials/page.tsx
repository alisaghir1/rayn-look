'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Star, MessageSquare } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  title: string;
  text: string;
  product: string;
  featured: boolean;
  active: boolean;
}

const emptyTestimonial: Omit<Testimonial, 'id'> = {
  name: '',
  location: '',
  avatar: '👩🏻',
  rating: 5,
  title: '',
  text: '',
  product: '',
  featured: true,
  active: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyTestimonial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials?all=true');
      const data = await res.json();
      if (data.testimonials) setTestimonials(data.testimonials);
    } catch (e) {
      console.error('Failed to load testimonials:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.title.trim() || !form.text.trim()) return;
    setSaving(true);
    setError('');
    try {
      const url = editing ? `/api/testimonials/${editing.id}` : '/api/testimonials';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to save testimonial (${res.status})`);
        setSaving(false);
        return;
      }
      await fetchTestimonials();
      setEditing(null);
      setCreating(false);
      setForm(emptyTestimonial);
    } catch (e) {
      console.error('Save failed:', e);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to delete testimonial (${res.status})`);
        return;
      }
      setTestimonials(testimonials.filter((t) => t.id !== id));
    } catch (e) {
      console.error('Delete failed:', e);
      setError('Network error. Please try again.');
    }
  };

  const startEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setCreating(false);
    setForm({
      name: testimonial.name,
      location: testimonial.location || '',
      avatar: testimonial.avatar || '👩🏻',
      rating: testimonial.rating,
      title: testimonial.title,
      text: testimonial.text,
      product: testimonial.product || '',
      featured: testimonial.featured,
      active: testimonial.active,
    });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyTestimonial);
  };

  const cancelForm = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyTestimonial);
  };

  const showForm = editing || creating;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-lobster">
            Testimonials
          </h1>
          <p className="text-gray-400 mt-1">{testimonials.length} testimonials</p>
        </div>
        {!showForm && (
          <button onClick={startCreate} className="btn-gold flex items-center gap-2 text-sm">
            <Plus className="h-4 w-4" /> Add Testimonial
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              {editing ? 'Edit Testimonial' : 'Add Testimonial'}
            </h2>
            <button onClick={cancelForm} className="p-1 text-gray-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Customer Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="e.g. Sarah Al-Rashid" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="e.g. Beirut, Lebanon" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avatar (emoji)</label>
              <input type="text" name="avatar" value={form.avatar} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rating (1-5)</label>
              <input type="number" name="rating" value={form.rating} onChange={handleChange} min="1" max="5" className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Product</label>
              <input type="text" name="product" value={form.product} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="e.g. Hazel Monthly Lenses" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Title *</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="e.g. Absolutely Stunning!" />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Review Text *</label>
            <textarea name="text" value={form.text} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent resize-none" placeholder="What did they say about Rayn Look..." />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} className="accent-admin-accent w-4 h-4" />
              <span className="text-sm text-gray-300">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="accent-admin-accent w-4 h-4" />
              <span className="text-sm text-gray-300">Active (visible on storefront)</span>
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.title.trim() || !form.text.trim()}
            className="btn-gold flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : editing ? 'Update Testimonial' : 'Add Testimonial'}
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : testimonials.length === 0 ? (
        <div className="bg-admin-card rounded-xl p-12 border border-white/5 text-center">
          <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No testimonials added yet.</p>
          <button onClick={startCreate} className="btn-gold text-sm">Add Your First Testimonial</button>
        </div>
      ) : (
        <div className="bg-admin-card rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Customer</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Title</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Rating</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Product</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Status</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.avatar}</span>
                        <div>
                          <p className="text-sm font-medium text-white">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300 max-w-[200px] truncate">{t.title}</td>
                    <td className="p-4">
                      <div className="flex gap-0.5">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-gold text-gold" />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300">{t.product || '—'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${t.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {t.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(t)} className="p-2 text-gray-400 hover:text-admin-accent transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-error transition-colors" title="Delete">
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
