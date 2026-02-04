# Specification

## Summary
**Goal:** Fix incident evidence uploads so they are persisted by the backend and become selectable attachments in the “Submit Police Report” dialog.

**Planned changes:**
- Update `frontend/src/components/IncidentForm.tsx` so `uploadFile()` uses the existing React Query mutation `useSaveEvidenceFile()` (backend `uploadEvidence`) and uses the returned `EvidenceMeta.id` (no fake/generated IDs).
- Remove reliance on `useLinkEvidenceToIncident()` for linking evidence; treat `uploadEvidence(incidentId, ...)` as the source of truth for associating evidence to an incident.
- Invalidate/refetch the incident evidence React Query cache after each successful upload so `IncidentDetail` and `PoliceReportDialog` receive updated, non-empty `availableEvidence` when evidence exists.
- Add user-facing error handling in `IncidentForm.tsx`: on upload failure, show an English toast that names the file that failed and suggests retrying; only mark a file as uploaded when the backend upload succeeds and returns `EvidenceMeta`.

**User-visible outcome:** After uploading evidence to an incident, the evidence appears under “Attached Evidence” in the incident detail view and is selectable under “Attach Evidence” when submitting a police report; failed uploads show a clear retry message and are not shown as successfully uploaded.
