import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { waitForActorReady } from '../utils/waitForActorReady';
import { getActorErrorMessage } from '../utils/actorInitErrorMessage';
import type {
  UserProfile,
  IncidentReport,
  GeneratedMessage,
  MessageTone,
  ToneIntensity,
  StalkerProfile,
  VictimProfile,
  PoliceSubmissionLog,
  EvidenceMeta,
  SmsLog,
  PoliceDepartment,
  IncidentSummary,
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) {
        await waitForActorReady(queryClient);
      }
      const currentActor = actor || queryClient.getQueryData<any>(['actor']);
      if (!currentActor) {
        throw new Error(getActorErrorMessage(null));
      }
      return currentActor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Stalker Profile Queries (Legacy Single Profile)
export function useGetStalkerInfo() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<StalkerProfile | null>({
    queryKey: ['stalkerInfo', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const result = await actor.getStalkerProfile();
      return result || null;
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSaveStalkerInfo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stalker: StalkerProfile) => {
      if (!actor) {
        try {
          await waitForActorReady(queryClient);
        } catch (error) {
          throw new Error(getActorErrorMessage(error));
        }
      }
      
      // Get the actor again after waiting
      const currentActor = actor || queryClient.getQueryData<any>(['actor']);
      if (!currentActor) {
        throw new Error(getActorErrorMessage(null));
      }
      
      return currentActor.saveStalkerProfile(stalker);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stalkerInfo'] });
    },
  });
}

// Multiple Stalker Profiles Queries
export function useAddStalkerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profile: StalkerProfile) => {
      if (!actor) {
        try {
          await waitForActorReady(queryClient);
        } catch (error) {
          throw new Error(getActorErrorMessage(error));
        }
      }
      
      // Get the actor again after waiting
      const currentActor = actor || queryClient.getQueryData<any>(['actor']);
      if (!currentActor) {
        throw new Error(getActorErrorMessage(null));
      }
      
      return currentActor.saveMultipleStalkerProfile(profile);
    },
    onSuccess: () => {
      const principalStr = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({ queryKey: ['stalkerProfiles', principalStr] });
      queryClient.invalidateQueries({ queryKey: ['hasStalkerProfiles', principalStr] });
      queryClient.invalidateQueries({ queryKey: ['allStalkerProfiles'] });
    },
  });
}

export function useGetStalkerProfiles() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string[]>({
    queryKey: ['stalkerProfiles', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const profiles = await actor.getAllStalkerProfiles();
      return profiles.map(([id]) => id.toString());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetAllStalkerProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[bigint, StalkerProfile]>>({
    queryKey: ['allStalkerProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStalkerProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStalkerProfileById(profileId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<StalkerProfile | null>({
    queryKey: ['stalkerProfile', identity?.getPrincipal().toString(), profileId?.toString()],
    queryFn: async () => {
      if (!actor || !identity || profileId === null) return null;
      const profiles = await actor.getAllStalkerProfiles();
      const profile = profiles.find(([id]) => id === profileId);
      return profile ? profile[1] : null;
    },
    enabled: !!actor && !actorFetching && !!identity && profileId !== null,
  });
}

export function useUpdateStalkerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (data: { profileId: bigint; profile: StalkerProfile }) => {
      if (!actor) {
        try {
          await waitForActorReady(queryClient);
        } catch (error) {
          throw new Error(getActorErrorMessage(error));
        }
      }
      
      // Get the actor again after waiting
      const currentActor = actor || queryClient.getQueryData<any>(['actor']);
      if (!currentActor) {
        throw new Error(getActorErrorMessage(null));
      }
      
      return currentActor.updateStalkerProfile(data.profileId, data.profile);
    },
    onSuccess: (_, variables) => {
      const principalStr = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({ queryKey: ['stalkerProfiles', principalStr] });
      queryClient.invalidateQueries({ 
        queryKey: ['stalkerProfile', principalStr, variables.profileId.toString()] 
      });
      queryClient.invalidateQueries({ queryKey: ['allStalkerProfiles'] });
    },
  });
}

