-- ==========================================
-- SUPABASE SCHEMA MIGRATION SCRIPT
-- ==========================================
-- This script creates the necessary tables,
-- storage buckets, and security policies for
-- the Stroy.kg application.
-- ==========================================

-- 1. Create custom ENUM types for roles and statuses
CREATE TYPE user_role AS ENUM ('consumer', 'developer', 'supplier', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE product_type AS ENUM ('material', 'service');

-- ==========================================
-- TABLE: users
-- ==========================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Base fields
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'consumer',
  photoURL TEXT,
  region TEXT,

  -- State flags
  onboardingCompleted BOOLEAN DEFAULT FALSE,
  verificationStatus verification_status DEFAULT 'pending',
  rating NUMERIC(3, 2) DEFAULT 5.00,

  -- Consumer specific
  dateOfBirth DATE,
  address TEXT,
  housingType TEXT,

  -- Developer & Supplier specific
  companyName TEXT,
  inn TEXT,

  -- JSON fields for arrays of files/strings (URLs and names)
  documents JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  certificates JSONB DEFAULT '[]'::jsonb,
  categories JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updating the `updated_at` column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
-- 1. Anyone can read public profiles (needed for catalog display)
CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

-- 2. Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 4. Admins can update any profile (e.g., changing verification status)
CREATE POLICY "Admins can update all profiles" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==========================================
-- TABLE: products
-- ==========================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplierId UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  type product_type NOT NULL, -- 'material' or 'service'
  category TEXT NOT NULL,     -- Specific category name (e.g., 'Бетон и ЖБИ')
  region TEXT,
  isActive BOOLEAN DEFAULT TRUE,

  -- Images (JSON array of URLs)
  images JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
-- 1. Anyone can view active products
CREATE POLICY "Active products are viewable by everyone" ON public.products
  FOR SELECT USING (isActive = TRUE);

-- 2. Suppliers can view their own products (even if inactive)
CREATE POLICY "Suppliers can view own products" ON public.products
  FOR SELECT USING (auth.uid() = supplierId);

-- 3. Suppliers can insert/update/delete their own products
CREATE POLICY "Suppliers can insert own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = supplierId);

CREATE POLICY "Suppliers can update own products" ON public.products
  FOR UPDATE USING (auth.uid() = supplierId);

CREATE POLICY "Suppliers can delete own products" ON public.products
  FOR DELETE USING (auth.uid() = supplierId);

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================

-- 1. Avatars Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar." ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. User Files Bucket (Documents, Projects, Certificates)
INSERT INTO storage.buckets (id, name, public) VALUES ('user_files', 'user_files', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for user files
CREATE POLICY "User files are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'user_files');

CREATE POLICY "Users can upload their own files." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files." ON storage.objects
  FOR UPDATE USING (bucket_id = 'user_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Note: The "auth.uid()::text = (storage.foldername(name))[1]" condition ensures
-- that users can only upload files into a folder named after their UUID.
