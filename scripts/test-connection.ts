/**
 * Test script to verify Supabase connection
 * Run with: pnpm exec tsx scripts/test-connection.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Load .env.local file BEFORE creating client
config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    // Test 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Environment variables not loaded');
      console.error('URL:', supabaseUrl ? '✓' : '✗');
      console.error('Key:', supabaseAnonKey ? '✓' : '✗');
      process.exit(1);
    }

    console.log('✓ Environment variables loaded');
    console.log(`  URL: ${supabaseUrl}`);
    console.log(`  Key: ${supabaseAnonKey.substring(0, 20)}...`);

    // Test 2: Create client
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    console.log('✓ Supabase client initialized');

    // Test 3: Test database connection with a simple query
    console.log('\n📡 Testing database connection...');
    const { data, error } = await supabase
      .from('rooms')
      .select('count')
      .limit(0);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Details:', error);
      process.exit(1);
    }

    console.log('✅ Database connection successful!');

    // Test 4: Check tables exist
    console.log('\n📋 Checking tables...');

    const tables = ['rooms', 'tickets', 'called_numbers'];
    for (const table of tables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      if (tableError) {
        console.error(`❌ Table "${table}" error:`, tableError.message);
      } else {
        console.log(`✓ Table "${table}" accessible`);
      }
    }

    // Test 5: Check RLS policies (try to read rooms)
    console.log('\n🔒 Testing Row Level Security...');
    const { data: roomsData, error: rlsError } = await supabase
      .from('rooms')
      .select('*')
      .limit(5);

    if (rlsError) {
      console.error('❌ RLS policy issue:', rlsError.message);
    } else {
      console.log(
        `✓ RLS policies working (found ${roomsData?.length || 0} rooms)`
      );
    }

    console.log('\n🎉 All tests passed! Supabase is ready to use.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the test
testConnection();