export function useDeleteStalkerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (profileId: bigint) => {
      if (!actor) {
        try {
          await waitForActorReady(queryClient);
        } catch (error) {
          throw new Error(getActorErrorMessage(error));
        }
      }
      
      // Get the actor again after waiting
      const currentActor = actor || queryClient.getQueryData<any>(['actor']);
      if (!currentActor) {
        throw new Error(getActorErrorMessage(null));
      }
      
      return currentActor.deleteStalkerProfile(profileId);
    },
    onSuccess: () => {
      const principalStr = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({ queryKey: ['stalkerProfiles', principalStr] });
      queryClient.invalidateQueries({ queryKey: ['hasStalkerProfiles', principalStr] });
      queryClient.invalidateQueries({ queryKey: ['allStalkerProfiles'] });
    },
  });
}

export function useHasStalkerProfiles() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['hasStalkerProfiles', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return false;
      const profiles = await actor.getAllStalkerProfiles();
      return profiles.length > 0;
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Police Department Queries
export function useGetAllPoliceDepartments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[bigint, PoliceDepartment]>>({
    queryKey: ['allPoliceDepartments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPoliceDepartments();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSavePoliceDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (department: PoliceDepartment) => {
      if (!actor) {
        try {
          await waitForActorReady(queryClient);
        } catch (error) {
          throw new Error(getActorErrorMessage(error));
        }
      }
      
      const currentActor = actor || queryClient.getQueryData<any>(['actor']);
      if (!currentActor) {
        throw new Error(getActorErrorMessage(null));
      }
      
      return currentActor.savePoliceDepartment(department);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPoliceDepartments'] });
    },
  });
}

export function useUpdatePoliceDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { deptId: bigint; department: PoliceDepartment }) => {
      if (!actor) {
        try {
          await waitForActorReady(queryClient);
        } catch (error) {
          throw new Error(getActorErrorMessage(error));
        }
      }
      
      const currentActor = actor || queryClient.getQueryData<any>(['actor']);
      if (!currentActor) {
        throw new Error(getActorErrorMessage(null));
      }
      
      return currentActor.updatePoliceDepartment(data.deptId, data.department);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPoliceDepartments'] });
    },
  });
}

export function useDeletePoliceDepartment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deptId: bigint) => {
      if (!actor) {
        try {
          await waitForActorReady(queryClient);
        } catch (error) {
          throw new Error(getActorErrorMessage(error));
        }
      }
      
      const currentActor = actor || queryClient.getQueryData<any>(['actor']);
      if (!currentActor) {
        throw new Error(getActorErrorMessage(null));
      }
      
      return currentActor.deletePoliceDepartment(deptId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPoliceDepartments'] });
    },
  });
}

export function useFindNearestPoliceDepartment() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (address: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.findNearestPoliceDepartment(address);
    },
  });
}

// Victim Profile Queries
export function useGetVictimProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<VictimProfile | null>({
    queryKey: ['victimProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const result = await actor.getVictimProfile();
      return result || null;
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSaveVictimProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: VictimProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveVictimProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['victimProfile'] });
    },
  });
}

// Incident Queries
export function useGetUserIncidents() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<IncidentReport[]>({
    queryKey: ['userIncidents', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      return actor.getAllIncidents();
    },
    enabled: !!actor && !actorFetching && !!identity,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

export function useGetIncident(id: string | null) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<IncidentReport | null>({
    queryKey: ['incident', id],
    queryFn: async () => {
      if (!actor || id === null || !identity) return null;
      
      try {
        const result = await actor.getIncident(id);
        return result || null;
      } catch (error) {
        console.error('Error fetching incident:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && id !== null && !!identity,
    retry: 1,
    staleTime: 0,
  });
}

export function useSubmitIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (data: {
      location: string;
      description: string;
      evidenceNotes: string;
      additionalNotes: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('User not authenticated');
      
      return actor.saveIncident(
        data.location,
        data.description,
        data.evidenceNotes,
        data.additionalNotes
      );
    },
    onSuccess: (newIncident: IncidentReport) => {
      const principalStr = identity?.getPrincipal().toString();
      
      // Update the cache optimistically with the new incident
      queryClient.setQueryData<IncidentReport[]>(
        ['userIncidents', principalStr],
        (oldData) => {
          if (!oldData) return [newIncident];
          // Add new incident and sort by timestamp (most recent first)
          return [newIncident, ...oldData].sort((a, b) => 
            Number(b.timestamp) - Number(a.timestamp)
          );
        }
      );
      
      // Invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ 
        queryKey: ['userIncidents', principalStr] 
      });
      
      // Invalidate incident summary to refresh with new data
      queryClient.invalidateQueries({ 
        queryKey: ['incidentSummary', principalStr] 
      });
    },
  });
}

