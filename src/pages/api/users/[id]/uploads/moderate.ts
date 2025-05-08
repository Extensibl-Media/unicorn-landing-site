// src/pages/api/users/[id]/uploads/moderate.ts
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

    // Moderation image to replace with
    const moderationImageUrl = MODERATION_IMAGE_URL; // Your moderation image path

    // First, get the current user_uploads array
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("user_uploads")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching user uploads:", fetchError);
      return new Response(
        JSON.stringify({
          success: false,
          message: fetchError.message,
          details: fetchError,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if user_uploads exists and is an array
    if (!userData.user_uploads || !Array.isArray(userData.user_uploads)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User has no uploads to moderate",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Replace the URL in the array
    const updatedUploads = [...userData.user_uploads];
    const urlIndex = updatedUploads.findIndex((item) => item === url);

    if (urlIndex === -1) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "URL not found in user uploads",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    updatedUploads[urlIndex] = moderationImageUrl;

    // Update the user's profile
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        user_uploads: updatedUploads,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (updateError) {
      console.error("Error updating user uploads:", updateError);
      return new Response(
        JSON.stringify({
          success: false,
          message: updateError.message,
          details: updateError,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Note: We don't delete the original file from storage, just replace the reference

    return new Response(
      JSON.stringify({
        success: true,
        message: "Upload moderated successfully",
        data: updateData?.[0] || null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error moderating upload:", error);
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
