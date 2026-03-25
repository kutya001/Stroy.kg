import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vgprqqteshufadlxqnpx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'; // Assuming actual key was provided but obscured in logs, using 'your-anon-key' from .env.local

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
