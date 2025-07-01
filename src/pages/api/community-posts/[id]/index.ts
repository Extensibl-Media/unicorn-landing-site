import { createAdminClient } from "@/lib/supabase/admin";
import type { CommunityPost } from "@/lib/supabase/community-posts";
import type { APIRoute } from "astro";

export const PATCH: APIRoute = async ({ request }) => {
  const adminClient = createAdminClient();

  const body: Partial<CommunityPost> = await request.json();
  console.log(body);

  try {
    const { data, error } = await adminClient
      .from("community_posts")
      .update(body)
      .eq("id", body.id)
      .select()
      .single();

    if (error) throw error;
    return new Response(
      JSON.stringify({
        success: true,
        data,
      })
    );
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: (err as Error).message,
      }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const adminClient = createAdminClient();
  const id = params.id;

  if (!id) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "ID is required",
      }),
      { status: 400 }
    );
  }

  try {
    const { data, error } = await adminClient
      .from("community_posts")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return new Response(
      JSON.stringify({
        success: true,
        data,
      })
    );
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: (err as Error).message,
      }),
      { status: 500 }
    );
  }
};
