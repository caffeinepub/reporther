import { QueryClient } from '@tanstack/react-query';

/**
 * Waits for the actor query to resolve (either successfully or with an error).
 * This helps mutations avoid the "Actor not available" error during transient initialization.
 * 
 * @param queryClient - The React Query client
 * @param principalString - Optional principal string to wait for a specific actor query
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 */
export async function waitForActorReady(
  queryClient: QueryClient,
  principalString?: string,
  timeoutMs: number = 10000
): Promise<void> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkActor = () => {
      // Build the query key based on whether we have a principal
      const queryKey = principalString ? ['actor', principalString] : ['actor'];
      
      // Check for the specific actor query
      const queries = queryClient.getQueriesData({ queryKey });
      
      if (queries.length === 0) {
        // No actor query exists yet, keep waiting
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Actor initialization timeout - service may be unavailable'));
          return;
        }
        setTimeout(checkActor, 100);
        return;
      }

      // Check if the actor query is still fetching
      const actorQueries = queryClient.getQueryCache().findAll({ queryKey });
      const isFetching = actorQueries.some(query => query.state.fetchStatus === 'fetching');

      if (isFetching) {
        // Still fetching, keep waiting
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Actor initialization timeout - service is still starting up'));
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
        reject(new Error('Actor initialization timeout - no data received'));
        return;
      }
      setTimeout(checkActor, 100);
    };

    checkActor();
  });
}
