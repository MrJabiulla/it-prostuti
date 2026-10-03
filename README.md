# Prosthuti Student Web

Next.js + TypeScript with the existing application CSS and screen templates.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The development command watches both Next.js and
the student TypeScript runtime. Reload the page after editing runtime files.

```sh
npm run typecheck
npm test
npm run build
npm start
```

## Migration boundary

- `app/layout.tsx` and `app/page.tsx` provide the Next.js shell and original DOM.
- `src/student/` preserves the browser renderer and hash routes. TypeScript
  compiles its scripts in their original order to `public/student.js`.
  This generated file is ignored by Git and created before development,
  testing and production builds.
- `src/app/style.css` preserves the existing design with account-control additions. The existing UI kit and backend remain
  separate from Student Web.
- Student Web now uses Laravel through the same-origin `/api/v1` proxy. Legacy
  `prosthuti-mvp-v1` data is retained untouched; it is not imported or overwritten.
- The Next.js shell uses strict TypeScript. The browser runtime uses shared
  domain types with relaxed legacy null and implicit-parameter checking to
  preserve behavior during this migration.
- `public/offline-worker.js` caches the Next.js page and its local assets when
  the existing offline action is used. Verify offline behavior with a production
  build. Browser-local data remains independent of the asset cache.
- The previous `/index.html` entry redirects to `/`. The old static-root hosting
  configuration is not used by Next.js; no deployment is part of this change.

To roll back, restore the previous Git revision and serve its original
`index.html`. Existing browser storage remains compatible. If offline mode was
installed, re-enable it online so the matching worker replaces the newer cache.

## API integration

See [implementation and UI/API mismatch list](docs/WEB-API-INTEGRATION.md). Start the local Laravel API on port 8000 alongside Next.js. Configure `API_SERVER_URL` to use another backend. Use Log in or Create account to request an email OTP. Registration collects a name; verification creates or signs into the account. Log out revokes the current session. Configure Laravel mail delivery before using real email addresses. See [remaining work](docs/REMAINING-WORK.md).

## Admin panel

Open `/admin` on the same local Next.js server. The Laravel API must be running
on port 8000 (or the configured `API_SERVER_URL`). Sign in using the existing
email OTP flow and an active administrator account. Student accounts see an
access-denied screen; Laravel also enforces the role on every admin request.
To grant access to an existing verified account, use the trusted terminal
command documented in [backend setup](backend/README.md#email-otp-and-google-authentication).

The panel manages subjects, chapters, topics, lessons and their ordered sections,
questions and answer options, exams and syllabuses, institutes, posts, papers and
ordered question links, current affairs, notices, and media uploads/publication.
Catalogue deletion asks for confirmation; referenced records remain protected
by the API. Content can be unpublished using its editor. Media starts as a draft
and must be published before attaching it to lesson sections.

Lists and related-record selectors are paginated. The list filter searches only
the currently displayed page. Form errors preserve unsaved values; Save/Cancel
closes an editor before switching sections. Notice times are entered in the
browser's local timezone and sent as absolute timestamps. No backend schema,
admin-role assignment UI, or new API endpoint is added.

Admin components live under `app/admin/` and reuse the shared design tokens.
The original student runtime loads only on `/`. Run `npm run typecheck`,
`npm test` and `npm run build` for frontend validation, and `php artisan test`
from `backend/` for existing API contracts. Real inbox delivery still requires
configured mail transport.
