import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";
type LIBLink = Database["public"]["Tables"]["lib_links"]["Row"];

// export const GET: APIRoute = async ({ request }) => {};

export const POST: APIRoute = async ({ request }) => {
  const adminClient = createAdminClient();
  const body: Omit<LIBLink, "id"> = await request.json();
  console.log(body);

  try {
    const { data, error } = await adminClient
      .from("lib_links")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: (err as Error).message,
      }),
      { status: 500 },
    );
  }
};
