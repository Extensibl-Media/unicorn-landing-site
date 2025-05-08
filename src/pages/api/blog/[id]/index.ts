import { createAdminClient } from "@/lib/supabase/admin";
import type { Post } from "@/lib/supabase/blog";
import { createClient } from "@/lib/supabase/server";
import { checkIsadmin } from "@/lib/utils";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request, cookies, params }) => {
  // Get a post by ID (NOT slug, this is for admin only operations, use Supabase server client for fetching public post for builds)
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

  const { id } = params;

  const adminClient = createAdminClient();

  if (!id) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "ID is required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const { data, error } = await adminClient
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching post",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const PATCH: APIRoute = async ({ request, cookies, params }) => {
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

  const adminClient = createAdminClient();

  const { id } = params;

  if (!id) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "ID is required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const body: Partial<Post> = await request.json();

  if (!body) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Body is required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const { data, error } = await adminClient
      .from("posts")
      .update(body)
      .eq("id", id)
      .select("*");

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Post updated successfully",
        data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error updating post",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies, params }) => {
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

  const { id } = params;
  const adminClient = createAdminClient();

  if (!id) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "ID is required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  try {
    const { data, error } = await adminClient
      .from("posts")
      .delete()
      .eq("id", id)
      .select("*");

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Post deleted successfully",
        data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error deleting post",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
