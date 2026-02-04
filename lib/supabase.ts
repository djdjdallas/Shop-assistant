import { createClient } from '@supabase/supabase-js';

// NOTE: In a real Next.js app, these would be process.env.NEXT_PUBLIC_SUPABASE_URL
// For this frontend demo, we are mocking the service calls, but this setup is ready.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);