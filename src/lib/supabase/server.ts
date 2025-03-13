import {
  createServerClient,
  parseCookieHeader,
  type CookieOptionsWithName,
} from "@supabase/ssr";
import type { AstroCookies } from "astro";
import type { Database } from "@/types/supabase";
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "astro:env/client";

export const cookieOptions: CookieOptionsWithName = {
  // Don't hardcode the cookie name as it can change with project ID
  path: "/",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const createClient = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabase = createServerClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false, // Important: keep this as false for SSR
        autoRefreshToken: false, // Don't auto-refresh on server
        flowType: "pkce",
      },
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  return supabase;
};
