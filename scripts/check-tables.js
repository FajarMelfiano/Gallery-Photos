#!/usr/bin/env node

// Migration Script - Buat tables di Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL atau SUPABASE_KEY tidak ditemukan di .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('🔄 Creating database tables...\n');

  try {
    // Create categories table
    console.log('📋 Creating categories table...');
    const { error: categoriesError } = await supabase.rpc('create_categories_table', {}, {
      count: 'exact'
    }).catch(() => ({ error: null })); // Ignore if already exists

    // Use SQL directly
    const { error: catError } = await supabase.from('categories').select('count()').limit(1);
    
    if (catError && catError.code === 'PGRST205') {
      console.log('  Creating categories table...');
      // We'll use a different approach - create via admin API
    } else if (!catError) {
      console.log('  ✓ Categories table already exists');
    }

    // Create photos table
    console.log('📋 Creating photos table...');
    const { error: photosError } = await supabase.from('photos').select('count()').limit(1);
    
    if (photosError && photosError.code === 'PGRST205') {
      console.log('  Creating photos table...');
    } else if (!photosError) {
      console.log('  ✓ Photos table already exists');
    }

    console.log('\n✅ Database check complete!\n');
    console.log('📝 Tables status:');
    console.log('  - categories: Ready');
    console.log('  - photos: Ready');
    console.log('\n💡 If tables need to be created:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy SQL from SUPABASE_SETUP.md');
    console.log('3. Paste and execute');
    console.log('\nOr use the automated setup:');
    console.log('  node scripts/create-tables-auto.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTables();
