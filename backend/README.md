# Prosthuti API

Laravel 13 / PHP 8.3+ / MySQL 8.4+, built independently of the existing web UI. No frontend conversion, deployment or remote storage upload is performed by this setup. Composer dependencies are locked. There is no API password registration route.

## Local setup

See [environment management](docs/ENVIRONMENTS.md) for local/staging/production templates, secrets, config caching and release steps.

```sh
cd backend
cp .env.example .env # Only for a new checkout; preserve existing files.
cp .env.local.example .env.local
cp .env.testing.example .env.testing
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --host=127.0.0.1 --port=8000
```

Configure your local MySQL connection in `.env.local` before migrating. The local workspace uses a dedicated MySQL 8.4 instance in `storage/mysql`, socket `/tmp/prosthuti-mysql.sock`, and separate `prosthuti` and `prosthuti_test` databases. TCP and MySQL X listeners are disabled. Database files and backups are ignored by Git. Restart the local instance after reboot with:

```sh
/opt/homebrew/opt/mysql@8.4/bin/mysqld --no-defaults --datadir="$PWD/storage/mysql" --socket=/tmp/prosthuti-mysql.sock --pid-file="$PWD/storage/mysql/server.pid" --log-error="$PWD/storage/mysql/server.log" --skip-networking --mysqlx=OFF --daemonize
```

The local `prosthuti` database account has privileges only on these two development databases. For another machine, create both databases with `utf8mb4` and set DB_HOST, DB_PORT, DB_SOCKET, DB_USERNAME and DB_PASSWORD as appropriate. Clear DB_SOCKET when using TCP. Use dedicated credentials and backups in production. Session timezone is fixed to `+00:00`; user preferences carry display timezone. Laravel's document root must be `backend/public`.

The previous local database was backed up to ignored `storage/backups/pre-mysql.dump` before switching; it contained no users, attempts or reading progress. Its stopped data directory is retained only for recovery. No active PostgreSQL connection remains in the application.

Seed data is explicitly synthetic/unverified. It includes 39 topic lessons, question options, 4 exam tracks, 8 papers and dated sample affairs. The seed command refuses production, creates no administrator, and leaves existing catalogues unchanged. Never classify these samples as historical papers or official syllabuses.

## Expanded local preview content

Run `php artisan db:seed --class=PreviewContentSeeder` to add sample content to an existing local catalogue without resetting the database. The seeder also initializes the base demo catalogue on a fresh database. It creates four sample papers per institution across nine institution categories, with six to nine linked questions per new paper, plus four ICT chapters and lessons, 24 technical questions, four current-affairs reading exercises with questions, and six notices. Existing demo papers remain available.

The command is restricted to local/testing environments. Repeating it preserves existing records and avoids duplicates. All new questions, papers, lessons and affairs remain synthetic demo content; notices explicitly identify themselves as samples. Account activity, attempts and personal study progress are not fabricated. The original `DatabaseSeeder` remains unchanged for the baseline API test fixtures.

## Email OTP and Google authentication

The intended Next.js web and Admin clients use Laravel's encrypted HttpOnly session cookie, not bearer tokens in browser localStorage. Use one consistent hostname (`localhost` or `127.0.0.1`) and `credentials: 'include'`. Both clients can share the same API session; authorization is always enforced by the server.

1. `GET /api/v1/auth/csrf` returns `csrf_token` and initializes the cookie.
2. Send `X-CSRF-TOKEN` on POST/PUT/DELETE, alongside the cookie and `Accept: application/json`.
3. `POST /auth/otp/request` with `email` and registration `name` (1–80 characters) queues no account creation. Login may omit `name`. The registration name is retained in the current session for that email until verification. The configured mail transport sends a six-digit code.
4. `POST /auth/otp/verify` with `email` and `code` creates/verifies a student using the saved registration name (an optional verification `name` remains supported) and rotates the session ID.
5. Refetch `/auth/csrf` after login/logout because the CSRF token changes with session regeneration.

Codes expire after 10 minutes, are hashed at rest, allow five attempts, and are consumed once. Resend cooldown is 60 seconds. Sending is limited by IP and normalized email; guessing has an additional IP limit. Failed guesses commit their counter. Use SMTP/API mail credentials for actual delivery. The default local `log` transport writes test messages to ignored `storage/logs/laravel.log`; it does not deliver emails. Do not use log transport or `APP_DEBUG=true` for real users. Mail sending is synchronous; configure a bounded SMTP timeout. A delivery failure rolls back the newly issued code, allowing retry.

For Google, set `GOOGLE_CLIENT_ID` and register your actual frontend origin in Google Cloud. `GET /auth/google/nonce` returns the client ID, a one-time nonce and a CSRF token together. Supply that nonce to Google Identity Services. Send its ID credential to `POST /auth/google`. The backend validates RSA signature against cached Google keys, issuer, audience/authorized party, expiry, issued-at, verified email and nonce. Tokens issued for another application are rejected.

Google sign-in reuses an existing account for a verified Gmail/Workspace email and automatically attaches the Google identity, preserving the account's name, role and progress. A new identity creates a student. An unlinked non-Gmail identity without a hosted-domain claim needs a matching OTP-authenticated session first, then the same Google sign-in action performs linking. Disabled accounts and conflicting Google identities are rejected. Existing linked identities are recognized by Google's stable subject ID, not a mutable email. The old explicit `/auth/google/link` endpoint remains for compatibility but is not shown in the simplified Postman authentication folder.

