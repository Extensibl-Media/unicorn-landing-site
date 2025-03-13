import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";
import { checkIsadmin } from "@/lib/utils";

export const GET: APIRoute = async ({ request, cookies }) => {
  const serverClient = createClient({
    headers: request.headers,
    cookies,
  });
  checkIsadmin(serverClient);

  const adminClient = createAdminClient();

  const { data: clubs, error } = await adminClient
    .from("clubs")
    .select("id, name");
  if (error) {
    console.error("Error fetching clubs:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching clubs",
        details: error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return new Response(JSON.stringify({ success: true, clubs }), {
    headers: { "Content-Type": "application/json" },
  });
};
