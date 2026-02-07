# Specification

## Summary
**Goal:** Restore the app’s Reporther branding and identity (name + man-behind-bars icon) across UI, PWA metadata, and cached assets.

**Planned changes:**
- Update all user-facing branding text in the login/unauthenticated landing experience and the top app header to display “Reporther”, removing any “My Safety Tracker” / “Safety Tracker” copy.
- Update PWA/app metadata to use “Reporther” everywhere (document title, Apple PWA title, OpenGraph/Twitter titles, and manifest name/short_name/description as needed).
- Replace favicon and PWA icon assets with a “man behind bars” icon set, and update all references (index.html, manifest.json, in-app header logo, and login prompt hero/logo) to use the new Reporther icon assets instead of any private-app icon assets.
- Update service worker cache naming and precache icon URLs to match the new Reporther icon filenames and remove old private-app icon entries to avoid cache conflicts and prevent 404s.

**User-visible outcome:** The app consistently shows the name “Reporther” (in the login screen, header, and when installed/shared as a PWA) and displays the man-behind-bars icon across the favicon, installed app icon, and in-app branding, including in cached/offline scenarios.
