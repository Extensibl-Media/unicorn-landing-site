import { corsHeaders } from "@/lib/consts";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Post } from "@/lib/supabase/blog";
import type { APIRoute } from "astro";

export const GET = async () => {
  // TODO: List all posts
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const headers = new Headers(corsHeaders);
  headers.append("Content-Type", "application/json");
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
  const body: Post = await request.json();
  try {
    const { data, error } = await adminClient
      .from("posts")
      .insert(body)
      .select("*")
      .single();

    if (error) throw error;

    console.log({ data, error });
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers,
      },
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        message: (err as Error).message,
      }),
      {
        status: 500,
        headers,
      },
    );
  }
};

export async function OPTIONS() {
  // Return a response with CORS headers
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