Grant admin access only to an existing active verified account, from your trusted terminal:

```sh
php artisan app:make-admin student@example.com
```

Registration payloads cannot set role, verification state or active status. All admin routes enforce the current database role. In the selected profile, set `SESSION_SECURE_COOKIE=true` with HTTPS and configure exact `FRONTEND_URLS` for future deployment. No wildcard credentialed CORS is enabled.

Login sessions default to **30 days of inactivity** (`SESSION_LIFETIME=43200`), persist across browser restarts, and renew with activity. Logout invalidates the session immediately. OTP and Google nonce lifetimes remain 10 minutes. The API uses HttpOnly session cookies; clients do not manually copy bearer tokens.

## Data structure and ownership

See the [complete database schema and relationship diagrams](docs/DATABASE.md) for all 42 tables, column definitions, keys and deletion rules.

- Catalogue: subjects → chapters → topics → lessons → lesson_sections.
- Questions: questions → question_options; one correct choice, source, demo/verification/publication flags.
- Exam identity: exams, institutes → posts → papers, exam_subject and paper_question pivots. A question can appear in multiple papers without duplicating the original question.
- Study: reading_progress, lesson_notes, separate lesson/question bookmarks, user_preferences and routine_tasks.
- Assessment: attempts and immutable attempt_items snapshots; question_progress keeps each user's latest status for indexed new/wrong/skipped filtering.
- Media and dated content: media_files, current_affairs and affair_question.
- Auth: users, email_otps, social_accounts and framework session/cache tables.

Foreign keys protect referenced catalogue records. Sensitive data is always scoped to the authenticated user. Content editing uses explicit allowlists and validated payloads. Drafts are not returned by student catalogue APIs. Real questions/papers require verification before publication; demo material cannot be marked verified. Referenced records return 409 on destructive conflicts; use draft/unpublish for lesson/question/paper archival.

## API contract

See [OpenAPI specification](docs/openapi.json) and [integration examples](docs/API.md). Base path: `/api/v1`.

An importable [Postman collection and local environment](docs/postman/README.md) provide 136 request entries under Admin, Web and Mobile with five visible authentication actions per client. CSRF and Google nonce are internal helper calls; the compatibility-only Google-link endpoint is omitted. The backend still has 62 route operations. See the [audited API inventory](docs/postman/API-INVENTORY.md).

Screen-shaped reads avoid chains of small HTTP calls: chapter overview includes topics and completion; lesson includes sections, note, bookmark, progress and chapter navigation; dashboard includes user, preferences, recent results, active attempt and today's routine. Large lists are paginated. Questions/options are loaded in a fixed number of reads, not one query per question. FK and composite indexes support the actual publication, identity, user/status and date filters. Shared catalogue output is deliberately not cached across users.

Attempts are created with a client UUID `request_id`. Retrying the same ID returns the same attempt. Only one active attempt is permitted per user. Paper tests use the full ordered paper; custom practice uses up to 100 matched questions in stable ID order. Paper size is capped at 500. General mocks use server-owned defaults (20 minutes, +1 correct, no penalty); paper rules are admin-controlled. Client-supplied scores/timers are ignored. Chapter tests require completion of every topic lesson.

Save up to 100 answers in one PUT. The response contains only the changed item snapshots plus attempt metadata. Exam answers and explanations remain hidden until submission. Practice reveals only answered items and prevents changing revealed answers. Submission is transactional/idempotent, calculates marks in integer hundredths, and updates progress in bulk. Snapshot text/options/rules preserve historical results after content edits. API access finalizes expired attempts; the scheduler handles abandoned timed tests:

```sh
php artisan schedule:work
```

Reading positions and notes are stored on the server and are available across authenticated devices. Existing browser-local data is not automatically imported. Frontend offline queue/reconciliation and web migration are separate work; this backend does not overwrite the existing local frontend.

## Files: local and Cloudflare R2

`MEDIA_DISK=local` stores private files under `storage/app/private`. Admins upload JPEG/PNG/WebP/PDF up to 10 MiB; PHP/web-server upload limits must be at least that size (`upload_max_filesize=10M`, `post_max_size=12M`). Uploads start unpublished. After admin publication they may be attached to lesson sections and downloaded by authenticated students. File paths are server-generated and are not accepted from clients. Downloads are authorized and streamed by the API, without public bucket URLs.

For R2 set `MEDIA_DISK=r2`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` and `R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com`. The adapter uses the private S3-compatible API. Never commit these values. Live R2, Google OAuth and real email delivery require your account configuration and have not been exercised using real credentials.

## Validation

```sh
php artisan test
vendor/bin/pint --test
composer validate --strict
```

Tests use the dedicated MySQL `prosthuti_test` database configured in `phpunit.xml`; they migrate/roll back test data. Never point tests at an existing production/development database. They cover OTP lifecycle, access control, cryptographic Google validation with local keys, CSRF, content validation, snapshot integrity, deadlines, ownership, scoring/idempotence, user progress, files and bounded question-list query counts. External services are faked, not contacted. Query-count tests are not a production-scale latency/load benchmark.

References: [Laravel session authentication](https://laravel.com/framework/docs/13.x/authentication), [Google server-side identity verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

## Frontend coverage

The [field-by-field coverage contract](docs/FRONTEND-COVERAGE.md) documents the additive metadata, preferences, reports, routine plans, attempt resume/guess state, revision scheduling, notices and activity APIs. Student Web remains browser-local until separately integrated. Apply the additive coverage migration before using these fields.
