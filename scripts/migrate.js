#!/usr/bin/env node

/**
 * Database Migration Script
 * Creates required tables in Supabase PostgreSQL
 * 
 * Usage: node scripts/migrate.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Check if tables exist
    console.log('📋 Checking existing tables...');
    
    let categoriesExists = false;
    let photosExists = false;

    // Check categories table
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1);
      
      categoriesExists = !error || error.code !== 'PGRST205';
    } catch (e) {
      categoriesExists = false;
    }

    // Check photos table
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .limit(1);
      
      photosExists = !error || error.code !== 'PGRST205';
    } catch (e) {
      photosExists = false;
    }

    console.log(`  Categories table: ${categoriesExists ? '✓ exists' : '✗ missing'}`);
    console.log(`  Photos table: ${photosExists ? '✓ exists' : '✗ missing'}\n`);

    if (categoriesExists && photosExists) {
      console.log('✅ All tables already exist!\n');
      
      // Insert sample data if tables are empty
      const { count: catCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });
      
      if (catCount === 0) {
        console.log('📝 Inserting sample data...');
        
        const { error: insertCatError } = await supabase
          .from('categories')
          .insert([
            { name: 'Nature', icon: '🌿' },
            { name: 'Friends', icon: '👥' },
            { name: 'Travel', icon: '✈️' }
          ]);

        if (insertCatError) throw insertCatError;
        console.log('  ✓ Sample categories inserted');
      }

      console.log('\n✨ Database is ready!');
      return;
    }

    console.log('❌ Tables not found. Please create them manually:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to: SQL Editor');
    console.log('4. Run this SQL:\n');

    const sql = `
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📁',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  drive_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Friends', '👥'),
  ('Travel', '✈️');

-- Insert sample photo
INSERT INTO photos (title, description, drive_id, image_url, category_id) VALUES
  (
    'Beautiful Sunset',
    'A stunning sunset over the mountains',
    '1example_id_1',
    'https://drive.google.com/uc?export=view&id=1example_id_1',
    1
  );
`;

    console.log(sql);
    console.log('\n5. After creating tables, restart the server with: npm start\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrate();
