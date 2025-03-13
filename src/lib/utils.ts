import type { SupabaseClient } from "@supabase/supabase-js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const checkIsadmin = async (
  serverClient: SupabaseClient,
): Promise<Response | undefined> => {
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
};

export function calculateKpiChange(currentValue, previousValue, options = {}) {
  const {
    decimals = 1,
    formatValue = (val) => val.toString(),
    prefix = "",
    suffix = "",
  } = options;

  // Calculate raw difference
  const rawDifference = currentValue - previousValue;

  // Calculate percentage difference
  let percentChange = 0;
  let isPositive = rawDifference >= 0;

  if (
    previousValue !== 0 &&
    previousValue !== null &&
    previousValue !== undefined
  ) {
    percentChange = (rawDifference / Math.abs(previousValue)) * 100;
  } else if (currentValue > 0) {
    // If previous value was 0 and current is positive, that's a 100% increase
    percentChange = 100;
  }

  // Format the values
  const formattedCurrent = prefix + formatValue(currentValue) + suffix;
  const formattedPercentChange = Math.abs(percentChange).toFixed(decimals);

  return {
    value: formattedCurrent,
    change: formattedPercentChange,
    isPositive,
    rawDifference,
  };
}
