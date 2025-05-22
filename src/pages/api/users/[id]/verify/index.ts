// src/pages/api/users/[id]/verify.ts - Modified to also update verification request
import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";

export const POST: APIRoute = async ({ params, request, cookies }) => {
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
      }
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
      }
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
        }
      );
    }

    // Parse the JSON body - now also getting the verification request ID and status
    const { verified, verification_request_id, verification_status } =
      await request.json();

    // Use the admin client to bypass RLS
    const supabaseAdmin = createAdminClient();

    // Update the user verification status
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        verified: verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (verified === true) {
      await supabaseAdmin.functions.invoke("send-email", {
        body: {
          to: data?.email,
          subject: `Your Unicorn Landing Verification Request has been approved!`,
          html: `<h1>Unicorn Landing</h1><br />
      <p>Your account has been verified.</p> <br />
      <p>Your account will now feature a Verified checkmark, letting others know your profile can be trusted.</p> <br />
      <p>Thank you, The Unicorn Landing App Team</p> <br />`,
        },
      });
    } else if (verified === false) {
      await supabaseAdmin.functions.invoke("send-email", {
        body: {
          to: data?.email,
          subject: `Your Unicorn Landing Verification Request has been denied.`,
          html: `<h1>Unicorn Landing</h1><br />
      <p>Your request for account approval has been denied.</p> <br />
      <p>Please check your account. If you wish to resubmit a new request, please check your account settings and provide a new photo that adheres to our verification guidelines.</p> <br />
      <p>Thank you, The Unicorn Landing App Team</p> <br />`,
        },
      });
    }

    if (error) {
      console.error("Error updating user verification status:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message,
          details: error,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If verification request ID and status are provided, update the verification request
    if (verification_request_id && verification_status) {
      const { error: requestError } = await supabaseAdmin
        .from("profile_verification_requests")
        .update({
          status: verification_status,
          verified,
          updated_at: new Date().toISOString(),
        })
        .eq("id", verification_request_id);

      if (requestError) {
        console.error(
          "Error updating verification request status:",
          requestError
        );
        // Don't fail the whole operation if this part fails, but include in response
        return new Response(
          JSON.stringify({
            success: true,
            data: data,
            warning:
              "User verified but verification request status could not be updated",
            requestError: requestError.message,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      const { error: requestError } = await supabaseAdmin
        .from("profile_verification_requests")
        .update({
          status: verification_status,
          verified,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", id);

      if (requestError) {
        console.error(
          "Error updating verification request status:",
          requestError
        );
        // Don't fail the whole operation if this part fails, but include in response
        return new Response(
          JSON.stringify({
            success: true,
            data: data,
            warning:
              "User verified but verification request status could not be updated",
            requestError: requestError.message,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error updating user verification:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
