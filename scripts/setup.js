#!/usr/bin/env node

/**
 * Complete Setup Script for Photo Gallery
 * 
 * Usage: npm run setup
 * 
 * This script:
 * 1. Checks .env configuration
 * 2. Tests Supabase connection
 * 3. Creates tables if needed
 * 4. Inserts sample data
 * 5. Shows setup summary
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(`
╔════════════════════════════════════════════════════════════╗
║          📸 Photo Gallery - Setup Wizard                   ║
╚════════════════════════════════════════════════════════════╝
`);

let setupComplete = false;

async function runSetup() {
  try {
    // Step 1: Check .env
    console.log('📋 Step 1: Checking configuration...\n');
    if (!SUPABASE_URL || !SERVICE_KEY) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    }
    console.log('  ✓ SUPABASE_URL configured');
    console.log('  ✓ SUPABASE_SERVICE_ROLE_KEY configured\n');

    // Step 2: Test connection
    console.log('📋 Step 2: Testing Supabase connection...\n');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    
    const { data: pingData, error: pingError } = await supabase
      .from('categories')
      .select('count()', { count: 'exact' })
      .limit(1);

    if (pingError && pingError.code === 'PGRST205') {
      console.log('  ⚠️  Tables not found (this is expected on first setup)\n');
    } else if (pingError) {
      throw pingError;
    } else {
      console.log('  ✓ Connection successful\n');
    }

    // Step 3: Create tables
    console.log('📋 Step 3: Setting up database tables...\n');
    
    await createTables(supabase);
    console.log('  ✓ Tables ready\n');

    // Step 4: Insert sample data
    console.log('📋 Step 4: Loading sample data...\n');
    
    await loadSampleData(supabase);
    console.log('  ✓ Sample data loaded\n');

    // Success!
    setupComplete = true;
    showSummary();

  } catch (error) {
    console.error('\n❌ Setup Error:', error.message);
    console.log('\n' + '='.repeat(60));
    console.log('MANUAL SETUP REQUIRED');
    console.log('='.repeat(60) + '\n');
    showManualSetupGuide();
    process.exit(1);
  }
}

async function createTables(supabase) {
  // Check if tables exist
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('count()', { count: 'exact' })
    .limit(1);

  const { data: photoData, error: photoError } = await supabase
    .from('photos')
    .select('count()', { count: 'exact' })
    .limit(1);

  const categoriesExist = !catError || catError.code !== 'PGRST205';
  const photosExist = !photoError || photoError.code !== 'PGRST205';

  if (categoriesExist && photosExist) {
    console.log('  Tables already exist');
    return;
  }

  console.log('  Creating tables...');

  // Since direct SQL execution via SDK is limited, we provide the SQL
  if (!categoriesExist || !photosExist) {
    showTableCreationSQL();
    throw new Error('Please execute SQL manually to create tables');
  }
}

async function loadSampleData(supabase) {
  // Check if data exists
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  if (count > 0) {
    console.log('  Sample data already exists');
    return;
  }

  console.log('  Inserting sample data...');

  // Insert categories
  const { error: catError } = await supabase
    .from('categories')
    .insert([
      { name: 'Nature', icon: '🌿' },
      { name: 'Friends', icon: '👥' },
      { name: 'Travel', icon: '✈️' }
    ]);

  if (catError) {
    throw catError;
  }

  // Insert sample photo
  const { data: categories } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Nature')
    .limit(1);

  if (categories && categories[0]) {
    const { error: photoError } = await supabase
      .from('photos')
      .insert({
        title: 'Beautiful Sunset',
        description: 'A stunning sunset over the mountains',
        drive_id: '1example_id_1',
        image_url: 'https://drive.google.com/uc?export=view&id=1example_id_1',
        category_id: categories[0].id
      });

    if (photoError && photoError.code !== '23505') {
      console.warn('  ⚠️  Could not insert photo:', photoError.message);
    }
  }
}

function showTableCreationSQL() {
  const sql = `-- ✨ Photo Gallery Database Setup

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_photos_category_id ON photos(category_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- Insert sample data
INSERT INTO categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Friends', '👥'),
  ('Travel', '✈️')
ON CONFLICT (name) DO NOTHING;

INSERT INTO photos (title, description, drive_id, image_url, category_id) 
SELECT 
  'Beautiful Sunset',
  'A stunning sunset over the mountains',
  '1example_id_1',
  'https://drive.google.com/uc?export=view&id=1example_id_1',
  id
FROM categories 
WHERE name = 'Nature' 
LIMIT 1
ON CONFLICT DO NOTHING;`;

  console.log('\n' + '-'.repeat(60));
  console.log('SQL TO EXECUTE IN SUPABASE DASHBOARD:');
  console.log('-'.repeat(60) + '\n');
  console.log(sql);
  console.log('\n' + '-'.repeat(60) + '\n');
}

function showManualSetupGuide() {
  console.log(`
📖 MANUAL SETUP INSTRUCTIONS:

1️⃣  Go to Supabase Dashboard:
   https://supabase.com/dashboard

2️⃣  Select Your Project:
   Project ID: ${SUPABASE_URL?.split('.')[0].split('//')[1] || 'YOUR_PROJECT'}

3️⃣  Open SQL Editor:
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

4️⃣  Copy & Execute SQL:
   ${' '.repeat(3)}Copy the SQL shown above and paste into editor
   ${' '.repeat(3)}Click "Run" button

5️⃣  Run Setup Again:
   npm run setup

6️⃣  If Still Issues:
   Check .env file has correct SUPABASE credentials

`);
}

function showSummary() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║               ✅ SETUP COMPLETE!                          ║
╚════════════════════════════════════════════════════════════╝

📊 Setup Summary:
  ✓ Configuration verified
  ✓ Supabase connection successful
  ✓ Database tables ready
  ✓ Sample data loaded

📋 Tables Created:
  ✓ categories (3 sample items)
  ✓ photos (1 sample item)

🎯 Next Steps:
  1. Start server:  npm start
  2. Open browser:  http://localhost:5000
  3. Admin panel:   http://localhost:5000/admin
  4. Login:         admin / admin123

🎉 Enjoy your photo gallery!

`);
}

// Run the setup
runSetup();
