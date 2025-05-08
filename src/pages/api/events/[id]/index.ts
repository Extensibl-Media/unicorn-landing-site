import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";
import { checkIsadmin } from "@/lib/utils";

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
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

  try {
    const id = params.id;
    const idAsNum = Number(id);

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Event ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Parse the JSON body
    const eventData = await request.json();

    // Use the admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("events")
      .update({
        name: eventData.name,
        club_id: eventData.club_id,
        description: eventData.description,
        date: eventData.date,
        address: eventData.address,
        city: eventData.city,
        state: eventData.state,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        cover_image: eventData.cover_image,
        parking_details: eventData.parking_details,
        additional_info: eventData.additional_info,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        all_day: eventData.all_day,
        sponsored_event: eventData.sponsored_event,
      })
      .eq("id", idAsNum)
      .select();

    if (error) {
      console.error("Error updating event:", error);

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
    console.error("Unexpected error updating event:", error);

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

  try {
    const id = params.id;
    const idAsNum = Number(id);

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Event ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Use the admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
      .from("events")
      .delete()
      .eq("id", idAsNum);

    if (error) {
      console.error("Error deleting event:", error);

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
    console.error("Unexpected error deleting event:", error);

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
