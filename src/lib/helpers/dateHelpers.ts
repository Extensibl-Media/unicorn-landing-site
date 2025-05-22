import { format, parse } from "date-fns";

/**
 * Converts various time string formats to a consistent format
 * @param {string} timeString - Time in format like '2:00 PM', '14:00', '2:30 AM', etc.
 * @param {string} outputFormat - Desired output format (default: 'h:mm a' for 12-hour)
 * @returns {string} Formatted time string
 */
export function normalizeTimeString(
  timeString: string | null,
  outputFormat = "h:mm a"
) {
  if (!timeString || typeof timeString !== "string") {
    return "No time provided";
  }

  const trimmedTime = timeString.trim();

  // Check if it's already in 12-hour format (contains AM/PM)
  if (/\b(AM|PM|am|pm)\b/.test(trimmedTime)) {
    try {
      // Parse 12-hour format
      const parsedDate = parse(trimmedTime, "h:mm a", new Date());
      return format(parsedDate, outputFormat);
    } catch (error) {
      // Try alternative format with leading zero
      try {
        const parsedDate = parse(trimmedTime, "hh:mm a", new Date());
        return format(parsedDate, outputFormat);
      } catch (innerError) {
        throw new Error(`Unable to parse 12-hour time format: ${trimmedTime}`);
      }
    }
  }

  // Handle 24-hour format
  if (/^\d{1,2}:\d{2}$/.test(trimmedTime)) {
    try {
      // Try parsing as H:mm (single digit hour)
      const parsedDate = parse(trimmedTime, "H:mm", new Date());
      return format(parsedDate, outputFormat);
    } catch (error) {
      try {
        // Try parsing as HH:mm (double digit hour)
        const parsedDate = parse(trimmedTime, "HH:mm", new Date());
        return format(parsedDate, outputFormat);
      } catch (innerError) {
        throw new Error(`Unable to parse 24-hour time format: ${trimmedTime}`);
      }
    }
  }

  throw new Error(`Unrecognized time format: ${trimmedTime}`);
}

/**
 * Converts time to 24-hour format
 * @param {string} timeString - Time string to convert
 * @returns {string} Time in HH:mm format
 */
function to24Hour(timeString: string) {
  return normalizeTimeString(timeString, "HH:mm");
}

/**
 * Converts time to 12-hour format
 * @param {string} timeString - Time string to convert
 * @returns {string} Time in h:mm a format
 */
function to12Hour(timeString: string) {
  return normalizeTimeString(timeString, "h:mm a");
}
