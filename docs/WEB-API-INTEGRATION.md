# Student Web API integration

## Scope

The existing Next.js shell, hash navigation, screen templates and CSS are retained. No screen, card, tab, form or control has been removed. Existing disabled reader controls remain commented out. Supported actions use Laravel; unmatched controls are kept and report why they cannot complete. No backend schema, authentication policy, dependency or deployment change is included.

## Code ownership

- `src/student/api-client.ts`: fetch, cookie credentials, CSRF refresh/retry, timeout, pagination and shared request feedback.
- `src/student/api-data.ts`: typed API responses and explicit mappings to the existing view data. Server IDs are mapped to the browser's dense subject/question indexes. Historical snapshots are separate from the live question catalogue.
- `src/student/api-actions.ts`: profile, plan, reading, bookmarks, attempt answers/submission and resume writes. Server success precedes committed UI changes. Note text remains in its input when a save fails.
- Existing `app.ts`, `learning.ts`, `study.ts`: keep templates and event handlers, calling the API functions at the action boundary.
- `next.config.ts`: same-origin `/api/v1/*` rewrite to Laravel; `API_SERVER_URL` defaults to `http://127.0.0.1:8000`. Use a trusted server-owned environment value, never a URL supplied by a page visitor.

There is no new state framework, query library, generic repository layer, bearer-token localStorage or automatic local-data import. In server mode, the old `prosthuti-mvp-v1` data is not read, overwritten or uploaded. The unchanged local fixture path remains for regression tests and the clearly labeled, read-only disconnected preview.

## Connected flows

| Existing surface | API integration |
| --- | --- |
| Home | Authenticated name, question activity, streak, accuracy, due revision, current affairs, notices; zero values stay zero |
| Question Bank / search | Published subjects → chapters → topics, mapped questions and study solutions; existing in-browser search and filters retain their UI |
| Study / lesson | Reading completion/position, lesson sections, notes, existing bookmark handler, related questions/papers; lesson bodies load on demand |
| Previous Questions | Server institute/post/year filters over the fetched paper list; selected paper fetches its ordered questions; full paper attempt uses server rules |
| Exam-wise preparation | Server exams/subject coverage and related paper question selection |
| Practice | Idempotent server attempt creation, immutable snapshot rendering, answer item IDs, correctness/explanations from the response, save/resume position, server submission and score |
| Revision / progress / history | Bookmarks, due/level, per-question activity, completed session summaries, per-result immutable snapshots |
| Routine | Month/week reads, full-day plan writes, subject-ID mapping, manual completion and server task/attempt linkage |
| Preferences / study plan / reminders | Profile/preferences writes, focus subject mapping, font/theme/low-data/reminder settings |
| Reports | Existing form handler submits reports and history reads them; the missing visible entry point is listed below |
| Export/download | Existing local file actions remain; they export the loaded account state/content without uploading anything |

API reads are paginated to completion because the existing screens calculate counts and filter in memory. Independent hierarchy requests run in small batches. Lesson bodies and detailed result snapshots load on demand. This avoids silently truncating data, but is not a production-scale catalogue strategy; see mismatch 10.

## UI/API mismatches for review

These have not been resolved by redesigning the UI or changing backend contracts.