// Incident Summary Query
export function useGetIncidentSummary(userPrincipal: any | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<IncidentSummary | null>({
    queryKey: ['incidentSummary', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      try {
        return actor.generateIncidentSummary();
      } catch (error) {
        console.error('Error fetching incident summary:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
    staleTime: 30000,
  });
}

// Evidence Queries
export function useGetIncidentEvidence(incidentId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<EvidenceMeta[]>({
    queryKey: ['incidentEvidence', incidentId],
    queryFn: async () => {
      if (!actor || !incidentId) return [];
      try {
        return actor.getEvidenceForIncident(incidentId);
      } catch (error) {
        console.error('Error fetching incident evidence:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && incidentId !== null,
    staleTime: 30000,
  });
}

export function useSaveEvidenceFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      incidentId: string;
      storageId: string;
      filename: string;
      fileType: string;
      fileSize: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadEvidence(
        data.incidentId,
        data.storageId,
        data.filename,
        data.fileType,
        data.fileSize
      );
    },
    onSuccess: (_, variables) => {
      // Invalidate evidence cache for this incident so it refetches
      queryClient.invalidateQueries({ 
        queryKey: ['incidentEvidence', variables.incidentId] 
      });
    },
  });
}

// Message Queries
export function useGetIncidentMessages(incidentId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GeneratedMessage[]>({
    queryKey: ['incidentMessages', incidentId],
    queryFn: async () => {
      if (!actor || !incidentId) return [];
      try {
        return actor.getMessagesForIncident(incidentId);
      } catch (error) {
        console.error('Error fetching incident messages:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && incidentId !== null,
    staleTime: 10000,
  });
}

export function useGenerateMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { incidentId: string; tone: MessageTone; intensity: ToneIntensity | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generateMessage(data.incidentId, data.tone, data.intensity);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['incidentMessages', variables.incidentId] 
      });
    },
  });
}

// Police Submission Queries
export function useGetPoliceSubmissionLogs() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PoliceSubmissionLog[]>({
    queryKey: ['policeSubmissionLogs', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getPoliceSubmissionLogs();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSubmitPoliceReportWithEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      department: PoliceDepartment;
      submissionResult: string;
      attachedEvidence: EvidenceMeta[];
      victimInfoIncluded: boolean;
      victimInfo: VictimProfile | null;
      includedSummary: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logPoliceSubmission(
        data.department,
        data.submissionResult,
        data.attachedEvidence,
        data.victimInfoIncluded,
        data.victimInfo,
        data.includedSummary
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policeSubmissionLogs'] });
    },
  });
}

// SMS Log Queries
export function useGetSmsLogs() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SmsLog[]>({
    queryKey: ['smsLogs', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getSmsLogs();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSaveSmsLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      incidentId: string;
      messageId: bigint;
      messageContent: string;
      recipient: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.logSmsUsage(
        data.incidentId,
        data.messageId,
        data.messageContent,
        data.recipient
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smsLogs'] });
    },
  });
}

// HTTP Outcall Queries
export function useMakeGetOutcall() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error('Actor not available');
      // Backend function not available yet
      throw new Error('Backend function not implemented');
    },
  });
}

export function useMakePostOutcall() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: { url: string; body: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend function not available yet
      throw new Error('Backend function not implemented');
    },
  });
}
