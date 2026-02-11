/**
 * Maps actor initialization errors to user-friendly messages
 */
export function getActorErrorMessage(error: any): string {
  if (!error) {
    return 'Unable to connect to the backend service. Please check your connection and try again.';
  }

  const errorMessage = error?.message || error?.toString() || '';

  // Authorization/Authentication errors - more specific handling
  if (errorMessage.includes('Unauthorized') || errorMessage.includes('Only users can')) {
    return 'Authentication required. Please sign in to continue.';
  }

  if (errorMessage.includes('authenticated')) {
    return 'You must be signed in to perform this action.';
  }

  // Actor not ready / initialization
  if (errorMessage.includes('Actor not available') || errorMessage.includes('not initialized')) {
    return 'Service is still starting up. Please wait a moment and try again.';
  }

  if (errorMessage.includes('initialization timeout') || errorMessage.includes('still starting up')) {
    return 'Service initialization is taking longer than expected. Please try again.';
  }

  // Network/connection errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  // Canister/backend errors
  if (errorMessage.includes('canister') || errorMessage.includes('replica')) {
    return 'Backend service temporarily unavailable. Please try again in a moment.';
  }

  // Trap errors (backend runtime errors)
  if (errorMessage.includes('trap') || errorMessage.includes('trapped')) {
    // Try to extract meaningful message from trap
    const trapMatch = errorMessage.match(/trap[^:]*:\s*(.+?)(?:\n|$)/i);
    if (trapMatch && trapMatch[1]) {
      const trapMessage = trapMatch[1].trim();
      // Check for authorization in trap message
      if (trapMessage.includes('Unauthorized') || trapMessage.includes('Only users can')) {
        return 'You need to be signed in to access this feature.';
      }
      return trapMessage;
    }
    return 'An error occurred while processing your request. Please try again.';
  }

  // Generic fallback
  return errorMessage || 'An unexpected error occurred. Please try again.';
}
