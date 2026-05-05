-- Photo Gallery Database Setup

-- Drop existing tables (optional)
-- DROP TABLE IF EXISTS public.photos CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id bigserial primary key,
  name text not null unique,
  icon text default '📁',
  created_at timestamp with time zone default current_timestamp
);

-- Create photos table
CREATE TABLE IF NOT EXISTS public.photos (
  id bigserial primary key,
  title text not null,
  description text,
  drive_id text not null,
  image_url text not null,
  category_id bigint not null references public.categories(id) on delete cascade,
  created_at timestamp with time zone default current_timestamp
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_photos_category_id ON public.photos(category_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

-- Insert sample categories (ignore if already exist)
INSERT INTO public.categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Friends', '👥'),
  ('Travel', '✈️')
ON CONFLICT (name) DO NOTHING;

-- Insert sample photo
INSERT INTO public.photos (title, description, drive_id, image_url, category_id) 
SELECT 
  'Beautiful Sunset',
  'A stunning sunset over the mountains',
  '1example_id_1',
  'https://drive.google.com/uc?export=view&id=1example_id_1',
  id
FROM public.categories 
WHERE name = 'Nature' 
LIMIT 1
ON CONFLICT DO NOTHING;