| # | Existing UI expectation | Current backend / integration boundary | Decision needed |
| --- | --- | --- | --- |
| 1 | No login, registration, OTP, Google sign-in or logout UI exists | All student reads/writes require an authenticated cookie. A disconnected browser shows the existing preview with a persistent sign-in notice; mutations cannot claim success | Approve an auth screen/entry point and logout placement |
| 2 | Custom mock accepts minutes, marks and penalty | General API exams enforce 20 minutes, +1, no penalty. Custom mocks are retained but cannot start with incompatible settings | Support validated custom rules in the API or change the form contract |
| 3 | Chapter Test advertises 10 minutes | API chapter tests use the general 20-minute default | Align the displayed rule or backend default; the control remains visible and explains the mismatch |
| 4 | Home institution cards contain curated labels, groups, counts; syllabus has MCQ/Written splits, marks, question shares and pass marks | API institutes have ID/title; exam syllabus is subject/text. There is no reliable stable mapping for the static cards or structured marks breakdown | Add explicit card/catalogue links and structured syllabus fields, or approve UI data changes. Static cards and tables remain; their unmatched practice actions do not launch the wrong subject |
| 5 | Backup restore replaces attempts, revision schedules and progress | No validated server restore/import endpoint exists | Design restore ownership/validation rules; current restore UI stays, but confirmation cannot overwrite cloud data |
| 6 | Offline installation claims interactive practice | No offline answer reconciliation contract exists | Decide offline queue/conflict rules. Keep the control, show an unavailable explanation, and preserve file downloads |
| 7 | Lesson sections have text-only presentation; reader controls are commented out | API supports media attachments and section kinds, including formula | Approve media/section presentation and any restoration of disabled controls. Formula revision can show loaded formula sections; a complete formula index is not available |
| 8 | Existing labels explicitly say demo, browser-local, synthetic or not connected | API may contain reviewed, published, non-demo content | Review remaining copy together. Note-save/result/report success feedback is accurate; remaining static demo/help labels are preserved for review |
| 9 | UI has narrower form limits and fixed choices | Name max 30 vs API 80; task title max 80 vs 160; task count max 16 vs 500; fixed study-minute choices vs 5–480; UI daily goal max follows catalogue size vs API max 500 | Align constraints/options without silently clamping server values. Server 422 responses remain visible |
| 10 | Screens calculate full-catalogue totals, local search, lifetime progress, week/month summaries in memory | APIs provide paginated records rather than every screen aggregate. A large catalogue/history requires many startup reads | Approve aggregate/search endpoints or paginated UI interaction. Current integration consumes every page and does not invent counts |
| 11 | Report dialog exists but no visible report button is emitted by the current question card | Report submission endpoint and form handler work; entry point is absent | Choose report action placement |
| 12 | Home ad slot, reminder delivery and report notifications imply future services | No ad-management, background push or report status workflow exists; reminder settings only persist | Decide those features separately; existing placeholders/disabled controls remain |
| 13 | Existing local backups contain array-index identities; completed historical items may no longer be published | Cloud uses stable database IDs and immutable attempt snapshots | Do not import local backups by array index. Unpublished activity gets an unavailable-question label until its result detail is opened; results retain snapshot text |
| 14 | Subject/chapter/revision buttons can select an unlimited question list | Custom practice attempts accept at most 100 questions; paper attempts keep their full ordered paper | Use existing Custom practice for smaller sessions or agree on chunking; no silent truncation is applied |

The API's study `solutions=1` resource deliberately exposes study answers; this app is not a proctored exam security boundary. Practice and result rendering still uses attempt snapshots and server scores rather than deriving a score from mutable catalogue data.

## Local setup and verification

Run Laravel on `127.0.0.1:8000` and Next.js with `npm run dev`. Set `API_SERVER_URL` for another backend before starting/building Next.js. All browser requests use the Next.js origin so cookie and CSRF handling share one origin. A login performed in a separate HTTP client's cookie jar does not sign the browser in; missing auth UI remains item 1.

Checks performed:

- 18 passing frontend regression and mocked API tests (including expired-attempt recovery and failed note autosave): catalogue/empty states, server IDs, snapshots/scoring, CSRF retry, unauthenticated isolation, failed-write retention, stable retry IDs, profile and routine mappings.
- Live local Next.js → Laravel smoke: disposable OTP identity, cookie/CSRF, catalogue, profile write, reading completion, question bookmark, attempt/answer/submit, history, routine write and reload persistence. Only the temporary test account/data were removed afterward.
- Browser inspection: existing desktop Home/navigation/cards and disconnected-session feedback. Authenticated browser interaction and mobile visual parity are not claimed by the HTTP/VM tests.

No commit, push or deployment was performed for this integration task.
