// src/pages/api/users/[id]/approve.ts
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";

type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  profile_type: "COUPLE" | "UNICORN" | null;
  looking_for: "COUPLE" | "UNICORN" | null;
  birthday: string | null;
  age: number | null;
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  location: string | null;
  personality_style: string[] | null;
  bio: string | null;
  ideal_match: string | null;
  interested_in: ("UNICORNS" | "COUPLES" | "FRIENDS")[] | null;
  verified: boolean;
  featured_user: boolean;
  featured_expiry: string | null;
  premium_user: boolean;
  approved: boolean;
  latitude: number | null;
  longitude: number | null;
  hide_from_search: boolean;
  created_at: string;
  user_uploads: string[] | null;
};

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const serverClient = createClient({
    headers: request.headers,
    cookies,
  });

  const {
    data: { session },
    error,
  } = await serverClient.auth.getSession();

  if (!session || error) {
    console.error("Error getting session:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error getting session",
        details: error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const isAdmin =
    session.user?.app_metadata?.claims_admin === true ||
    (session.user?.app_metadata?.user_level &&
      session.user.app_metadata.user_level >= MIN_ADMIN_LEVEL);

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Permission Denied",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const id = params.id;
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse the JSON body
    const { profile }: { profile: Profile } = await request.json();

    // Use the admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        ...profile,
        // Add a timestamp for when approval status was changed
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating user approval status:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
          details: error,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error updating user approval:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
