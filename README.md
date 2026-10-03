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
  compiles its four scripts in their original order to `public/student.js`.
  This generated file is ignored by Git and created before development,
  testing and production builds.
- `src/app/style.css` is unchanged. The existing UI kit and backend remain
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

See [implementation and UI/API mismatch list](docs/WEB-API-INTEGRATION.md). Start the local Laravel API on port 8000 alongside Next.js. Configure `API_SERVER_URL` to use another backend. Existing authenticated cookies are supported; the absent login/logout screens are listed as a UI gap.
