#!/usr/bin/env node

/**
 * Database Setup - Auto Create Tables via Supabase
 * 
 * Usage: node scripts/auto-setup.js
 * 
 * This will automatically create tables via direct PostgreSQL connection
 */

require('dotenv').config();
const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE credentials in .env');
  process.exit(1);
}

console.log('🚀 Auto-Setting Up Database\n');

// SQL to execute
const setupSQL = `
BEGIN;

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

-- Insert sample categories
INSERT INTO public.categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Friends', '👥'),
  ('Travel', '✈️')
ON CONFLICT (name) DO NOTHING;

-- Insert sample photo
INSERT INTO public.photos (title, description, drive_id, image_url, category_id) 
VALUES (
  'Beautiful Sunset',
  'A stunning sunset over the mountains',
  '1example_id_1',
  'https://drive.google.com/uc?export=view&id=1example_id_1',
  (SELECT id FROM public.categories WHERE name = 'Nature' LIMIT 1)
)
ON CONFLICT DO NOTHING;

COMMIT;
`;

async function setupDatabase() {
  try {
    console.log('📊 Executing database setup SQL...\n');

    // Execute via Supabase RPC or direct endpoint
    const response = await executeSQL(setupSQL);

    console.log('✅ Database setup completed!\n');
    console.log('✓ Tables created');
    console.log('✓ Sample data inserted\n');
    console.log('🚀 Ready to start:\n');
    console.log('   npm start\n');

  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('getaddrinfo')) {
      console.error('❌ Connection error - Network issue\n');
    } else {
      console.error('❌ Setup error:', error.message, '\n');
    }

    console.log('📖 Alternative: Manual Setup\n');
    console.log('Run: npm run setup\n');
    process.exit(1);
  }
}

function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    try {
      // Try using Supabase REST API
      const url = new URL(SUPABASE_URL);
      const options = {
        hostname: url.hostname,
        path: '/rest/v1/rpc/exec_sql',
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      };

      const payload = JSON.stringify({ query: sql });

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            // RPC might not exist, show manual instructions
            throw new Error('Setup requires manual SQL execution');
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

setupDatabase();
