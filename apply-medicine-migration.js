/**
 * Apply Medicine Migration
 * Usage: node apply-medicine-migration.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;

if (!SUPABASE_DB_URL) {
  console.error('❌ SUPABASE_DB_URL not found in environment variables');
  console.error('Add to your .env file');
  process.exit(1);
}

async function applyMigration() {
  console.log('\n🚀 Applying Medicine Migration (031_medicine_schema_updates.sql)');
  console.log('='.repeat(60));
  
  const client = new Client({ connectionString: SUPABASE_DB_URL });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase');
    
    const migrationPath = path.join(__dirname, 'supabase/migrations/031_medicine_schema_updates.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Executing migration...');
    await client.query(sql);
    
    console.log('✅ Migration applied successfully!');
    console.log('\n✨ medicine_reminders table updated with:');
    console.log('   - time_of_day column (TEXT[])');
    console.log('   - created_by column (UUID)');
    console.log('\n✨ medicine_administration_logs table created with:');
    console.log('   - All required columns including school_id');
    console.log('   - Indexes for performance');
    console.log('   - RLS policies for security');
    console.log('\n🎉 You can now restart your app to use the medicine features!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();


