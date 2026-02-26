'use client';

import { useEffect, useState } from 'react';
import { Save, Store, Percent, Globe, Mail, Phone, MapPin } from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  currency: string;
  taxRate: number;
  lowStockThreshold: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTiktok: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'Rayn Look',
  siteDescription: 'Premium Contact Lenses — Luxury eyewear for every occasion',
  currency: 'USD',
  taxRate: 0,
  lowStockThreshold: 10,
  contactEmail: 'hello@rayn-look.com',
  contactPhone: '+1 (555) 000-0000',
  address: 'Los Angeles, CA, USA',
  socialFacebook: 'https://www.facebook.com/rayn.look/',
  socialInstagram: 'https://www.instagram.com/rayn_look/',
  socialTiktok: 'https://www.tiktok.com/@rayn_look_lenses',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.siteName) setSettings(data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Settings save error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-lobster">
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Configure your store settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Info */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Store className="h-4 w-4 text-admin-accent" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Store Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Site Name</label>
              <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Currency</label>
              <select name="currency" value={settings.currency} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Site Description</label>
            <textarea name="siteDescription" rows={2} value={settings.siteDescription} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent resize-none" />
          </div>
        </div>

        {/* Tax & Inventory */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-admin-accent" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Tax & Inventory</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tax Rate (%)</label>
              <input type="number" name="taxRate" step="0.01" min="0" value={settings.taxRate} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Low Stock Threshold</label>
              <input type="number" name="lowStockThreshold" min="1" value={settings.lowStockThreshold} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4 text-admin-accent" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Contact Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
              <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Contact Phone</label>
              <input type="tel" name="contactPhone" value={settings.contactPhone} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Address</label>
            <input type="text" name="address" value={settings.address} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-admin-card rounded-xl p-6 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-admin-accent" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Social Media</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Facebook</label>
              <input type="url" name="socialFacebook" value={settings.socialFacebook} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Instagram</label>
              <input type="url" name="socialInstagram" value={settings.socialInstagram} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">TikTok</label>
              <input type="url" name="socialTiktok" value={settings.socialTiktok} onChange={handleChange} className="w-full px-4 py-3 bg-admin-bg border border-white/10 rounded-lg text-white focus:outline-none focus:border-admin-accent" placeholder="https://tiktok.com/@..." />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-gold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className="text-sm text-green-400">Settings saved successfully!</span>
          )}
        </div>
      </form>
    </div>
  );
}
