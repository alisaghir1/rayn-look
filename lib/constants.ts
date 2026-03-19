export const siteConfig = {
  name: 'Rayn Look',
  description: 'Premium Contact Lenses',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.raynlook.com',
  ogImage: '/og-image.jpg',
  links: {
    instagram: 'https://www.instagram.com/rayn_look/',
    facebook: 'https://www.facebook.com/rayn.look/',
    tiktok: 'https://www.tiktok.com/@rayn_look_lenses',
  },
  contact: {
    email: 'info@raynlook.com',
    phone: '+961 70 123 456',
    address: 'Beirut, Lebanon',
  },
};

// Product types
export const productTypes = [
  { value: 'contact-lenses', label: 'Contact Lenses' },
  { value: 'accessory', label: 'Accessory' },
] as const;

// Lens duration options (only yearly active for now)
export const lensDurations = [
  { value: 'DAILY', label: 'Daily', active: true },
  { value: 'MONTHLY', label: 'Monthly', active: false },
  { value: 'YEARLY', label: 'Yearly', active: true },
] as const;

// Degree options for lenses
export const degreeOptions = {
  withDegree: true,
  withoutDegree: true,
  range: { min: -0.50, max: -10.00, step: 0.25 },
};

// Generate degree values
export function generateDegreeValues(): string[] {
  const values: string[] = ['0.00 (No Degree)'];
  for (let d = degreeOptions.range.min; d >= degreeOptions.range.max; d -= degreeOptions.range.step) {
    values.push(d.toFixed(2));
  }
  return values;
}

// Product categories
export const categories = [
  { name: 'With Degrees', slug: 'with-degrees', description: 'Prescription colored contact lenses with corrective degrees.', type: 'contact-lenses' },
  { name: 'Without Degrees', slug: 'without-degrees', description: 'Cosmetic colored contact lenses without prescription.', type: 'contact-lenses' },
  { name: 'Accessories', slug: 'accessories', description: 'Lens cases, tweezers, and more essentials.', type: 'accessory' },
  { name: 'Lashes', slug: 'lashes', description: 'Luxury false lashes to complement your Rayn Look.', type: 'accessory' },
  { name: 'Solution', slug: 'solution', description: 'Premium lens care solutions for optimal hygiene and comfort.', type: 'accessory' },
];

// Payment methods
export const paymentMethods = [
  { value: 'cod', label: 'Cash on Delivery', description: 'Pay when your order arrives', available: true, icon: '💵' },
  { value: 'online', label: 'Pay Online', description: 'Coming Soon', available: false, icon: '💳' },
] as const;

export const trustBadges = [
  { icon: 'Shield', label: 'FDA Approved' },
  { icon: 'Eye', label: 'Super Natural' },
  { icon: 'Truck', label: 'Worldwide Shipping' },
  { icon: 'Award', label: 'Premium Quality' },
];
