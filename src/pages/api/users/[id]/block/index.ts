// src/pages/api/users/[id]/block.ts
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";

export const POST: APIRoute = async ({ params, request, cookies }) => {
  // Check authentication and admin permissions
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

    // Use admin client to invoke the edge function
    const supabaseAdmin = createAdminClient();

    // Call the edge function to handle the user deletion
    const { data, error: functionError } = await supabaseAdmin.functions.invoke(
      "block-user",
      {
        body: { userId: id },
      },
    );

    if (functionError) {
      console.error("Error calling block-user function:", functionError);
      return new Response(
        JSON.stringify({
          success: false,
          message: functionError.message || "Error blocking user",
          details: functionError,
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
        message: `User ${id} has been blocked and their data deleted`,
        data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error blocking user:", error);
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
