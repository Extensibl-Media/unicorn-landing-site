import type { APIRoute } from "astro";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import {
  PUBLIC_SUPABASE_ANON_KEY,
  PUBLIC_SUPABASE_URL,
} from "astro:env/client";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType;
  const next = searchParams.get("next") || "/reset-password";

  if (!token_hash || !type) {
    return new Response("Invalid request", { status: 400 });
  }

  // Verify the OTP
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  });

  if (error) {
    console.error("OTP verification error:", error);
    return new Response(error.message, { status: 400 });
  }
  if (data?.session) {
    cookies.set("sb-access-token", data.session.access_token, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production", // false in development
      sameSite: "lax", // less restrictive for development
    });
    cookies.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production", // false in development
      sameSite: "lax", // less restrictive for development
    });
  }
  return redirect(next, 307);
};
