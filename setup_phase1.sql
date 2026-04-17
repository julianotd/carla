
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles & Roles
-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    avatar_url text,
    bio text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    role text PRIMARY KEY
);

INSERT INTO public.roles (role) VALUES
('admin'), ('editor'), ('therapist'), ('receptionist')
ON CONFLICT (role) DO NOTHING;

-- Create user_roles table (N:N)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role text REFERENCES public.roles(role) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- 2. Content Tables
-- Therapists
CREATE TABLE IF NOT EXISTS public.therapists (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    bio text,
    specialties text[], -- Array of strings
    photo_url text,
    contact_whatsapp text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    excerpt text,
    content_html text,
    cover_image_url text,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at timestamp with time zone,
    author_id uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone,
    location_text text,
    is_online boolean DEFAULT false,
    cover_image_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Updates to Existing Tables
-- Services (Add new columns)
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS price_text text,
ADD COLUMN IF NOT EXISTS duration_min integer,
ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Testimonials (Add new columns)
ALTER TABLE public.testimonials
ADD COLUMN IF NOT EXISTS client_name text, -- Can be alias for role_label or separate
ADD COLUMN IF NOT EXISTS rating integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS photo_url text;

-- 4. Storage Setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. RLS Policies

-- Helper function to check role
CREATE OR REPLACE FUNCTION public.has_role(check_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Public read, Self update
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Attach trigger (commented out to avoid error if already exists, user can run manually if needed)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Content Tables: Public Read (Active/Published), Admin/Editor Write
-- Define tables for loop in application logic, here we set individual policies

-- Therapists
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read therapists" ON public.therapists FOR SELECT USING (is_active = true OR public.has_role('admin') OR public.has_role('editor'));
CREATE POLICY "Admin/Editor full access therapists" ON public.therapists FOR ALL USING (public.has_role('admin') OR public.has_role('editor'));

-- Blog Posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blog" ON public.blog_posts FOR SELECT USING (status = 'published' OR public.has_role('admin') OR public.has_role('editor'));
CREATE POLICY "Admin/Editor full access blog" ON public.blog_posts FOR ALL USING (public.has_role('admin') OR public.has_role('editor'));

-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (is_active = true OR public.has_role('admin') OR public.has_role('editor'));
CREATE POLICY "Admin/Editor full access events" ON public.events FOR ALL USING (public.has_role('admin') OR public.has_role('editor'));

-- Services (Update policies)
-- Drop old policy if simplistic
DROP POLICY IF EXISTS "Allow public read access" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (is_active = true OR public.has_role('admin') OR public.has_role('editor'));
CREATE POLICY "Admin/Editor full access services" ON public.services FOR ALL USING (public.has_role('admin') OR public.has_role('editor'));

-- Testimonials (Update policies)
DROP POLICY IF EXISTS "Allow public read access" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials FOR SELECT USING (is_active = true OR public.has_role('admin') OR public.has_role('editor'));
CREATE POLICY "Admin/Editor full access testimonials" ON public.testimonials FOR ALL USING (public.has_role('admin') OR public.has_role('editor'));

-- User Roles: Admin only
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage roles" ON public.user_roles FOR ALL USING (public.has_role('admin'));
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Admin/Editor Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND (public.has_role('admin') OR public.has_role('editor')));
CREATE POLICY "Admin/Editor Update" ON storage.objects FOR UPDATE USING (bucket_id = 'images' AND (public.has_role('admin') OR public.has_role('editor')));
CREATE POLICY "Admin/Editor Delete" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND (public.has_role('admin') OR public.has_role('editor')));
