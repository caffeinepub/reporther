# Specification

## Summary
**Goal:** Let users delete a saved abuser/stalker profile directly from the DV Journal “Select from saved profiles” dropdown, with confirmation and safe local state handling.

**Planned changes:**
- Add a per-profile delete icon/button inside each row of the DV Journal saved-profiles dropdown (without changing the selected value when clicked).
- Add a confirmation dialog before deletion; on confirm, call the existing `useDeleteStalkerProfile` mutation and refresh the dropdown list via React Query invalidation.
- Show success/error toasts for deletion results and prevent double-submission while the delete request is in progress.
- After successful deletion, if the deleted profile name matches the current abuser name input value, clear the input and keep the user in an editable state (no auto-save).

**User-visible outcome:** Users can delete a saved profile from the dropdown (after confirming), see immediate feedback, and the list updates without accidentally changing selection; if they were using that name in the input, it is cleared safely.
