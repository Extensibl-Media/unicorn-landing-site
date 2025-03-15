import { createClient } from "@/lib/supabase/server";
import type { APIRoute } from "astro";

interface NotificationPayload {
  user_id: string;
  title: string;
  body?: string;
  path?: string;
  data?: Record<string, any>;
}
export const POST: APIRoute = async ({ request, cookies }) => {
  const serverClient = createClient({ headers: request.headers, cookies });

  const { title, message, user_id } = await request.json();

  const payload: NotificationPayload = {
    title,
    body: message,
    user_id,
  };

  try {
    const { data, error } = await serverClient.functions.invoke(
      "send-push-notification",
      {
        body: payload,
        method: "POST",
      },
    );

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Error creating notification",
        details: error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
