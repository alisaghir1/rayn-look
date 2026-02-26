-- =============================================
-- Rayn Look — Full Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Categories
-- =============================================
CREATE TABLE IF NOT EXISTS "Category" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  type TEXT NOT NULL DEFAULT 'contact-lenses', -- 'contact-lenses' | 'accessory'
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Products
-- =============================================
CREATE TABLE IF NOT EXISTS "Product" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  "categoryId" UUID REFERENCES "Category"(id) ON DELETE SET NULL,
  "productType" TEXT NOT NULL DEFAULT 'contact-lenses', -- 'contact-lenses' | 'accessory'
  color TEXT,
  duration TEXT DEFAULT 'YEARLY', -- 'DAILY' | 'MONTHLY' | 'YEARLY'
  "hasDegree" BOOLEAN DEFAULT false,
  "availableDegrees" TEXT[] DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL,
  "compareAtPrice" DECIMAL(10,2),
  sku TEXT UNIQUE NOT NULL,
  "stockQuantity" INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Users / Customers
-- =============================================
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT DEFAULT '',
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  "zipCode" TEXT,
  role TEXT DEFAULT 'CUSTOMER', -- 'CUSTOMER' | 'ADMIN'
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Orders
-- =============================================
CREATE TABLE IF NOT EXISTS "Order" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderNumber" TEXT UNIQUE NOT NULL,
  "userId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  "orderStatus" TEXT DEFAULT 'PENDING', -- PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
  "paymentStatus" TEXT DEFAULT 'PENDING', -- PENDING, PAID, REFUNDED, COD
  "paymentMethod" TEXT DEFAULT 'cod', -- 'cod' | 'online'
  "stripePaymentId" TEXT,
  "shippingName" TEXT,
  "shippingEmail" TEXT,
  "shippingPhone" TEXT,
  "shippingAddress" TEXT,
  "shippingCity" TEXT,
  "shippingCountry" TEXT,
  "shippingZip" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Order Items
