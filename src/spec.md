# Specification

## Summary
**Goal:** Ensure the user’s selected police department persists and is reliably available when opening or reloading the “Report to Police” flow.

**Planned changes:**
- Backend: Add per-user persistence endpoints to get/save (and optionally clear) the caller’s saved police department selection.
- Frontend: Update the Stalker Info police department selector to save via the backend API and invalidate/refetch relevant React Query caches; show English success/error toasts.
- Frontend: Update the incident detail / Report to Police entry flow to load and prefer the saved police department on mount and across refresh, avoiding automatic overwrite by auto-lookup unless no saved department exists or the user explicitly refreshes.
- Frontend: When no saved department exists and no valid address is available, show an actionable English message and keep “Report to Police” disabled without crashing.

**User-visible outcome:** A previously saved police department continues to appear as the “Submitting to” department in the police report dialog even after navigating to an incident or refreshing the page, and the report action remains safely disabled with guidance when no department can be determined.
