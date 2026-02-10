/**
 * Quick Exit utility for emergency navigation away from the app.
 * Provides immediate redirect to a safe destination (default: weather website)
 * with replace-style navigation to minimize browser history traces.
 */

const QUICK_EXIT_URL_KEY = 'reporther_quick_exit_url';
const DEFAULT_WEATHER_URL = 'https://weather.com';

/**
 * Validates that a URL is safe (http/https only)
 */
export function isValidQuickExitUrl(url: string): boolean {
  if (!url || url.trim() === '') {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Gets the configured Quick Exit destination URL from localStorage
 * Falls back to default weather URL if none configured or invalid
 */
export function getQuickExitUrl(): string {
  try {
    const stored = localStorage.getItem(QUICK_EXIT_URL_KEY);
    if (stored && isValidQuickExitUrl(stored)) {
      return stored;
    }
  } catch (error) {
    console.error('Error reading Quick Exit URL from localStorage:', error);
  }
  return DEFAULT_WEATHER_URL;
}

/**
 * Saves a Quick Exit destination URL to localStorage
 * @throws Error if URL is invalid
 */
export function saveQuickExitUrl(url: string): void {
  if (!isValidQuickExitUrl(url)) {
    throw new Error('Invalid URL. Please enter a valid http:// or https:// URL.');
  }
  
  try {
    localStorage.setItem(QUICK_EXIT_URL_KEY, url);
  } catch (error) {
    console.error('Error saving Quick Exit URL to localStorage:', error);
    throw new Error('Failed to save URL. Please try again.');
  }
}

/**
 * Triggers immediate Quick Exit navigation
 * Uses window.location.replace to minimize browser history traces
 */
export function triggerQuickExit(): void {
  const destination = getQuickExitUrl();
  
  try {
    // Use replace to avoid adding to browser history
    window.location.replace(destination);
  } catch (error) {
    console.error('Error during Quick Exit:', error);
    // Fallback to default if custom URL fails
    window.location.replace(DEFAULT_WEATHER_URL);
  }
}

/**
 * Gets the default weather URL (for display purposes)
 */
export function getDefaultWeatherUrl(): string {
  return DEFAULT_WEATHER_URL;
}
