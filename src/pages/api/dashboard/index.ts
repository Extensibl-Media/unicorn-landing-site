import type { APIRoute } from "astro";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MIN_ADMIN_LEVEL } from "@/lib/config";
import { checkIsadmin } from "@/lib/utils";
import {
  startOfWeek,
  previousSunday,
  lastDayOfWeek,
  addSeconds,
  subWeeks,
} from "date-fns";

export const GET: APIRoute = async ({ request, cookies }) => {
  const serverClient = createClient({
    headers: request.headers,
    cookies,
  });
  checkIsadmin(serverClient);

  // Current date
  const currentDate = new Date();
  // Beginning of current week (Sunday by default)
  const beginningOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
  // Beginning of previous week
  const beginningOfPreviousWeek = startOfWeek(
    subWeeks(beginningOfCurrentWeek, 1),
    { weekStartsOn: 0 },
  );
  // End of previous week (1 second before current week starts)
  const endOfPreviousWeek = addSeconds(beginningOfCurrentWeek, -1);
  // Convert to ISO strings for Supabase
  const currentDateISO = currentDate.toISOString();
  const beginningOfCurrentWeekISO = beginningOfCurrentWeek.toISOString();
  const beginningOfPreviousWeekISO = beginningOfPreviousWeek.toISOString();
  const endOfPreviousWeekISO = endOfPreviousWeek.toISOString();

  // console.log({
  //   currentDateISO,
  //   beginningOfCurrentWeekISO,
  //   beginningOfPreviousWeekISO,
  //   endOfPreviousWeekISO,
  // });

  const adminClient = createAdminClient();

  // Get current week profile stats
  const {
    data: newProfiles,
    error: newProfilesError,
    count: newProfilesCount,
  } = await adminClient
    .from("profiles")
    .select("username, avatar_url, created_at", { count: "exact", head: false })
    .gte("created_at", beginningOfCurrentWeekISO)
    .limit(5);

  // Get previous week profile stats
  const { error: lastWeekProfilesError, count: lastWeekProfilesCount } =
    await adminClient
      .from("profiles")
      .select("username, avatar_url, created_at", {
        count: "exact",
        head: true,
      })
      .gte("created_at", beginningOfPreviousWeekISO)
      .lte("created_at", endOfPreviousWeekISO);

  // Get current week PENDING verification requests
  const {
    data: newVerificationRequests,
    error: newVerificationRequestsError,
    count: newVerificationRequestsCount,
  } = await adminClient
    .from("profile_verification_requests")
    .select("id, user_id, created_at, status", { count: "exact", head: false })
    .gte("created_at", beginningOfCurrentWeekISO)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get previous week PENDING verification requests
  const {
    error: lastWeekVerificationRequestsError,
    count: lastWeekVerificationRequestsCount,
  } = await adminClient
    .from("profile_verification_requests")
    .select("id, user_id, created_at, status", {
      count: "exact",
      head: true,
    })
    .gte("created_at", beginningOfPreviousWeekISO)
    .lte("created_at", endOfPreviousWeekISO);

  // Check for errors
  if (
    newProfilesError ||
    lastWeekProfilesError ||
    newVerificationRequestsError ||
    lastWeekVerificationRequestsError
  ) {
    console.log({
      newProfilesError,
      lastWeekProfilesError,
      newVerificationRequestsError,
      lastWeekVerificationRequestsError,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error:
          newProfilesError?.message ||
          lastWeekProfilesError?.message ||
          newVerificationRequestsError?.message ||
          lastWeekVerificationRequestsError?.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }

  // Return raw data for all queries
  return new Response(
    JSON.stringify({
      success: true,
      // dateRanges: {
      //   currentWeekStart: beginningOfCurrentWeekISO,
      //   previousWeekStart: beginningOfPreviousWeekISO,
      //   previousWeekEnd: endOfPreviousWeekISO
      // },
      profiles: {
        currentWeek: {
          count: newProfilesCount,
          data: newProfiles,
        },
        previousWeek: {
          count: lastWeekProfilesCount,
        },
      },
      verificationRequests: {
        currentWeek: {
          count: newVerificationRequestsCount,
          data: newVerificationRequests,
        },
        previousWeek: {
          count: lastWeekVerificationRequestsCount,
        },
      },
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