-- =============================================
CREATE TABLE IF NOT EXISTS "OrderItem" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "orderId" UUID REFERENCES "Order"(id) ON DELETE CASCADE,
  "productId" UUID REFERENCES "Product"(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  degree TEXT, -- Selected degree if applicable
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Inventory Log
-- =============================================
CREATE TABLE IF NOT EXISTS "InventoryLog" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "productId" UUID REFERENCES "Product"(id) ON DELETE CASCADE,
  change INTEGER NOT NULL,
  reason TEXT,
  "newStock" INTEGER NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Celebrities
-- =============================================
CREATE TABLE IF NOT EXISTS "Celebrity" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT, -- e.g. 'Singer & Actress'
  "lensColor" TEXT,
  image TEXT, -- URL to celebrity image
  quote TEXT,
  instagram TEXT,
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Testimonials
-- =============================================
CREATE TABLE IF NOT EXISTS "Testimonial" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  avatar TEXT, -- URL or emoji
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  product TEXT, -- Product they're reviewing
  featured BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Site Settings (key-value store)
-- =============================================
CREATE TABLE IF NOT EXISTS "SiteSettings" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Hero Slides
-- =============================================
CREATE TABLE IF NOT EXISTS "HeroSlide" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subtitle TEXT DEFAULT '',
  title TEXT NOT NULL,
  highlight TEXT NOT NULL,
  description TEXT DEFAULT '',
  "ctaLabel" TEXT DEFAULT 'Shop Now',
  "ctaHref" TEXT DEFAULT '/shop',
  "ctaSecondaryLabel" TEXT DEFAULT '',
  "ctaSecondaryHref" TEXT DEFAULT '',
  "bgImage" TEXT DEFAULT '',
  "bgGradient" TEXT DEFAULT 'from-dark/95 via-dark/70 to-dark/40',
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_product_slug ON "Product"(slug);
CREATE INDEX IF NOT EXISTS idx_product_category ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS idx_product_active ON "Product"(active);
CREATE INDEX IF NOT EXISTS idx_product_featured ON "Product"(featured);
CREATE INDEX IF NOT EXISTS idx_product_type ON "Product"("productType");
CREATE INDEX IF NOT EXISTS idx_category_slug ON "Category"(slug);
CREATE INDEX IF NOT EXISTS idx_category_type ON "Category"(type);
CREATE INDEX IF NOT EXISTS idx_order_user ON "Order"("userId");
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"("orderStatus");
CREATE INDEX IF NOT EXISTS idx_order_number ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS idx_orderitem_order ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_celebrity_active ON "Celebrity"(active);
CREATE INDEX IF NOT EXISTS idx_testimonial_active ON "Testimonial"(active);
CREATE INDEX IF NOT EXISTS idx_inventorylog_product ON "InventoryLog"("productId");
CREATE INDEX IF NOT EXISTS idx_heroslide_active ON "HeroSlide"(active);
CREATE INDEX IF NOT EXISTS idx_heroslide_order ON "HeroSlide"("sortOrder");

-- =============================================
-- Updated at trigger function
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['Category', 'Product', 'User', 'Order', 'Celebrity', 'Testimonial', 'SiteSettings', 'HeroSlide'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_%s ON %I', lower(tbl), tbl);
    EXECUTE format('CREATE TRIGGER trigger_update_%s BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', lower(tbl), tbl);
  END LOOP;
END;
$$;

-- =============================================
-- Disable RLS for admin access (service role key bypasses anyway)
-- =============================================
ALTER TABLE "Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Celebrity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Testimonial" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SiteSettings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HeroSlide" ENABLE ROW LEVEL SECURITY;

-- Allow public read for storefront tables
DROP POLICY IF EXISTS "Public read categories" ON "Category";
CREATE POLICY "Public read categories" ON "Category" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read products" ON "Product";
CREATE POLICY "Public read products" ON "Product" FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public read celebrities" ON "Celebrity";
CREATE POLICY "Public read celebrities" ON "Celebrity" FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public read testimonials" ON "Testimonial";
CREATE POLICY "Public read testimonials" ON "Testimonial" FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public read hero slides" ON "HeroSlide";
CREATE POLICY "Public read hero slides" ON "HeroSlide" FOR SELECT USING (active = true);

-- Allow anon insert for orders/users (checkout)
DROP POLICY IF EXISTS "Anon insert users" ON "User";
CREATE POLICY "Anon insert users" ON "User" FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon insert orders" ON "Order";
CREATE POLICY "Anon insert orders" ON "Order" FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon insert orderitems" ON "OrderItem";
CREATE POLICY "Anon insert orderitems" ON "OrderItem" FOR INSERT WITH CHECK (true);

-- Seed default categories
INSERT INTO "Category" (name, slug, description, type, "sortOrder") VALUES
  ('Brown Lenses', 'brown-lenses', 'Warm, natural brown tones for an effortlessly elegant look.', 'contact-lenses', 1),
  ('Gray Lenses', 'gray-lenses', 'Cool, sophisticated gray shades for a striking appearance.', 'contact-lenses', 2),
  ('Green Lenses', 'green-lenses', 'Fresh, vibrant green hues for a captivating gaze.', 'contact-lenses', 3),
  ('Blue Lenses', 'blue-lenses', 'Deep, mesmerizing blue tones for an ocean-inspired look.', 'contact-lenses', 4),
  ('Hazel Lenses', 'hazel-lenses', 'Multi-tonal hazel blends for a unique, natural appearance.', 'contact-lenses', 5),
  ('Yearly Lenses', 'yearly-lenses', 'Long-lasting yearly lenses for sustained comfort and style.', 'contact-lenses', 6),
  ('Daily Lenses', 'daily-lenses', 'Fresh daily lenses for everyday convenience.', 'contact-lenses', 7),
  ('Lens Solution', 'lens-solution', 'Premium lens care solutions for optimal hygiene and comfort.', 'accessory', 8),
  ('Lashes', 'lashes', 'Luxury false lashes to complement your Rayn Look.', 'accessory', 9),
  ('Accessories', 'accessories', 'Lens cases, tweezers, and more essentials.', 'accessory', 10)
ON CONFLICT (slug) DO NOTHING;

-- Seed admin user (change password after first login!)
INSERT INTO "User" (name, email, password, role, country)
VALUES ('Rayan', 'admin@raynlook.com', 'RaynLook2024!', 'ADMIN', 'Lebanon')
ON CONFLICT (email) DO NOTHING;

-- Seed default hero slides
INSERT INTO "HeroSlide" (subtitle, title, highlight, description, "ctaLabel", "ctaHref", "ctaSecondaryLabel", "ctaSecondaryHref", "bgImage", "bgGradient", "sortOrder") VALUES
  ('Premium Contact Lenses', 'See the World', 'Through Luxury', 'Crafted for comfort. Designed for confidence. Discover contact lenses that redefine elegance.', 'Shop Collection', '/shop', 'Our Story', '/about', '/hero-bg.jpg', 'from-dark/95 via-dark/70 to-dark/40', 1),
  ('New Arrivals 2026', 'Colors That', 'Captivate', 'Explore our latest collection of natural-looking colored lenses — from warm hazels to mesmerizing greens.', 'Explore New Colors', '/shop', 'Our Story', '/about', '/hero-bg-2.jpg', 'from-dark/90 via-dark/60 to-transparent', 2),
  ('Comfort Meets Style', 'Worn by', 'Celebrities', 'Trusted by influencers and celebrities worldwide. Premium lenses that deliver all-day comfort with stunning aesthetics.', 'Shop Best Sellers', '/shop', 'See Gallery', '/about', '/hero-bg-3.jpg', 'from-dark/90 via-dark/65 to-dark/30', 3),
  ('Since 2014', 'From Lebanon', 'To The World', 'What started as a dream in 2014 is now a global brand. Rayn Look — delivering luxury from Lebanon and Iraq to the world.', 'Read Our Story', '/about', 'Shop Now', '/shop', '/hero-bg-4.jpg', 'from-dark/95 via-dark/75 to-dark/40', 4);

-- =============================================
-- Storage: Create 'images' bucket for file uploads
-- Run this AFTER the tables are created
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the images bucket
DROP POLICY IF EXISTS "Public read images" ON storage.objects;
CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated/service role to upload images
DROP POLICY IF EXISTS "Allow upload images" ON storage.objects;
CREATE POLICY "Allow upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

-- Allow delete
DROP POLICY IF EXISTS "Allow delete images" ON storage.objects;
CREATE POLICY "Allow delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images');
