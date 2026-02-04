import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export interface ActorReadinessState {
  isReady: boolean;
  isInitializing: boolean;
  hasError: boolean;
  error: Error | null;
}

/**
 * Hook that derives actor readiness state from the React Query cache
 * without modifying the immutable useActor hook.
 */
export function useActorReadiness(): ActorReadinessState {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  // Check if there's an error in the actor query
  const actorQueryState = queryClient.getQueryState(['actor', actor ? 'authenticated' : 'anonymous']);
  const hasError = actorQueryState?.status === 'error';
  const error = actorQueryState?.error as Error | null;

  return {
    isReady: !!actor && !isFetching,
    isInitializing: isFetching || (!actor && !hasError),
    hasError,
    error,
  };
}
