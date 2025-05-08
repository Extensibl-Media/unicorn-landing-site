import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";

type LIBLink = Database["public"]["Tables"]["lib_links"]["Row"];
type OrderUpdate = { id: number; order: number };

export const POST: APIRoute = async ({ request }) => {
  const adminClient = createAdminClient();

  try {
    // Parse the request body as an array of order updates
    const updates: OrderUpdate[] = await request.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request body. Expected array of order updates.",
        }),
        { status: 400 },
      );
    }

    // Validate each update has required fields
    const invalidUpdates = updates.filter(
      (update) =>
        typeof update.id !== "number" || typeof update.order !== "number",
    );

    if (invalidUpdates.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Each update must have numeric id and order fields.",
        }),
        { status: 400 },
      );
    }

    // Process each update individually with a where clause
    const results = [];

    for (const update of updates) {
      const { id, order } = update;

      const { data, error } = await adminClient
        .from("lib_links")
        .update({ order })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Failed to update link with ID ${id}:`, error);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to update link with ID ${id}: ${error.message}`,
          }),
          { status: 500 },
        );
      }

      results.push(data);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: results,
      }),
    );
  } catch (err) {
    console.error("Error reordering links:", err);

    return new Response(
      JSON.stringify({
        success: false,
        error: (err as Error).message,
      }),
      { status: 500 },
    );
  }
};
