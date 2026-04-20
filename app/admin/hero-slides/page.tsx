'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Save, X, Image as ImageIcon } from 'lucide-react';
import ImageSelector from '@/components/admin/ImageSelector';

interface HeroSlide {
  id: string;
  subtitle: string;
  title: string;
  highlight: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  bgImage: string;
  bgGradient: string;
  sortOrder: number;
  active: boolean;
}

const emptySlide: Omit<HeroSlide, 'id'> = {
  subtitle: '',
  title: '',
  highlight: '',
  description: '',
  ctaLabel: 'Shop Now',
  ctaHref: '/shop',
  ctaSecondaryLabel: '',
  ctaSecondaryHref: '',
  bgImage: '',
  bgGradient: 'from-dark/95 via-dark/70 to-dark/40',
  sortOrder: 0,
  active: true,
};

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<HeroSlide, 'id'>>(emptySlide);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSlides = () => {
    fetch('/api/hero-slides?all=true')
      .then((res) => res.json())
      .then((data) => {
        setSlides(data.slides || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchSlides(); }, []);

  const startNew = () => {
    setEditing(null);
    setIsNew(true);
    setForm({ ...emptySlide, sortOrder: slides.length + 1 });
  };

  const startEdit = (slide: HeroSlide) => {
    setIsNew(false);
    setEditing(slide.id);
    setForm({
      subtitle: slide.subtitle,
      title: slide.title,
      highlight: slide.highlight,
      description: slide.description,
      ctaLabel: slide.ctaLabel,
      ctaHref: slide.ctaHref,
      ctaSecondaryLabel: slide.ctaSecondaryLabel || '',
      ctaSecondaryHref: slide.ctaSecondaryHref || '',
      bgImage: slide.bgImage,
      bgGradient: slide.bgGradient,
      sortOrder: slide.sortOrder,
      active: slide.active,
    });
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
    setForm(emptySlide);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const url = isNew ? '/api/hero-slides' : `/api/hero-slides/${editing}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        fetchSlides();
        cancel();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to save slide (${res.status})`);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hero slide?')) return;
    try {
      const res = await fetch(`/api/hero-slides/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to delete slide (${res.status})`);
        return;
      }
      fetchSlides();
    } catch {
      setError('Network error. Please try again.');
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      const res = await fetch(`/api/hero-slides/${slide.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !slide.active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to toggle slide (${res.status})`);
        return;
      }
      fetchSlides();
    } catch {
      setError('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-lobster">
            Hero Slides
          </h1>
          <p className="text-gray-400 mt-1">{slides.length} slides • Manage homepage hero banner</p>
        </div>
        {!isNew && !editing && (
          <button onClick={startNew} className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent/90 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isNew || editing) && (
        <div className="bg-admin-card rounded-xl border border-white/10 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">{isNew ? 'Add New Slide' : 'Edit Slide'}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Subtitle (small text above title)</label>
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="e.g. Premium Contact Lenses" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title (main text) *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="e.g. See the World" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Highlight (gold text) *</label>
              <input value={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="e.g. Through Luxury" required />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent resize-none" placeholder="Short description text..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Primary Button Label</label>
              <input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="Shop Now" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Primary Button Link</label>
              <input value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="/shop" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Secondary Button Label (optional)</label>
              <input value={form.ctaSecondaryLabel} onChange={(e) => setForm({ ...form, ctaSecondaryLabel: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="Our Story" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Secondary Button Link</label>
              <input value={form.ctaSecondaryHref} onChange={(e) => setForm({ ...form, ctaSecondaryHref: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent" placeholder="/about" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageSelector
              value={form.bgImage}
              onChange={(url) => setForm({ ...form, bgImage: url })}
              folder="hero"
              label="Background Image"
              aspectRatio="wide"
            />
            <div>
              <label className="block text-xs text-gray-400 mb-1">Background Gradient</label>
              <select value={form.bgGradient} onChange={(e) => setForm({ ...form, bgGradient: e.target.value })} className="w-full px-3 py-2 bg-admin-bg border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-admin-accent">
                <option value="from-dark/95 via-dark/70 to-dark/40">Dark Heavy</option>
                <option value="from-dark/90 via-dark/60 to-transparent">Dark Medium</option>
                <option value="from-dark/90 via-dark/65 to-dark/30">Dark Medium-Light</option>
                <option value="from-dark/95 via-dark/75 to-dark/40">Dark Strong</option>
                <option value="from-dark/80 via-dark/50 to-transparent">Dark Light</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-700 peer-checked:bg-admin-accent rounded-full peer-focus:ring-2 peer-focus:ring-admin-accent/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5"></div>
            </label>
            <span className="text-sm text-gray-300">Active</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.title || !form.highlight} className="flex items-center gap-2 bg-admin-accent hover:bg-admin-accent/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Slide'}
            </button>
            <button onClick={cancel} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 px-5 py-2.5 rounded-lg text-sm transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Slides List */}
      <div className="space-y-3">
        {slides.length === 0 && !isNew && (
          <div className="bg-admin-card rounded-xl border border-white/5 p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hero slides yet. Add your first slide to customize the homepage.</p>
          </div>
        )}

        {slides.map((slide) => (
          <div key={slide.id} className={`bg-admin-card rounded-xl border ${slide.active ? 'border-white/10' : 'border-white/5 opacity-60'} p-5 flex items-center gap-4`}>
            <GripVertical className="w-5 h-5 text-gray-600 flex-shrink-0 cursor-grab" />

            {/* Preview */}
            <div className="w-24 h-14 rounded-lg overflow-hidden bg-admin-bg flex-shrink-0 relative">
              {slide.bgImage ? (
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${slide.bgImage}')` }}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient}`} />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {slide.title} <span className="text-admin-accent">{slide.highlight}</span>
              </p>
              <p className="text-xs text-gray-400 truncate mt-0.5">{slide.subtitle} — {slide.description?.slice(0, 60)}...</p>
            </div>

            {/* Order badge */}
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">#{slide.sortOrder}</span>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => toggleActive(slide)} className={`p-2 rounded-lg transition-colors ${slide.active ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-500 hover:bg-white/5'}`} title={slide.active ? 'Deactivate' : 'Activate'}>
                {slide.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => startEdit(slide)} className="p-2 text-gray-400 hover:text-admin-accent hover:bg-admin-accent/10 rounded-lg transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(slide.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
