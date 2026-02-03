# Specification

## Summary
**Goal:** Fix ReportHer’s message auto-generation to produce meaningful, tone-based content and make police department autofill work reliably via the backend.

**Planned changes:**
- Replace the placeholder backend `generateMessage(incidentId, tone, intensity)` to generate multi-sentence, human-readable messages using stored incident details and (when present) the caller’s stalker profile, varying by selected tone and (for direct warnings only) by intensity.
- Ensure generated messages remain authorization-protected and are persisted so they appear in the incident’s message list after generation.
- Implement backend `findNearestPoliceDepartment(address)` to return a best-match police department for valid address/zip inputs (returning null only when no department can be determined), while preserving existing authentication checks.
- Update the Incident Detail police-department autofill to call the backend lookup (removing the zippopotam.us placeholder path), and refresh results when stalker zip code and/or full address changes or when the user taps “Refresh Police Dept”.
- Add clear UI handling for police department autofill states: missing address data (prompt user to add it), lookup error (actionable error message without stuck loading), and lookup completed with no result (suggest manual entry), with all user-facing text in English.

**User-visible outcome:** Users can generate incident messages that clearly reflect the chosen tone (and intensity for direct warnings) and see them saved in the incident’s messages; police department autofill on Incident Detail updates from the backend based on stalker address changes, with clear feedback for missing info, errors, or no results.
