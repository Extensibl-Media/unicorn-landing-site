export const prerender = false;
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
  endOfWeek,
} from "date-fns";

export const GET: APIRoute = async ({ locals, request, cookies }) => {
  const supabase = createClient({ headers: request.headers, cookies });
  const { data: user } = await supabase.auth.getUser();

  const userLevel = user.user?.app_metadata.user_level;
  // Check if user is admin
  if (!userLevel) throw new Error("No user level provided");
  if (userLevel < 1000) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Unauthorized",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 401,
      },
    );
  }

  // Current date
  const currentDate = new Date();
  // Beginning of current week (Sunday by default)
  const beginningOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 });
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 0 });
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
  const endOfCurrentWeekISO = endOfCurrentWeek.toISOString();

  const adminClient = createAdminClient();

  const {
    data: newProfiles,
    error: newProfilesError,
    count: newProfilesCount,
  } = await adminClient
    .from("profiles")
    .select("username, avatar_url, created_at", { count: "exact", head: false })
    .gte("created_at", beginningOfCurrentWeekISO)
    .limit(5);

  const { error: lastWeekProfilesError, count: lastWeekProfilesCount } =
    await adminClient
      .from("profiles")
      .select("username, avatar_url, created_at", {
        count: "exact",
        head: true,
      })
      .gte("created_at", beginningOfPreviousWeekISO)
      .lte("created_at", endOfPreviousWeekISO);

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

  const {
    data: newReportedUsers,
    error: newReportedUsersError,
    count: newReportedUsersCount,
  } = await adminClient
    .from("user_reports")
    .select("id, profile_id, created_at", {
      count: "exact",
      head: false,
    })
    .gte("created_at", beginningOfCurrentWeekISO)
    .order("created_at", { ascending: false })
    .limit(5);

  const {
    error: lastWeekReportedUsersError,
    count: lastWeekReportedUsersCount,
  } = await adminClient
    .from("user_reports")
    .select("id, profile_id, created_at", {
      count: "exact",
      head: true,
    })
    .gte("created_at", beginningOfPreviousWeekISO)
    .lte("created_at", endOfPreviousWeekISO);

  const { data: upcomingEvents, error: upcomingEventsError } = await adminClient
    .from("events")
    .select(
      `
      *,
      clubs(*)
      `,
    )
    .gte("date", currentDateISO)
    .lte("date", endOfCurrentWeekISO)
    .order("date", { ascending: true });
  // .limit(10);

  // Check for errors
  if (
    newProfilesError ||
    lastWeekProfilesError ||
    newVerificationRequestsError ||
    lastWeekVerificationRequestsError ||
    newReportedUsersError ||
    lastWeekReportedUsersError ||
    upcomingEventsError
  ) {
    console.log({
      newProfilesError,
      lastWeekProfilesError,
      newVerificationRequestsError,
      lastWeekVerificationRequestsError,
      newReportedUsersError,
      lastWeekReportedUsersError,
      upcomingEventsError,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error:
          newProfilesError?.message ||
          lastWeekProfilesError?.message ||
          newVerificationRequestsError?.message ||
          lastWeekVerificationRequestsError?.message ||
          newReportedUsersError?.message ||
          lastWeekReportedUsersError?.message ||
          upcomingEventsError?.message,
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
      reportedUsers: {
        currentWeek: {
          count: newReportedUsersCount,
          data: newReportedUsers,
        },
        previousWeek: {
          count: lastWeekReportedUsersCount,
        },
      },
      upcomingEvents,
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );
};
