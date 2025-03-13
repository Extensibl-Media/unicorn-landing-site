// src/pages/api/users/[id]/uploads/delete.ts
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";
import { checkIsadmin } from "@/lib/utils";

export const POST: APIRoute = async ({ params, request, cookies }) => {
  // Check authentication and admin permissions
  const serverClient = createClient({
    headers: request.headers,
    cookies,
  });
  checkIsadmin(serverClient);

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
    const { url, index } = await request.json();

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
          message: "User has no uploads to delete",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Remove the URL from the array
    const updatedUploads = userData.user_uploads.filter((item) => item !== url);

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

    // Try to delete the file from storage, but don't fail if this doesn't work
    try {
      // Extract the path from the URL
      const BASE_IMAGE_URL =
        "https://api.unicornlanding.com/storage/v1/object/public/profile_uploads/";
      let filePath = url.replace(BASE_IMAGE_URL, "");
      // Remove any double slashes and ensure proper formatting
      filePath = filePath.replace("//", "/");

      const { error: storageError } = await supabaseAdmin.storage
        .from("profile_uploads")
        .remove([filePath]);

      if (storageError) {
        console.warn(
          "Warning: Could not delete file from storage:",
          storageError,
        );
        // Continue anyway because we've already updated the profile
      }
    } catch (storageErr) {
      console.warn("Warning: Error accessing storage:", storageErr);
      // Continue anyway
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Upload deleted successfully",
        data: updateData?.[0] || null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error deleting upload:", error);
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
