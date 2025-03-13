import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { MIN_ADMIN_LEVEL } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

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
          message: "Club ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Parse the JSON body
    const clubData = await request.json();

    // Use the admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("clubs")
      .update({
        name: clubData.name,
        description: clubData.description,
        address: clubData.address,
        city: clubData.city,
        state: clubData.state,
        latitude: clubData.latitude,
        longitude: clubData.longitude,
        website_url: clubData.website_url,
        cover_image: clubData.cover_image,
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating club:", error);

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
        data: data[0],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error updating club:", error);

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

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
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
          message: "Club ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Use the admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.from("clubs").delete().eq("id", id);

    if (error) {
      console.error("Error deleting club:", error);

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
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error deleting club:", error);

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
