# API integration

Base URL: `http://127.0.0.1:8000/api/v1`. Send `Accept: application/json` and cookies on every request. The OpenAPI file inventories all routes, authorization and common errors; it is not a complete response-schema/code-generation contract.

## Passwordless authentication

```typescript
const base = 'http://127.0.0.1:8000/api/v1';
let csrf = '';

async function refreshCsrf() {
  const response = await fetch(`${base}/auth/csrf`, { credentials: 'include' });
  if (!response.ok) throw new Error('Unable to initialize session');
  csrf = (await response.json()).csrf_token;
}

async function mutate(path: string, method: string, body?: unknown) {
  const response = await fetch(`${base}${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': csrf,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.message), { status: response.status, errors: result.errors });
  return result;
}

await refreshCsrf();
await mutate('/auth/otp/request', 'POST', { email: 'student@example.com', name: 'Student Name' });
// Obtain the six-digit code from the user, then:
// await mutate('/auth/otp/verify', 'POST', { email, code, name });
// await refreshCsrf();
```

OTP request returns 202. Registration sends `email` and `name` (1–80 characters); login sends only `email`. The registration name is retained in the current session, scoped to that email, for 10 minutes. Verification uses `email` and six-digit `code`; the saved name is applied only to a newly created user. Optional verification `name` remains supported. Existing users keep their name and account data. The same passwordless flow registers and logs in. Codes last 10 minutes, have a 60-second resend cooldown and five guesses. There is no password endpoint. Keep OTPs out of analytics and browser storage.

Google: GET `/auth/google/nonce`; pass its nonce and client_id to Google Identity Services, then POST `/auth/google` with `{ "credential": "<Google ID token>" }`. Verified Gmail/Workspace identities automatically reuse the matching existing email account and attach Google without replacing its profile. An unlinked non-Google-hosted email must first sign in by OTP, then use the same Google action with a fresh credential; linking is automatic in that authenticated session. A conflicting Google subject returns 409. The explicit `/auth/google/link` route remains only for compatibility. Refresh CSRF after login/logout. POST `/auth/logout` ends the session. Sessions default to 30 days of inactivity (`SESSION_LIFETIME=43200`) with a persistent HttpOnly cookie, and renew with activity; OTP and nonce still expire after 10 minutes.

## Screen reads

| Route | Parameters and purpose |
| --- | --- |
| GET `/dashboard` | Combined current user, preferences, reading, active attempt, recent results, weaknesses and today's routine |
| GET `/subjects` | Subject catalogue |
| GET `/subjects/{subject}` | Subject and chapters |
| GET `/chapters/{chapter}` | Topics, lesson availability and user completion |
| GET `/lessons/{lesson}` | Sections, reading progress, note, bookmark and navigation |
| GET `/questions` | Optional subject_id, chapter_id, topic_id, exam_id, status=all/new/wrong/skipped/due/saved/mistakes; optional q/current_affair_id/solutions |
| GET `/exams`, `/exams/{exam}` | Exam tracks and subject syllabus |
| GET `/papers/filters` | Optional institute_id and post_id; dependent filter options |
| GET `/papers` | Optional institute_id, post_id, exam_id, year |
| GET `/papers/{paper}` | Ordered questions; solutions=1 explicitly includes answers |
| GET `/current-affairs` | Required month=YYYY-MM |
| GET `/attempts` | Current user's paginated history |
| GET `/attempts/{attempt}` | UUID; attempt and snapshot items; finalizes expired tests |
| GET `/revision` | Required type=lessons/questions |
| GET `/routine` | Required from/to=YYYY-MM-DD; at most 31 days apart |
| GET `/me` | Current user and preferences |

Paginated student lists accept `page` and `per_page` (1–50, default 20). Laravel pagination returns `data`, `current_page`, `last_page`, `total` and links. Read methods returning composite objects retain their named fields; do not assume every endpoint has the same envelope. Question catalogue hides correct options by default; `solutions=1` explicitly includes study answers. Paper solutions are an intentional study resource, not a secure proctoring boundary.

## Study and attempts

- PUT `/lessons/{lesson}/progress`: `{ "position": 120, "completed": false }`. Position is a client reading offset, 0–1,000,000; use a consistent unit and debounce saves.
- PUT `/lessons/{lesson}/note`: `{ "body": "Personal note" }`, at most 4,000 characters; null clears it.
- PUT `/lessons/{lesson}/bookmark` or `/questions/{question}/bookmark`: `{ "saved": true }`.
- POST `/routine`, PUT `/routine/{task}`: `date`, `title` (160 characters), `minutes` (1–480), `completed` boolean. DELETE removes an owned task.

POST `/attempts`:

```json
{
  "request_id": "bdb08faf-821c-42d5-a10d-a958e752c1db",
  "mode": "practice",
  "topic_id": 1,
  "status": "wrong",
  "count": 20
}
```

Generate one UUID per intended attempt and reuse it on retries. Filters also support subject_id, chapter_id, exam_id and current_affair_id. Count is 1–100. A paper_id selects the whole paper and forces exam mode with stored rules; other selection filters are ignored. For chapter tests send mode=exam, chapter_id and chapter_test=true; all topic lessons must be completed. Only one active attempt is allowed per user. Empty selections return 422.

PUT `/attempts/{attempt}/answers` accepts up to 100 entries:

```json
{ "answers": [{ "item_id": 123, "choice": 0 }, { "item_id": 124, "choice": null }] }
```

Use snapshot item IDs, not question IDs. Choices are zero-based; null means unanswered. The response includes only those items plus attempt metadata. Practice answers become immutable once revealed. POST `/attempts/{attempt}/submit` is idempotent and returns scored snapshots. Clients cannot set score, duration or penalty. Persist pending answer batches before submitting; do not rely on a browser unload request. Timed tests reject late saves and finalize from previously saved answers.

PUT `/me` requires name, daily_minutes (5–480), daily_questions (1–500), theme (light/dark/system), font_size (standard/large/extra), reminder boolean, reminder_time (HH:mm), timezone (IANA). Optional exam_id and target_date (YYYY-MM-DD) may be null. Email, role and verification cannot be changed here. Preferences store intended reminders; this API does not send scheduled reminder notifications.

## Admin content

All `/admin` routes require an active verified administrator. GET lists accept per_page up to 100. Content writes replace the submitted child sections/options/question assignments atomically.

Catalogue GET/POST `/admin/catalogue/{resource}`, PUT/DELETE `/admin/catalogue/{resource}/{id}` allow only subjects, chapters, topics, exams, institutes, posts. All require title. Subjects/exams/institutes require unique slug; subjects/chapters/topics require position. Chapters require subject_id (optional overview); topics require chapter_id; posts require institute_id. PUT `/admin/exams/{exam}/syllabus` takes `subjects: [{subject_id, syllabus}]` and replaces the syllabus.

GET `/admin/content/{resource}` and `/{id}` allow lessons, questions, papers and current_affairs. POST `/admin/{resource}`, PUT `/admin/{resource}/{id}` use:

| Resource | Required fields |
| --- | --- |
| lessons | topic_id, summary, reading_minutes (1–240), published, is_demo, sections (1–50) |
| questions | topic_id, text, explanation, source, verified, is_demo, published, options (2–10) |
| papers | title, exam_id, post_id, year, stage, source, verified, is_demo, published, duration_minutes (1–360), correct_marks, wrong_penalty, question_ids (1–500 distinct ordered IDs) |
| current-affairs | title, body, source, publication_date (YYYY-MM-DD), is_demo, published, question_ids (0–50) |

Sections require title, body, kind (explanation/example/formula/important/mistake), optional published media_file_id. Options require text and is_correct; exactly one must be correct. Marks support at most two decimal places, correct_marks=0.01–100 and wrong_penalty=0–100. Demo material cannot be verified. Published real questions/papers require verification; real papers cannot include demo questions. Referenced catalogue deletion returns 409; unpublish content instead.

GET/POST `/admin/media` lists/uploads files. Upload multipart `file` (JPEG/PNG/WebP/PDF, up to 10 MiB). PUT `/admin/media/{media}` with published boolean controls student access. GET `/media/{media}/download` streams authorized files. Use FormData without manually setting its Content-Type boundary.

## Errors and retry behavior

401 requires login, 403 denies role/account access, 404 hides unavailable/unowned resources, 409 indicates a state conflict, 419 requires a fresh CSRF session, 422 returns validation message/errors, 429 requires backing off, and Google without configuration returns 503. Do not blindly retry OTP requests or submissions with changed UUIDs. All API responses are private/no-store. Database timestamps use UTC; format them using user timezone.

### Device metadata and session tracking

OTP verification and Google login accept an optional `device` object:

```json
{
  "device": {
    "device_id": "06ccf486-b054-47f2-930c-a699ac08b393",
    "platform": "android",
    "device_name": "Pixel",
    "os_version": "16",
    "app_version": "1.0.0"
  }
}
```

Send this alongside `email`/`code` or `credential`. Persist a random UUID per installation; use `web`, `android`, or `ios` for platform. Device name, OS version, and app version are optional. Metadata is validated before consuming an OTP or Google nonce. Older clients without metadata remain compatible: the server assigns a session-scoped installation UUID with platform `web`; these clients cannot reliably identify an installation after logout.

Successful login upserts a device per user and installation UUID, preserving first login and updating metadata and last login. Each login gets a separate server-side tracking reference stored inside the authenticated session. API activity updates IP, user agent, last seen and the 30-day idle expiry. Logout marks only that tracking session revoked. Expired rows remain as history; active tracking rows have `revoked_at IS NULL` and `expires_at > NOW()`. Tracking is observational: Laravel's existing session authentication remains authoritative. Existing sessions created before this migration are tracked after their next login.

No device count limit or device-management endpoints are enabled. Client-supplied metadata is untrusted and is not proof of device identity. Browser storage reset or reinstall may produce a new installation UUID. The Student Web demo is not yet connected to backend authentication; this change does not alter its UI.

## Complete frontend field mapping

See [Frontend coverage](FRONTEND-COVERAGE.md) for all persisted frontend properties, additive payloads, new endpoints, derived values, and device-local boundaries.
