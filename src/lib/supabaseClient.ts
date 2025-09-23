import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast to surface misconfiguration during development
  // eslint-disable-next-line no-console
  console.error('❌ Supabase env vars missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  console.error('Current values:', { 
    VITE_SUPABASE_URL: supabaseUrl ? '✅ Set' : '❌ Missing', 
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '✅ Set' : '❌ Missing' 
  });
} else {
  console.log('✅ Supabase client initialized successfully');
  console.log('Supabase URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
