// browser.ts - Update this file
import { createBrowserClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
} from "astro:env/client";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const createClient = () => {
  return createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      cookieOptions,
    },
  );
};
