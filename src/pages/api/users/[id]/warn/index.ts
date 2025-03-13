import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";

export const POST: APIRoute = async ({ params, request, cookies }) => {
  // Check authentication and admin permissions
  const serverClient = createClient({
    headers: request.headers,
    cookies,
  });

  const {
    data: { session },
    error,
  } = await serverClient.auth.getSession();

  if (!session || error) {
    console.error("Error getting session:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error getting session",
        details: error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const isAdmin =
    session.user?.app_metadata?.claims_admin === true ||
    (session.user?.app_metadata?.user_level &&
      session.user.app_metadata.user_level >= MIN_ADMIN_LEVEL);

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Permission Denied",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const id = params.id;
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Parse the JSON body
    const { subject, message, reportId } = await request.json();

    if (!subject || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Subject and message are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Use the admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    // First get the user's email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, username")
      .eq("id", id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({
          success: false,
          message: profileError.message,
          details: profileError,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!profile.email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User does not have an email address",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const { error: warningError } = await supabaseAdmin
      .from("user_warnings")
      .insert({
        user_id: id,
        report_id: reportId,
      })
      .select();

    if (warningError) {
      console.error("Error logging warning:", warningError);
      // Continue anyway to try sending the email
    }

    // Send the email
    const { error: emailError } = await supabaseAdmin.functions.invoke(
      "send-email",
      {
        body: {
          to: profile.email,
          subject: subject,
          html: `
          <h1>Unicorn Landing Support</h1>
          <p>Our system has received a warning about the following account for activity that goes against our terms.</p>
          <br />
          <p>Username: ${profile.username}</p>
          <br />
          <p>${message}</p>
          <br />
          <br />
          <p>If you believe this warning was sent in error, please contact support at <a href="mailto:support@unicornlanding.com">support@unicornlanding.com</a>.</p>
          `,
        },
      },
    );

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send email",
          details: emailError,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // If there's a report ID, update its status
    if (reportId) {
      const { error: reportError } = await supabaseAdmin
        .from("user_reports")
        .update({
          report_status: "RESOLVED",
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (reportError) {
        console.error("Error updating report status:", reportError);
        // Continue anyway since the email was sent
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Warning email sent to ${profile.email}`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error sending warning:", error);
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
