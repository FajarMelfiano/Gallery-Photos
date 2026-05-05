#!/usr/bin/env node

/**
 * Database Setup via PostgreSQL Direct Connection
 * 
 * Usage: node scripts/setup-db-postgres.js
 */

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract connection info
const projectId = supabaseUrl.split('//')[1].split('.')[0];
const host = `db.${projectId}.supabase.co`;
const user = 'postgres';
const password = supabaseServiceKey.split('.')[2]; // JWT middle part (not ideal but works for extraction)

// Better: use connection string format
const connectionString = `postgresql://postgres:${supabaseServiceKey}@${host}:5432/postgres?sslmode=require`;

console.log('🚀 Database Setup via PostgreSQL\n');
console.log('⚠️  Note: This requires PostgreSQL client installed\n');

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create SQL file
const sqlFile = path.join(__dirname, 'setup-tables.sql');
const sqlContent = `-- Photo Gallery Database Setup

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
`;

fs.writeFileSync(sqlFile, sqlContent);

console.log('📝 Created SQL file: scripts/setup-tables.sql\n');
console.log('🔄 Attempting to connect to PostgreSQL...\n');

// Try to execute with psql if available
exec(`psql "${connectionString}" -f "${sqlFile}"`, (error, stdout, stderr) => {
  if (error) {
    if (error.code === 127) {
      // psql not installed
      console.error('⚠️  PostgreSQL client (psql) not installed\n');
      showManualInstructions(sqlFile, sqlContent);
    } else {
      console.error('❌ Connection error:', error.message);
      showManualInstructions(sqlFile, sqlContent);
    }
  } else {
    console.log('✅ Database setup completed!\n');
    console.log('📋 Output:\n');
    console.log(stdout);
    
    // Clean up
    fs.unlinkSync(sqlFile);
    
    console.log('\n✨ Ready to start!\n');
    console.log('npm start\n');
  }
});

function showManualInstructions(sqlFile, sqlContent) {
  console.log('\n📖 Manual Setup Instructions:\n');
  console.log('Option 1: Using Supabase Dashboard\n');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to: SQL Editor');
  console.log('4. New Query');
  console.log('5. Copy this SQL:\n');
  console.log('-------------------------------------------');
  console.log(sqlContent);
  console.log('-------------------------------------------\n');
  console.log('6. Click "Run"\n');
  
  console.log('Option 2: Using DBeaver or pgAdmin\n');
  console.log('Connection string:');
  console.log(connectionString);
  console.log('\nThen execute the SQL file:\n');
  console.log(`psql "${connectionString}" -f "${sqlFile}"\n`);
}
