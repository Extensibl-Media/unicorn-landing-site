import { corsHeaders } from "@/lib/consts";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Podcast } from "@/lib/supabase/podcasts";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const adminClient = createAdminClient();

  const body: Podcast = await request.json();

  try {
    const { data, error } = await adminClient
      .from("podcast_links")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

export const GET: APIRoute = async ({ request }) => {
  // TODO: List all podcasts
};
