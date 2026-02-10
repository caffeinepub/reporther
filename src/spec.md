# Specification

## Summary
**Goal:** Add an always-accessible Quick Exit control that immediately redirects the user to a configurable weather website to disguise in-app reporting activity.

**Planned changes:**
- Add a clearly visible, one-tap “Quick Exit” control in a global UI element (e.g., sticky header) so it’s accessible throughout the authenticated app.
- Implement immediate redirect to a weather URL using replace-style navigation to minimize returning via the browser back button.
- Add an in-app setting to view/edit the Quick Exit destination URL, validate it, provide an English error on invalid input, and persist it locally with a default fallback.
- Add optional fast activation: a documented desktop keyboard shortcut and an additional Quick Exit placement within the incident report creation screen, without interfering with form submission.

**User-visible outcome:** Users can quickly exit from anywhere (including while creating a report) via a visible button or keyboard shortcut, instantly redirecting to a weather site using a saved (or default) destination URL.
