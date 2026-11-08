import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://nhvokxemyaymmqruzpcp.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_2bemSl2AdJoqeJxc1E2gug_kotWGPTq'
);
export const bucket = 'site-images';
