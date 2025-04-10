// src/pages/api/users/[id]/approve.ts
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";

export const POST: APIRoute = async ({ params, request, cookies }) => {
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
      },
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
      },
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
        },
      );
    }

    const { hideFromSearch } = await request.json();

    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        hide_from_search: hideFromSearch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Error updating user hidden status:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
          details: error,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
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
      },
    );
  } catch (error) {
    console.error("Unexpected error updating user hide status:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
