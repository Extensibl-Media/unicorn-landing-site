import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { PUBLIC_SUPABASE_URL } from "astro:env/client";
import { SUPABASE_SERVICE_ROLE_KEY } from "astro:env/server";

/**
 * Creates a Supabase admin client that always bypasses RLS
 * This client should only be used for admin operations on the server
 * It's separate from the SSR client to avoid session cookie interference
 */
export const createAdminClient = () => {
  return createClient<Database>(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
