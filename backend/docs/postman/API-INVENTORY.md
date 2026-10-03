# Backend API inventory

Verified from `php artisan route:list --path=api/v1 --json` and controller validation on 2026-10-03.

There are **62 method/path operations** under `/api/v1`: **42 authentication/student operations** and **20 admin operations**. HEAD aliases are not counted separately. The collection has **136 entries** under **Admin (56)**, **Web (40)** and **Mobile (40)**, covering 59 operations directly and CSRF/Google nonce internally. The compatibility Google-link route remains omitted. The framework health check `GET /up` is outside this API collection.

Authentication uses cookie sessions and CSRF, not bearer tokens. All catalogue reads require an active verified user. The five guest-accessible operations are CSRF, OTP request/verify, Google nonce and Google sign-in.

| Method | Path | Access | Handler |
| --- | --- | --- | --- |
| GET | `/api/v1/activity` | Active verified user | `PreparationController@activity` |
| GET | `/api/v1/admin/catalogue/{resource}` | Admin | `AdminCatalogueController@index` |
| POST | `/api/v1/admin/catalogue/{resource}` | Admin | `AdminCatalogueController@save` |
| PUT | `/api/v1/admin/catalogue/{resource}/{id}` | Admin | `AdminCatalogueController@save` |
| DELETE | `/api/v1/admin/catalogue/{resource}/{id}` | Admin | `AdminCatalogueController@destroy` |
| GET | `/api/v1/admin/content/{resource}` | Admin | `AdminContentController@index` |
| GET | `/api/v1/admin/content/{resource}/{id}` | Admin | `AdminContentController@show` |
| POST | `/api/v1/admin/current-affairs` | Admin | `AdminContentController@affair` |
| PUT | `/api/v1/admin/current-affairs/{id}` | Admin | `AdminContentController@affair` |
| PUT | `/api/v1/admin/exams/{exam}/syllabus` | Admin | `AdminCatalogueController@syllabus` |
| POST | `/api/v1/admin/lessons` | Admin | `AdminContentController@lesson` |
| PUT | `/api/v1/admin/lessons/{id}` | Admin | `AdminContentController@lesson` |
| GET | `/api/v1/admin/media` | Admin | `MediaController@index` |
| POST | `/api/v1/admin/media` | Admin | `MediaController@store` |
| PUT | `/api/v1/admin/media/{media}` | Admin | `MediaController@publish` |
| POST | `/api/v1/admin/notices` | Admin | `AdminContentController@notice` |
| PUT | `/api/v1/admin/notices/{id}` | Admin | `AdminContentController@notice` |
| POST | `/api/v1/admin/papers` | Admin | `AdminContentController@paper` |
| PUT | `/api/v1/admin/papers/{id}` | Admin | `AdminContentController@paper` |
| POST | `/api/v1/admin/questions` | Admin | `AdminContentController@question` |
| PUT | `/api/v1/admin/questions/{id}` | Admin | `AdminContentController@question` |
| GET | `/api/v1/attempts` | Active verified user | `AttemptController@index` |
| POST | `/api/v1/attempts` | Active verified user | `AttemptController@store` |
| GET | `/api/v1/attempts/{attempt}` | Active verified user | `AttemptController@show` |
| PUT | `/api/v1/attempts/{attempt}/answers` | Active verified user | `AttemptController@answers` |
| PUT | `/api/v1/attempts/{attempt}/progress` | Active verified user | `AttemptController@progress` |
| POST | `/api/v1/attempts/{attempt}/submit` | Active verified user | `AttemptController@submit` |
| GET | `/api/v1/auth/csrf` | Guest/session | `Closure` |
| POST | `/api/v1/auth/google` | Guest/session | `AuthController@google` |
| POST | `/api/v1/auth/google/link` | Active verified user | `AuthController@linkGoogle` |
| GET | `/api/v1/auth/google/nonce` | Guest/session | `AuthController@googleNonce` |
| POST | `/api/v1/auth/logout` | Active verified user | `AuthController@logout` |
| POST | `/api/v1/auth/otp/request` | Guest/session | `AuthController@requestOtp` |
| POST | `/api/v1/auth/otp/verify` | Guest/session | `AuthController@verifyOtp` |
| GET | `/api/v1/chapters/{chapter}` | Active verified user | `CatalogueController@chapter` |
| GET | `/api/v1/current-affairs` | Active verified user | `CatalogueController@affairs` |
| GET | `/api/v1/dashboard` | Active verified user | `PreparationController@dashboard` |
| GET | `/api/v1/exams` | Active verified user | `CatalogueController@exams` |
| GET | `/api/v1/exams/{exam}` | Active verified user | `CatalogueController@exam` |
| GET | `/api/v1/lessons/{lesson}` | Active verified user | `CatalogueController@lesson` |
| PUT | `/api/v1/lessons/{lesson}/bookmark` | Active verified user | `PreparationController@lessonBookmark` |
| PUT | `/api/v1/lessons/{lesson}/note` | Active verified user | `PreparationController@note` |
| PUT | `/api/v1/lessons/{lesson}/progress` | Active verified user | `PreparationController@progress` |
| GET | `/api/v1/me` | Active verified user | `ProfileController@show` |
| PUT | `/api/v1/me` | Active verified user | `ProfileController@update` |
| GET | `/api/v1/media/{media}/download` | Active verified user | `MediaController@download` |
| GET | `/api/v1/notices` | Active verified user | `CatalogueController@notices` |
| GET | `/api/v1/papers` | Active verified user | `CatalogueController@papers` |
| GET | `/api/v1/papers/filters` | Active verified user | `CatalogueController@paperFilters` |
| GET | `/api/v1/papers/{paper}` | Active verified user | `CatalogueController@paper` |
| GET | `/api/v1/questions` | Active verified user | `CatalogueController@questions` |
| PUT | `/api/v1/questions/{question}/bookmark` | Active verified user | `PreparationController@questionBookmark` |
| POST | `/api/v1/questions/{question}/reports` | Active verified user | `PreparationController@report` |
| GET | `/api/v1/reports` | Active verified user | `PreparationController@reports` |
| GET | `/api/v1/revision` | Active verified user | `PreparationController@revision` |
| GET | `/api/v1/routine` | Active verified user | `PreparationController@routine` |
| POST | `/api/v1/routine` | Active verified user | `PreparationController@saveTask` |
| PUT | `/api/v1/routine-plan` | Active verified user | `PreparationController@savePlan` |
| PUT | `/api/v1/routine/{task}` | Active verified user | `PreparationController@saveTask` |
| DELETE | `/api/v1/routine/{task}` | Active verified user | `PreparationController@deleteTask` |
| GET | `/api/v1/subjects` | Active verified user | `CatalogueController@subjects` |
| GET | `/api/v1/subjects/{subject}` | Active verified user | `CatalogueController@subject` |

## Allowed generic resources

- `/admin/catalogue/{resource}`: `subjects`, `chapters`, `topics`, `exams`, `institutes`, `posts`.
- `/admin/content/{resource}`: `lessons`, `questions`, `papers`, `current_affairs`, `notices`. Reads use the underscore; current-affairs writes use the hyphen.

## Integration boundaries

- Student Web remains browser-local; backend coverage does not wire its screens to the API.
- See [Frontend coverage](../FRONTEND-COVERAGE.md) for every mapped field, derived value and device-local state. The extra font size, low-data/streak settings, routine task kinds/counts, reports, notices, resume positions and revision schedule now have backend contracts.
- Question text search is available through `GET /questions?q=...`; no cross-resource global search endpoint is implied.
- Automatic browser-backup import, offline reconciliation and background notification delivery remain outside backend coverage. Existing paginated reads can supply export data.
- Real email/Google/R2 require environment configuration and are not exercised by local contract tests. Demo content remains synthetic/unverified.

See [API.md](../API.md) for authentication and integration behavior.
