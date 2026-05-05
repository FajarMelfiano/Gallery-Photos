#!/usr/bin/env node

/**
 * Database Check & Setup
 * Verifies tables exist, guides setup if not
 * 
 * Usage: node scripts/db-init.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE credentials\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const SQL_SETUP = `-- Photo Gallery Database Setup

BEGIN;

CREATE TABLE IF NOT EXISTS public.categories (
  id bigserial primary key,
  name text not null unique,
  icon text default '📁',
  created_at timestamp with time zone default current_timestamp
);

CREATE TABLE IF NOT EXISTS public.photos (
  id bigserial primary key,
  title text not null,
  description text,
  drive_id text not null,
  image_url text not null,
  category_id bigint not null references public.categories(id) on delete cascade,
  created_at timestamp with time zone default current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_photos_category_id ON public.photos(category_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);

INSERT INTO public.categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Friends', '👥'),
  ('Travel', '✈️')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.photos (title, description, drive_id, image_url, category_id) 
VALUES (
  'Beautiful Sunset',
  'A stunning sunset over the mountains',
  '1example_id_1',
  'https://drive.google.com/uc?export=view&id=1example_id_1',
  (SELECT id FROM public.categories WHERE name = 'Nature' LIMIT 1)
)
ON CONFLICT DO NOTHING;

COMMIT;`;

async function checkDatabase() {
  try {
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('count()', { count: 'exact', head: true });

    const { data: photos, error: photoError } = await supabase
      .from('photos')
      .select('count()', { count: 'exact', head: true });

    const ready = !catError && !photoError;

    if (ready) {
      console.log('✅ Database ready\n');
      process.exit(0);
    }

    // Not ready
    console.log('⚠️  Database setup needed\n');
    console.log('📖 SETUP STEPS:\n');
    console.log('1. Go to: https://supabase.com/dashboard\n');
    console.log('2. Click SQL Editor → New Query\n');
    console.log('3. Copy this SQL:\n');
    console.log('─'.repeat(65));
    console.log(SQL_SETUP);
    console.log('─'.repeat(65) + '\n');
    console.log('4. Click Run\n');
    console.log('5. Then: npm start\n');

    process.exit(1);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
