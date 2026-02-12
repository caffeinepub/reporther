# Specification

## Summary
**Goal:** Fix the Domestic Violence Journal so the abuser name is correctly saved and loaded for the authenticated user (including after refresh), and ensure DV journal reads/writes don’t inadvertently clear it.

**Planned changes:**
- Update the backend DV Journal API so `setAbuserName` persists per authenticated principal and `getAbuserName` reliably returns the stored value after refresh (or `""` when no journal exists), with consistent unauthorized handling.
- Ensure backend DV Journal read APIs (`getJournalEntries`) return the caller’s entries reliably and do not mutate/overwrite an already-saved `abuserName` when adding or reading entries.
- Fix frontend React Query query keys and cache invalidation so saving the abuser name and adding journal entries refreshes the correct DV Journal queries and shows accurate saved state and errors.

**User-visible outcome:** After entering and saving an abuser name, it remains visible across navigation and full reload while authenticated, and DV journal entries load consistently without clearing the saved abuser name; authorization failures show a clear English error.
