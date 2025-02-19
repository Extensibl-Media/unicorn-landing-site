import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from 'astro';
import type { Database } from '@/types/supabase';

export const createClient = (request: Request, cookies: AstroCookies) => {
  return createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key: string) {
          // Handle the combined auth token cookie
          if (key === 'sb-access-token' || key === 'sb-refresh-token') {
            const authCookie = cookies.get('sb-xbnnssknhufakdoahptv-auth-token')?.value;
            if (!authCookie) return null;

            try {
              const parsed = JSON.parse(decodeURIComponent(authCookie));
              if (key === 'sb-access-token') return parsed.access_token;
              if (key === 'sb-refresh-token') return parsed.refresh_token;
            } catch (e) {
              console.error('Error parsing auth cookie:', e);
              return null;
            }
          }
          return cookies.get(key)?.value;
        },
        set(key: string, value: string, options: CookieOptions) {
          cookies.set(key, value, options);
        },
        remove(key: string, options: CookieOptions) {
          cookies.delete(key, options);
        },
      },
    }
  );
};