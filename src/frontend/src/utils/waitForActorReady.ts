import { QueryClient } from '@tanstack/react-query';

/**
 * Waits for the actor query to resolve (either successfully or with an error).
 * This helps mutations avoid the "Actor not available" error during transient initialization.
 */
export async function waitForActorReady(
  queryClient: QueryClient,
  timeoutMs: number = 10000
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkActor = () => {
      // Check both possible actor query keys (authenticated and anonymous)
      const queries = queryClient.getQueriesData({ queryKey: ['actor'] });
      
      if (queries.length === 0) {
        // No actor query exists yet, keep waiting
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Timeout waiting for actor initialization'));
          return;
        }
        setTimeout(checkActor, 100);
        return;
      }

      // Check if any actor query is still fetching
      const actorQueries = queryClient.getQueryCache().findAll({ queryKey: ['actor'] });
      const isFetching = actorQueries.some(query => query.state.fetchStatus === 'fetching');

      if (isFetching) {
        // Still fetching, keep waiting
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Timeout waiting for actor initialization'));
          return;
        }
        setTimeout(checkActor, 100);
        return;
      }

      // Check if there's an error
      const hasError = actorQueries.some(query => query.state.status === 'error');
      if (hasError) {
        const errorQuery = actorQueries.find(query => query.state.status === 'error');
        reject(errorQuery?.state.error || new Error('Actor initialization failed'));
        return;
      }

      // Check if we have data
      const hasData = actorQueries.some(query => query.state.data);
      if (hasData) {
        resolve();
        return;
      }

      // Still waiting
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error('Timeout waiting for actor initialization'));
        return;
      }
      setTimeout(checkActor, 100);
    };

    checkActor();
  });
}
