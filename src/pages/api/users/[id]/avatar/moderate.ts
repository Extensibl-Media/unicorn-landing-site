// src/pages/api/users/[id]/avatar/moderate.ts
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";
import { checkIsadmin } from "@/lib/utils";
import { MODERATION_IMAGE_URL } from "@/lib/consts";

export const POST: APIRoute = async ({ params, request, cookies }) => {
  // const userLevel = request.headers.get("x-user-level");
  // if (!userLevel) throw new Error("No user level provided");
  // if (parseInt(userLevel) < 1000) {
  //   return new Response(
  //     JSON.stringify({
  //       success: false,
  //       error: "Unauthorized",
  //     }),
  //     {
  //       headers: { "Content-Type": "application/json" },
  //       status: 401,
  //     },
  //   );
  // }

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

    // Parse the JSON body
    const { url } = await request.json();

    if (!url) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "URL is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Use the admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    // Replace the avatar_url with a moderation image
    const moderationImageUrl = MODERATION_IMAGE_URL; // Your moderation image path

    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .update({
        avatar_url: moderationImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (userError) {
      console.error("Error updating user avatar:", userError);
      return new Response(
        JSON.stringify({
          success: false,
          message: userError.message,
          details: userError,
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
        message: "Avatar moderated successfully",
        data: userData?.[0] || null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error moderating avatar:", error);
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
