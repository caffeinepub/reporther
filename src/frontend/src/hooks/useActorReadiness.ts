import { useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

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
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Build the correct query key based on authentication state
  const principalString = identity?.getPrincipal().toString();
  const queryKey = principalString ? ['actor', principalString] : ['actor'];

  // Check if there's an error in the actor query
  const actorQueryState = queryClient.getQueryState(queryKey);
  const hasError = actorQueryState?.status === 'error';
  const error = actorQueryState?.error as Error | null;

  return {
    isReady: !!actor && !isFetching,
    isInitializing: isFetching || (!actor && !hasError),
    hasError,
    error,
  };
}
