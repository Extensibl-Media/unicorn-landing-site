import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";
type LIBLink = Database["public"]["Tables"]["lib_links"]["Row"];

// export const GET: APIRoute = async ({ request }) => {
//   // TODO: Get Link Details
// };

export const PATCH: APIRoute = async ({ request }) => {
  const adminClient = createAdminClient();
  const body: Partial<LIBLink> = await request.json();

  if (!body.id) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "ID is required",
      }),
      { status: 400 },
    );
  }
  console.log(body);
  try {
    const { data, error } = await adminClient
      .from("lib_links")
      .update(body)
      .eq("id", body.id)
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
    console.log(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: (err as Error).message,
      }),
      { status: 500 },
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
      { status: 400 },
    );
  }

  try {
    const { data, error } = await adminClient
      .from("lib_links")
      .delete()
      .eq("id", +id)
      .select()
      .single();

    console.log({ data, error });
    if (error) throw error;
    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
    );
  } catch (err) {
    console.log(err);
    return new Response(
      JSON.stringify({
        success: false,
        error: (err as Error).message,
      }),
      { status: 500 },
    );
  }
};
