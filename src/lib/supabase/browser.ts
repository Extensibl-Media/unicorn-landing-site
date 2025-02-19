import { createBrowserClient } from "@supabase/ssr";
import type { Database } from '@/types/supabase';

export const createClient = () => {
  return createBrowserClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        name: 'sb-xbnnssknhufakdoahptv-auth-token',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        domain: '',
        path: '/',
        sameSite: 'lax'
      }
    }
  );
};