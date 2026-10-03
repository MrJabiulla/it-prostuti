# Remaining Student Web Work

## Completed

- Existing study UI connected to the supported Laravel APIs.
- Email OTP login and registration, resend cooldown, change-email action and current-session logout.
- Cookie/CSRF handling, server errors, pending controls and fresh account state after login/logout.
- Existing study screens and styling preserved.

## Deployment verification

- Configure and verify production mail transport, sender address and actual inbox delivery. OTPs expire after 10 minutes; the server enforces resend and verification limits.
- Verify production same-origin proxy, HTTPS session cookies and session lifetime.
- Run real inbox login/registration/logout and cross-device browser checks before release. Automated API tests do not prove mail delivery.

## Product/API decisions still needed

The detailed contracts and decision options are in [WEB-API-INTEGRATION.md](WEB-API-INTEGRATION.md).

- Align custom mock and chapter-test duration/scoring rules with the API.
- Map institution cards to stable catalogue IDs and supply structured syllabus marks/stages.
- Define validated cloud backup restore and offline answer reconciliation.
- Define media/formula lesson rendering and a complete formula index.
- Review remaining demo/browser-local/help copy against live behavior.
- Align form limits and fixed options with backend constraints.
- Add server aggregates/search or paginated screens for large catalogues and history.
- Choose a visible entry point for the existing question report dialog.
- Define ad, background reminder and report-status notification services.
- Decide how to split practice selections over the API's 100-question limit.
- Define migration of old local backups with stable IDs; do not import array indexes.
- Optional: add Google sign-in/linking UI after configuring the provider.

Email authentication uses the existing backend behavior: verifying a new email creates an account, including through Log in. Registration additionally collects a name. No separate password or password-reset API exists or is needed for this flow.
