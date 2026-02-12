/**
 * Supabase Client Configuration
 *
 * Initializes the Supabase client for browser-side usage.
 * This client is used for:
 * - Database queries (via RLS policies)
 * - Real-time subscriptions (future)
 * - Guest-based access (no auth required)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please add it to your .env.local file.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please add it to your .env.local file.'
  );
}

/**
 * Supabase client instance for browser-side usage
 *
 * @example
 * import { supabase } from '@/utils/supabase/client';
 *
 * const { data, error } = await supabase
 *   .from('rooms')
 *   .select('*')
 *   .eq('room_code', 'ABC123')
 *   .single();
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We use guest mode, no session needed
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'lotogame'
    }
  }
});

/**
 * Test connection to Supabase
 * Useful for health checks and debugging
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('rooms').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
