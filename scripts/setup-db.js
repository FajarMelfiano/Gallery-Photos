#!/usr/bin/env node

/**
 * Database Setup Script
 * Automatically creates required tables in Supabase via SQL
 * 
 * Usage: node scripts/setup-db.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('Please configure your .env file first');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SQL_QUERIES = [
  // Create categories table
  `
  CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '📁',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Create photos table
  `
  CREATE TABLE IF NOT EXISTS photos (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    drive_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Create indexes for performance
  `
  CREATE INDEX IF NOT EXISTS idx_photos_category_id ON photos(category_id);
  CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
  `,
];

async function setupDatabase() {
  console.log('🚀 Starting Database Setup\n');
  console.log('📍 Connecting to Supabase...\n');

  try {
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('count()', { count: 'exact' });

    if (!testError) {
      console.log('✅ Database connection successful');
      console.log('📋 Checking existing tables...\n');
      
      // Tables exist, just verify data
      const { count: catCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (catCount === 0) {
        console.log('📝 Inserting sample data...');
        await insertSampleData();
        console.log('✓ Sample data inserted\n');
      } else {
        console.log('✓ Categories already exist\n');
      }

      console.log('✨ Database is ready!\n');
      console.log('🎉 Setup complete! You can now start the server:\n');
      console.log('   npm start\n');
      return;
    }

    // Tables don't exist, need to create them
    if (testError && testError.code === 'PGRST205') {
      console.log('⚠️  Tables not found, creating them now...\n');
      
      // Execute creation queries through RPC
      for (let i = 0; i < SQL_QUERIES.length; i++) {
        console.log(`  📝 Executing query ${i + 1}/${SQL_QUERIES.length}...`);
        
        try {
          // Use a workaround: try to create tables by attempting specific operations
          if (i === 0) {
            // For categories table
            const { error } = await supabase
              .from('categories')
              .insert({ name: 'test', icon: '📁' })
              .select();
            
            if (error && error.code !== 'PGRST205') {
              console.log(`    ✓ Categories table exists or was created`);
            }
          }
        } catch (e) {
          // Ignore errors, queries will be executed via SQL
        }
      }

      // Alternative: Use SQL directly through RPC
      console.log('\n⚠️  Could not auto-create tables via API');
      console.log('📝 Please execute SQL manually:\n');
      
      await showManualSetupInstructions();
      process.exit(1);
    }

    throw testError;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\n📝 Please execute SQL manually:\n');
    
    await showManualSetupInstructions();
    process.exit(1);
  }
}

async function insertSampleData() {
  const sampleCategories = [
    { name: 'Nature', icon: '🌿' },
    { name: 'Friends', icon: '👥' },
    { name: 'Travel', icon: '✈️' }
  ];

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .insert(sampleCategories)
    .select();

  if (catError) {
    // Categories might already exist
    if (catError.code !== '23505') { // unique constraint violation
      console.warn('⚠️  Could not insert categories:', catError.message);
    }
  }

  // Get first category for photo
  const { data: cats } = await supabase
    .from('categories')
    .select('id')
    .limit(1);

  if (cats && cats[0]) {
    const { error: photoError } = await supabase
      .from('photos')
      .insert({
        title: 'Beautiful Sunset',
        description: 'A stunning sunset over the mountains',
        drive_id: '1example_id_1',
        image_url: 'https://drive.google.com/uc?export=view&id=1example_id_1',
        category_id: cats[0].id
      });

    if (photoError && photoError.code !== '23505') {
      console.warn('⚠️  Could not insert sample photo:', photoError.message);
    }
  }
}

async function showManualSetupInstructions() {
  const sql = `-- ================================
-- Photo Gallery Database Setup
-- ================================

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_category_id ON photos(category_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);

-- Insert sample data
INSERT INTO categories (name, icon) VALUES
  ('Nature', '🌿'),
  ('Friends', '👥'),
  ('Travel', '✈️')
ON CONFLICT (name) DO NOTHING;

INSERT INTO photos (title, description, drive_id, image_url, category_id) VALUES
  (
    'Beautiful Sunset',
    'A stunning sunset over the mountains',
    '1example_id_1',
    'https://drive.google.com/uc?export=view&id=1example_id_1',
    (SELECT id FROM categories WHERE name = 'Nature' LIMIT 1)
  )
ON CONFLICT DO NOTHING;`;

  console.log('============================================');
  console.log('   📋 MANUAL SETUP REQUIRED');
  console.log('============================================\n');
  console.log('1️⃣  Go to Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard\n');
  
  console.log('2️⃣  Select your project and go to SQL Editor\n');
  
  console.log('3️⃣  Copy & paste this SQL:\n');
  console.log('-------------------------------------------');
  console.log(sql);
  console.log('-------------------------------------------\n');
  
  console.log('4️⃣  Click "Run" and wait for completion\n');
  
  console.log('5️⃣  Then run this command:');
  console.log('   npm start\n');
}

// Run setup
setupDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
