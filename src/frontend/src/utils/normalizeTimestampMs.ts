/**
 * Normalize potentially mis-scaled timestamps into safe millisecond values.
 * Handles seconds, milliseconds, and nanoseconds, and guards against out-of-range values.
 */
export function normalizeTimestampMs(timestamp: bigint | number): number {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;

  // Guard against invalid/zero timestamps
  if (!ts || ts <= 0) {
    return Date.now();
  }

  // If timestamp is very large (> 1e15), likely in nanoseconds
  if (ts > 1_000_000_000_000_000) {
    return Math.floor(ts / 1_000_000);
  }

  // If timestamp is in the range of milliseconds (> 1e12), use as-is
  if (ts > 1_000_000_000_000) {
    return ts;
  }

  // If timestamp is in the range of seconds (< 1e11), convert to milliseconds
  if (ts < 100_000_000_000) {
    return ts * 1000;
  }

  // Default: assume milliseconds
  return ts;
}

/**
 * Format a timestamp (in any scale) to a readable date/time string.
 * Returns a fallback string if the date is invalid.
 */
export function formatTimestampSafe(
  timestamp: bigint | number,
  fallback: string = 'Date unavailable'
): string {
  try {
    const ms = normalizeTimestampMs(timestamp);
    const date = new Date(ms);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return fallback;
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return fallback;
  }
}
