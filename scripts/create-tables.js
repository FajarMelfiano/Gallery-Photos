#!/usr/bin/env node

/**
 * AUTO CREATE TABLES - Execute SQL Directly in Supabase
 * 
 * Usage: node scripts/create-tables.js
 * 
 * This will:
 * 1. Connect to Supabase PostgreSQL
 * 2. Create tables automatically
 * 3. Insert sample data
 */

const pg = require('pg');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Extract connection details from Supabase
const url = new URL(SUPABASE_URL);
const projectId = url.hostname.split('.')[0];
const host = `db.${projectId}.supabase.co`;

console.log('\n🚀 Creating Database Tables\n');
console.log(`📍 Host: ${host}\n`);

// Create connection string using Service Role Key as password
const connectionString = `postgresql://postgres:${SERVICE_KEY}@${host}:5432/postgres?sslmode=require`;

const pool = new pg.Pool({
  connectionString: connectionString,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const SQL_QUERIES = [
  // Create categories table
  `CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📁',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // Create photos table
  `CREATE TABLE IF NOT EXISTS public.photos (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    drive_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category_id BIGINT NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_photos_category_id ON public.photos(category_id);`,
  `CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at DESC);`,

  // Insert sample categories
  `INSERT INTO public.categories (name, icon) VALUES
    ('Nature', '🌿'),
    ('Friends', '👥'),
    ('Travel', '✈️')
  ON CONFLICT (name) DO NOTHING;`,

  // Insert sample photo
  `INSERT INTO public.photos (title, description, drive_id, image_url, category_id) 
  VALUES (
    'Beautiful Sunset',
    'A stunning sunset over the mountains',
    '1example_id_1',
    'https://drive.google.com/uc?export=view&id=1example_id_1',
    (SELECT id FROM public.categories WHERE name = 'Nature' LIMIT 1)
  )
  ON CONFLICT DO NOTHING;`
];

async function createTables() {
  let client;
  
  try {
    client = await pool.connect();
    console.log('✓ Connected to Supabase PostgreSQL\n');

    // Execute each query
    for (let i = 0; i < SQL_QUERIES.length; i++) {
      const query = SQL_QUERIES[i];
      console.log(`⏳ Executing query ${i + 1}/${SQL_QUERIES.length}...`);
      
      try {
        await client.query(query);
        console.log(`   ✅ Done\n`);
      } catch (err) {
        if (err.code === '42P07') {
          // Table already exists
          console.log(`   ℹ️  Already exists\n`);
        } else {
          throw err;
        }
      }
    }

    console.log('═'.repeat(60));
    console.log('   ✅ DATABASE SETUP COMPLETE!');
    console.log('═'.repeat(60) + '\n');

    console.log('✓ Tables created:');
    console.log('  - categories');
    console.log('  - photos\n');

    console.log('✓ Sample data inserted:');
    console.log('  - 3 categories (Nature, Friends, Travel)');
    console.log('  - 1 sample photo\n');

    console.log('✓ Indexes created for better performance\n');

    console.log('🚀 Ready to start server:\n');
    console.log('   npm start\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused');
      console.error('Check: SUPABASE_URL and SERVICE_KEY are correct\n');
    } else if (error.message.includes('FATAL')) {
      console.error('\n⚠️  Authentication failed');
      console.error('Check: SUPABASE_SERVICE_ROLE_KEY is correct\n');
    }

    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

createTables();
