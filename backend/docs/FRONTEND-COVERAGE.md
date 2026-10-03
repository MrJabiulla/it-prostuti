# Frontend data coverage

Audited against `src/student/types.d.ts`, `app.ts`, `study.ts`, and `learning.ts`. The backend supports the frontend's persisted business information through the mappings below. This is backend readiness, not a completed frontend integration: Student Web still uses local fixtures and localStorage. No existing browser history is uploaded, imported, or replaced by this change.

## Field mapping

Database IDs replace browser array indexes and synthetic string IDs. An integration adapter must map those identities explicitly; never assume that frontend question/subject index 0 is database ID 0. Dates/timestamps returned by the API must be converted to the frontend's milliseconds and local date keys. Boolean database values may serialize as 0/1; normalize them to booleans.

| Frontend fields | Backend representation and read/write route |
| --- | --- |
| Subject `name`, `bengali`, `short`, `symbol`, `color` | Subject `title`, `bengali`, `short`, `symbol`, `color`; optional `english`; admin catalogue writes and student subjects reads |
| Chapter `id`, `title`, `english`; topic `name`, `english` | Database IDs, `title`, `english`, optional `bengali`; hierarchy uses `subject_id` and `chapter_id` |
| Subject `topics` | Derived list from chapter topics, not a second catalogue copy |
| Question `id`, `subject`, `chapter`, `topic`, `text` | `id`, `subject_id`, `chapter_id`, topic title and `topic_id`, `text` on question reads |
| Question `options`, `answer`, `explanation` | Ordered option objects; correct option position from `is_correct`; study reads require `solutions=1`; attempt views reveal according to existing practice/exam rules |
| Question `paperId`, `exam`, `institute`, `post`, `year`, `stage` | `papers[]` metadata on question reads; intentionally plural because a question can occur in several papers |
| Question `source`, `verified`, `demo`, `affairId` | `source`, `verified`, `is_demo`, `affair_ids[]`; explicit mapping supports multiple affairs without dropping links |
| Paper title/year/stage/source/verification/rules/questions | Existing paper APIs, `duration_minutes`, `correct_marks`, `wrong_penalty`, ordered question pagination |
| Exam name/institute/post/subjects | Exam title and syllabus subject IDs; institute/post relations through published papers and paper filters |
| Lesson `readTime`, `summary`, `demo`, points `label/desc` | `reading_minutes`, `summary`, `is_demo`, ordered sections `title/body` |
| Reading `done`, `position`, `note`, `saved` | `completed_at`, reading offset, lesson note, lesson bookmark; lesson detail returns all four |
| Profile `name`, `exam`, `minutes`, `date`, `dailyGoal`, `focus` | User `name`; preferences `exam_id`, `daily_minutes`, `target_date`, `daily_questions`, `focus_subject_ids` |
| Preferences `theme`, `themeChosen`, `fontSize`, `lowData`, `reminder`, `reminderTime`, `streakAlert` | `theme`, `theme_chosen`, `font_size`, `low_data`, `reminder`, `reminder_time`, `streak_alert`; explicit `timezone` supports local days |
| `readerSize`, `lastLesson`, `selectedPaper` | `reader_size`, `last_lesson_id`, `selected_paper_id` via `/me` |
| Routine plan `goal`, `minutes`, `custom` | `routine_plans`, keyed by authenticated user/date; PUT `/routine-plan`, GET `/routine` includes `plans` |
| Routine task `id`, `title`, `kind`, `questions`, `minutes` | Server `id` plus stable frontend `client_id`, `title`, `kind`, `questions`, `minutes`, `position`; numeric frontend subject kind becomes `kind=subject` plus mapped `subject_id` |
| `completedTasks` | Task `completed_at`; plan replacement preserves IDs by `id` or `client_id`; completion is also written when a linked attempt finishes |
| Session `ids`, `title`, `mode`, `answers`, `startedAt`, `deadline`, `endedAt`, `paperId`, `rules` | Ordered attempt items, title/mode, selected answers, `started_at`, `expires_at`, `submitted_at`, `paper_id`, marks/penalty |
| Session `index`, `page`, `routineTask` | `current_index`, `current_page`, `routine_task_id`; the client maps its date/task key to a server task ID |
| Answer `id`, `choice`, `correct`, `guess`, `at`, `day` | Item `question_id`, `selected_option`, `is_correct`, `guess`, `answered_at`; `/activity` supplies timestamp fallback and preference-timezone day for submitted history |
| `attempts`, `history`, `lastResult` | `/activity` for per-question history; `/attempts` plus detail for session history; derive latest submitted result from history, not a duplicate stored object |
| `saved` | Question bookmarks; `/revision?type=questions&status=saved` and `/questions?status=saved` |
| `reviews[id].due/level` | `question_reviews.due_at/level`; read via `/revision`; changed by server-scored submission, not client-supplied scores |
| Reports `id`, `type`, `detail`, `at` | `question_id`, `type`, `detail`, `created_at`; server report has its own `id`; POST `/questions/{question}/reports`, GET `/reports` |
| WeakPoint subject/chapter/topic/total/correct; calendar/streak/accuracy | Derive from paginated `/activity` and catalogue hierarchy; `/dashboard.subjects` retains its existing latest-question-status summary, not lifetime attempt accuracy |
| Affair `id`, `month`, `date`, `title`, `text`, `source`, question/options/answer/questionId | `id`, month derived from `publication_date`, `title`, `body`, `source`, linked `questions[]`; `category` supports Home labels; solutions require opt-in |
| Home notice title/meta | Published `/notices`; admin creates/updates notices and can unpublish them |
| `lastReminder`, offline installation/cache, open tabs, transient form/filter state | Intentionally device-local UI state; a reminder shown on one installation must not suppress another installation. No cloud record is needed to preserve the existing behavior |

