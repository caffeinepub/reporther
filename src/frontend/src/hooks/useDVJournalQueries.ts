import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { waitForActorReady } from '../utils/waitForActorReady';
import { getActorErrorMessage } from '../utils/actorInitErrorMessage';
import { normalizeTimestampMs } from '../utils/normalizeTimestampMs';
import type { JournalEntry, DVJournalAnalysis, backendInterface } from '../backend';

// Get abuser name for current user
export function useGetAbuserName() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string>({
    queryKey: ['dvAbuserName', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return '';
      return actor.getAbuserName();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Helper function to ensure user has permission
async function ensureUserPermission(actor: backendInterface): Promise<void> {
  try {
    // Try to get the caller's role
    const role = await actor.getCallerUserRole();
    
    // If we got a role back, we're good
    if (role) {
      return;
    }
  } catch (error: any) {
    // If we get an unauthorized error, try to self-assign user role
    if (error?.message?.includes('Unauthorized') || error?.message?.includes('trap')) {
      try {
        // Try to assign ourselves the user role
        // Note: This will only work if the backend allows self-service user role assignment
        await actor.assignCallerUserRole(actor as any, { __kind__: 'user' } as any);
      } catch (assignError) {
        // If self-assignment fails, throw a clear error
        throw new Error('Unable to initialize user permissions. Please contact support.');
      }
    } else {
      throw error;
    }
  }
}

// Helper function to get actor with proper error handling
async function getActorWithReadiness(
  actor: backendInterface | null,
  queryClient: ReturnType<typeof useQueryClient>,
  principalString?: string
): Promise<backendInterface> {
  if (!actor) {
    try {
      await waitForActorReady(queryClient, principalString);
    } catch (error) {
      throw new Error(getActorErrorMessage(error));
    }
  }

  // Get the actor from cache using the correct query key
  const queryKey = principalString ? ['actor', principalString] : ['actor'];
  const cachedActor = actor || queryClient.getQueryData<backendInterface>(queryKey);
  
  if (!cachedActor) {
    throw new Error(getActorErrorMessage(null));
  }

  return cachedActor;
}

// Normalize journal entries timestamps
function normalizeJournalEntries(entries: JournalEntry[]): JournalEntry[] {
  return entries.map((entry) => ({
    ...entry,
    timestampMs: BigInt(normalizeTimestampMs(entry.timestampMs)),
  }));
}

// Set abuser name
export function useSetAbuserName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (abuserName: string) => {
      if (!identity) {
        throw new Error('You must be authenticated to save the abuser name');
      }

      const principalString = identity.getPrincipal().toString();
      const currentActor = await getActorWithReadiness(actor, queryClient, principalString);

      // Ensure user has permission (will attempt self-service initialization if needed)
      try {
        await ensureUserPermission(currentActor);
      } catch (error: any) {
        throw new Error(getActorErrorMessage(error));
      }

      return currentActor.setAbuserName(abuserName);
    },
    onSuccess: (_, abuserName) => {
      const principalStr = identity?.getPrincipal().toString();
      // Immediately update the cache with the new name
      queryClient.setQueryData<string>(['dvAbuserName', principalStr], abuserName);
      // Then invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: ['dvAbuserName', principalStr] });
      queryClient.invalidateQueries({ queryKey: ['dvJournal', principalStr] });
    },
  });
}

// Get all journal entries
export function useGetJournalEntries() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<JournalEntry[]>({
    queryKey: ['dvJournalEntries', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const entries = await actor.getJournalEntries();
      return normalizeJournalEntries(entries);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Add a journal entry
export function useAddJournalEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (entry: string) => {
      if (!identity) {
        throw new Error('You must be authenticated to add journal entries');
      }

      const principalString = identity.getPrincipal().toString();
      const currentActor = await getActorWithReadiness(actor, queryClient, principalString);

      // Ensure user has permission
      try {
        await ensureUserPermission(currentActor);
      } catch (error: any) {
        throw new Error(getActorErrorMessage(error));
      }

      return currentActor.addJournalEntry(entry);
    },
    onSuccess: (_, entry) => {
      const principalStr = identity?.getPrincipal().toString();
      
      // Optimistically add the new entry to the cache
      queryClient.setQueryData<JournalEntry[]>(
        ['dvJournalEntries', principalStr],
        (oldEntries = []) => {
          const newEntry: JournalEntry = {
            timestamp: BigInt(Date.now() * 1_000_000), // Convert to nanoseconds for consistency
            timestampMs: BigInt(Date.now()),
            entry,
          };
          return [newEntry, ...oldEntries];
        }
      );

      // Invalidate and refetch to get authoritative data from backend
      queryClient.invalidateQueries({ queryKey: ['dvJournalEntries', principalStr] });
      queryClient.invalidateQueries({ queryKey: ['dvJournal', principalStr] });
      queryClient.invalidateQueries({ queryKey: ['dvJournalAnalysis', principalStr] });
    },
  });
}

// Analyze journal
export function useAnalyzeJournal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async () => {
      if (!identity) {
        throw new Error('You must be authenticated to analyze your journal');
      }

      const principalString = identity.getPrincipal().toString();
      const currentActor = await getActorWithReadiness(actor, queryClient, principalString);

      // Ensure user has permission
      try {
        await ensureUserPermission(currentActor);
      } catch (error: any) {
        throw new Error(getActorErrorMessage(error));
      }

      return currentActor.analyzeJournal();
    },
    onSuccess: (analysis) => {
      const principalStr = identity?.getPrincipal().toString();
      if (analysis) {
        // Update the cache with the new analysis
        queryClient.setQueryData<DVJournalAnalysis>(['dvJournalAnalysis', principalStr], analysis);
      }
      queryClient.invalidateQueries({ queryKey: ['dvJournalAnalysis', principalStr] });
    },
  });
}

// Get last journal analysis
export function useGetLastJournalAnalysis() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<DVJournalAnalysis | null>({
    queryKey: ['dvJournalAnalysis', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const result = await actor.getLastJournalAnalysis();
      return result || null;
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
