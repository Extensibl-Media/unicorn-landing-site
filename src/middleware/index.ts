import { defineMiddleware } from "astro:middleware";
import { createClient } from '../lib/supabase/server';

const MIN_ADMIN_LEVEL = 1000;

export const onRequest = defineMiddleware(async ({ request, cookies, redirect }, next) => {


  console.log('checking auth')
  const url = new URL(request.url);

  // Check if we're in an admin route
  const isAdminRoute = url.pathname.startsWith('/admin');
  const isLoginPage = url.pathname === '/admin/login';


  // If it's not an admin route, continue normally
  if (!isAdminRoute) {
    console.log('Not Admin Route')
    return next();
  }

  const supabase = createClient(request, cookies);
  const { data: { session }, error } = await supabase.auth.getSession();


  console.log("Server-side session check:", {
    session,
    app_metadata: session?.user?.app_metadata,
    error,
    hasUser: session?.user ? "yes" : "no",
  });

  // If it's the login page
  if (isLoginPage) {
    console.log('Login Route')

    // If we have a session and proper admin level, redirect to admin dashboard
    if (session?.user?.app_metadata?.claims_admin === true ||
      (session?.user?.app_metadata?.user_level &&
        session.user.app_metadata.user_level >= MIN_ADMIN_LEVEL)) {
      return redirect('/admin');
    }

    // If logged in but not admin, redirect to home
    if (session && !session.user?.app_metadata?.claims_admin &&
      (!session.user?.app_metadata?.user_level ||
        session.user.app_metadata.user_level < MIN_ADMIN_LEVEL)) {
      return redirect('/');
    }

    // Not logged in, allow access to login page
    return next();
  }

  // For all other admin routes
  if (!session) {
    console.log('No session, need to log in')

    // Store the intended destination for post-login redirect
    const destination = url.pathname + url.search;
    return redirect(`/admin/login?redirect=${encodeURIComponent(destination)}`);
  }

  // Check for admin privileges
  const isAdmin =
    session.user?.app_metadata?.claims_admin === true ||
    (session.user?.app_metadata?.user_level &&
      session.user.app_metadata.user_level >= MIN_ADMIN_LEVEL);

  if (!isAdmin) {
    console.log('Not Admin')

    return redirect('/');
  }

  // Super admin routes (user_level >= 9001 or claims_admin)
  if (url.pathname.startsWith('/admin/settings/team')) {
    const isSuperAdmin =
      session.user?.app_metadata?.claims_admin === true ||
      (session.user?.app_metadata?.user_level &&
        session.user.app_metadata.user_level >= 9001);

    if (!isSuperAdmin) {
      console.log('Not Superadmin')

      return redirect('/admin');
    }
  }

  // All checks passed, continue to route
  console.log('Welcome, Admin User')

  const response = await next();
  return response;
});