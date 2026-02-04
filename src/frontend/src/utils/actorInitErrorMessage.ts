/**
 * Centralized user-friendly error messages for actor initialization failures.
 */

export const ACTOR_INIT_ERROR_MESSAGE = 
  'Unable to connect to the backend service. Please try logging out and logging back in, or refresh the page. If the problem persists, please try again later.';

export const ACTOR_UNAVAILABLE_MESSAGE = 
  'The backend service is currently initializing. Please wait a moment and try again.';

/**
 * Maps various error types to user-friendly messages.
 */
export function getActorErrorMessage(error: unknown): string {
  if (!error) {
    return ACTOR_UNAVAILABLE_MESSAGE;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check for specific error patterns
  if (errorMessage.includes('Actor not available')) {
    return ACTOR_UNAVAILABLE_MESSAGE;
  }

  if (errorMessage.includes('Unauthorized') || errorMessage.includes('access')) {
    return 'You do not have permission to perform this action. Please ensure you are logged in with the correct account.';
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error: Unable to reach the backend service. Please check your internet connection and try again.';
  }

  // Default to the initialization error message
  return ACTOR_INIT_ERROR_MESSAGE;
}