Display-only copy, CSS, icons, navigation labels, synthetic Home fallback counters, and disabled future features are not database records. No leaderboard/community system or push delivery is implied by a notice's text. Backup export can assemble the mapped records through paginated reads; automatic local-backup import and offline conflict reconciliation remain frontend integration work.

## Additive contracts

Existing request bodies remain accepted. Optional new fields are preserved when omitted from updates. Catalogue metadata for existing records is nullable; populate it through the admin APIs. New demo seeds copy the metadata from the supplied fixtures without replacing an existing catalogue.

- PUT `/me`: optional `focus_subject_ids` (up to 100 distinct existing subject IDs), `low_data`, `streak_alert`, `theme_chosen`, `reader_size` (16/18/20/24), nullable published `last_lesson_id` and `selected_paper_id`. `font_size` now accepts `standard`, `large`, `extra`. Send the existing required profile fields too. Focus IDs are returned as an array, not encoded JSON.
- Catalogue admin writes: optional `english`, `bengali` for subjects/chapters/topics; subject `short` (80), `symbol` (40), hexadecimal `color` (#RGB or #RRGGBB). Chapter/topic reads return language metadata. Primary `title` remains unchanged.
- GET `/questions`: optional `q` (literal substring of question text, max 200), `current_affair_id`, `solutions`, and status `all/new/wrong/skipped/due/saved/mistakes`. Metadata uses batched queries. Default reads hide correct answers; explicit study solutions are not a proctoring security boundary.
- GET `/current-affairs`: required `month=YYYY-MM`, optional `solutions=1`; linked published questions/options are included. Admin affair writes accept nullable `category` (100).
- POST `/attempts`: optional `title`, owned `routine_task_id`, distinct ordered `question_ids` (1–100), `subject_ids` (1–100), and revision/bookmark status filters. Explicit IDs must all match published content and the supplied filters; invalid selections fail rather than silently shrink. Paper selection retains server-owned full-paper ordering, mode and rules. General exams retain existing server defaults. `question_ids` and subject filters do not override paper rules.
- PUT `/attempts/{attempt}/answers`: optional boolean `guess` per answer. Revealed practice answers cannot change either choice or guess. Scores, correctness and deadlines remain server-owned.
- PUT `/attempts/{attempt}/progress`: required `current_index`, `current_page` (zero-based and less than item count). Only the owner can save an active, unexpired attempt.
- Submission schedules wrong/skipped/guessed questions immediately at level 0. Correct unguessed review advances levels 1–4 with delays 1/3/7/21 days, matching the current frontend algorithm. Repeated submit does not advance twice. Existing wrong/skipped progress is backfilled by migration. Historical guessed answers that were never stored cannot be reconstructed.
- GET `/revision?type=questions`: optional status `all/due/saved/mistakes`; responses include `due_at`, `level`. `mistakes` includes previously scheduled questions even after a correct revision. Default retains bookmarks and existing wrong/skipped support.
- POST `/routine`, PUT `/routine/{task}`: optional `client_id`, `kind=review/mixed/subject`, `subject_id`, `questions` (0–500), `position` (0–19). Subject kind requires a subject ID. Existing title/date/minutes/completed remain required.
- PUT `/routine-plan`: atomic full replacement of one day's tasks and plan metadata. Required `date`, `goal`/`minutes` (0–10000), `custom`, `tasks` (0–20). Each task requires distinct `client_id`, `title`, `minutes`, `completed`; optional server `id` must belong to the same user/day. Omitting a task removes it; other dates remain unchanged. Send current completion values when editing. Empty plans are supported. Aggregate metadata is a saved target snapshot and is not rewritten by individual task edits.
- GET `/activity`: paginated submitted question history, optional `from`/`to` local dates, `per_page` 1–100 (default 50). Includes guessed/skipped/correct answers and topic/chapter/subject IDs. Consume all pages when deriving lifetime totals. Active answers remain available from the active attempt, and only submission adds them to completed history.
- POST `/questions/{question}/reports`: `type` (required, max 100), `detail` (present, nullable, max 4000); HTTP 201. GET `/reports` returns only the current user's reports, with pagination. Report notifications/status workflow remains unavailable, matching the disabled frontend control.
- POST `/admin/notices`, PUT `/admin/notices/{id}`: title (200), optional nullable meta (255), body (10000), publication_at (date-time), required published boolean. Date-times normalize to UTC. GET `/admin/content/notices` and detail include drafts; GET `/notices` returns only published notices whose publication time has arrived (or is null).
- Dashboard includes `today_plan`, `due_count`; `today_tasks` uses the user's timezone and task order.

## Migration and verification

Apply `php artisan migrate` to add the coverage schema. Existing tables and primary keys remain intact. Rollback removes only the newly added schema and its data; it does not erase core questions, users, attempts, or existing progress. As with any rollback, back up newly stored information before rolling it back.

Regression tests cover field round trips, legacy request compatibility, ownership, nested-input allowlisting, draft/scheduled notice visibility, timestamp normalization, full-plan replacement, ordered selections, resume bounds, revision scheduling, idempotent submission, local-day activity, and upgrade/backfill/rollback. These checks do not demonstrate live frontend integration, browser backup migration, external notifications, or visual parity.

Verified locally on 2026-10-03: 58 backend tests and 416 assertions passed against `prosthuti_test`; Pint and strict Composer validation passed. OpenAPI covers all 62 registered route operations. All 136 Postman request bodies and 142 embedded scripts parse successfully; Postman was not run against a live session. The additive coverage migration was applied successfully to the local development database. External services and frontend integration were not exercised.
