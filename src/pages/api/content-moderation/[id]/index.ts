import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";
import { checkIsadmin } from "@/lib/utils";
import { MODERATION_IMAGE_URL } from "@/lib/consts";

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const serverClient = createClient({
    headers: request.headers,
    cookies,
  });

  // Check admin permissions using your pattern
  try {
    checkIsadmin(serverClient);
  } catch (error) {
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
    const idAsNum = Number(id);

    const { status, imageType, url, userId, fromProfile } =
      await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Submission ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const supabaseAdmin = createAdminClient();

    const updateProfile = async (id: string, updates: Record<string, any>) => {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw new Error(error.message);
      return { success: true };
    };

    const getUserUploads = async (id: string) => {
      const { data: userData, error } = await supabaseAdmin
        .from("profiles")
        .select("user_uploads")
        .eq("id", id)
        .single();

      if (!userData || error)
        throw new Error(error?.message || "User not found");
      return userData.user_uploads || [];
    };

    const moderationImageUrl = MODERATION_IMAGE_URL;

    switch (status) {
      case "APPROVED":
        break;

      case "REJECTED": {
        if (imageType === "AVATAR") {
          await updateProfile(userId, { avatar_url: moderationImageUrl });
        } else {
          const uploads = await getUserUploads(userId);
          const urlIndex = uploads.findIndex((item) => item === url);

          if (urlIndex === -1) throw new Error("URL not found in user uploads");

          uploads[urlIndex] = moderationImageUrl;
          await updateProfile(userId, { user_uploads: uploads });
        }
        break;
      }

      case "DELETED": {
        if (imageType === "AVATAR") {
          await updateProfile(userId, { avatar_url: moderationImageUrl });
        }
        const uploads = await getUserUploads(userId);

        if (!Array.isArray(uploads))
          throw new Error("User has no uploads to delete");

        const updatedUploads = uploads.filter((item) => item !== url);
        await updateProfile(userId, { user_uploads: updatedUploads });
        break;
      }

      default:
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid status",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
    }

    const { error } = await supabaseAdmin
      .from("content_moderation_images")
      .update({ status })
      .eq("id", idAsNum);

    if (error) {
      throw new Error(error.message);
    }

    const { data: updatedProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: uploadsData } = await supabaseAdmin
      .from("content_moderation_images")
      .select()
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({
        success: true,
        data: { profile: updatedProfile, uploads: uploadsData },
        message: "Content moderation updated successfully",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error updating content moderation:", error);

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
