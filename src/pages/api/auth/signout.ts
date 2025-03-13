import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ cookies, redirect, request }) => {
  const formData = await request.formData();
  const redirectTo = formData.get("redirect")?.toString() || "/";
  cookies.delete("sb-xbnnssknhufakdoahptv-auth-token", { path: "/" });
  return redirect(redirectTo, 301);
};
