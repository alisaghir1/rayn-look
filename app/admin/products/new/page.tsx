'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import MultiImageSelector from '@/components/admin/MultiImageSelector';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { productTypes, lensDurations, generateDegreeValues } from '@/lib/constants';

const degreeValues = generateDegreeValues();

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    productType: 'contact-lenses',
    color: '',
    duration: 'YEARLY',
    hasDegree: false,
    availableDegrees: [] as string[],
    price: '',
    compareAtPrice: '',
    sku: '',
    stockQuantity: '0',
    images: [''],
    featured: false,
  });

  const isLens = formData.productType === 'contact-lenses';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' ? { slug: slugify(value) } : {}),
    }));
  };

  const handleDegreeToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasDegree: checked,
      availableDegrees: checked ? degreeValues : [],
    }));
  };

  const handleImageChange = (index: number, value: string) => {
    const images = [...formData.images];
    images[index] = value;
    setFormData({ ...formData, images });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: formData.images.filter(Boolean),
        }),
      });

      if (res.ok) {
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Create product error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white font-lobster">
            Add New Product
          </h1>
          <p className="text-gray-400 mt-1">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Type */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product Type</h2>
          <div className="grid grid-cols-2 gap-4">
            {productTypes.map((pt) => (
              <label
                key={pt.value}
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.productType === pt.value
                    ? 'border-admin-accent bg-admin-accent/10 text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/30'
                }`}
              >
                <input
                  type="radio"
                  name="productType"
                  value={pt.value}
                  checked={formData.productType === pt.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-2xl">{pt.value === 'contact-lenses' ? '👁️' : '🛍️'}</span>
                <span className="text-sm font-medium">{pt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                placeholder={isLens ? 'e.g. Amber Glow' : 'e.g. Premium Lens Solution'}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                placeholder="auto-generated"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent resize-none"
              placeholder="Product description..."
            />
          </div>

          <div className={`grid ${isLens ? 'grid-cols-3' : 'grid-cols-1'} gap-4`}>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category *</label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
              >
                <option value="">Select a category</option>
                {categories
                  .filter((c) => isLens ? c.type === 'contact-lenses' : c.type === 'accessory')
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>
            {isLens && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Color *</label>
                  <input
                    type="text"
                    name="color"
                    required
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                    placeholder="e.g. Brown"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration *</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                  >
                    {lensDurations.map((d) => (
                      <option key={d.value} value={d.value} disabled={!d.active}>
                        {d.label}{!d.active ? ' (Coming Soon)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Degree Options — only for contact lenses */}
        {isLens && (
          <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Degree Options</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasDegree}
                onChange={(e) => handleDegreeToggle(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-sm text-gray-300">Available with prescription degree</span>
            </label>
            {formData.hasDegree && (
              <p className="text-xs text-gray-500">
                Degrees from -0.50 to -10.00 will be available for customers to select. Without degree (0.00) is always included.
              </p>
            )}
            <p className="text-xs text-gray-500">
              Note: Customers can always purchase without a degree (plano/cosmetic).
            </p>
          </div>
        )}

        {/* Pricing & Inventory */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Pricing & Inventory</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Price (USD) *</label>
              <input
                type="number"
                name="price"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                placeholder="29.99"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Compare At Price</label>
              <input
                type="number"
                name="compareAtPrice"
                step="0.01"
                min="0"
                value={formData.compareAtPrice}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                placeholder="39.99"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">SKU *</label>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                placeholder="RL-XX-001"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                required
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent"
                placeholder="0"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 accent-amber-500"
            />
            <span className="text-sm text-gray-300">Featured product</span>
          </label>
        </div>

        {/* Images */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5">
          <MultiImageSelector
            value={formData.images.filter(Boolean)}
            onChange={(urls) => setFormData({ ...formData, images: urls })}
            folder="products"
            label="Product Images"
            max={8}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-gold flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
