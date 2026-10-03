# Environment selector

The main `.env` contains exactly one setting:

```dotenv
APP_ENV=local
```

Change it to `staging` or `production` to select that profile on the next application boot/request. No `--env` flag or manual config-clear command is required for this switch. This is a small project-specific bootstrap extension; default Laravel does not select sibling files from an APP_ENV value inside `.env`.

## Files

| Selector | Private settings file | Committable template |
| --- | --- | --- |
| local | `.env.local` | `.env.local.example` |
| staging | `.env.staging` | `.env.staging.example` |
| production | `.env.production` | `.env.production.example` |
| Automated PHPUnit runner | `.env.testing` | `.env.testing.example` |

`.env.example` is the selector template. Actual `.env` and `.env.*` files are ignored by Git. Only the explicit example files are allowed into version control. Never put credentials in the selector or templates.

The current local credentials and APP_KEY were preserved in `.env.local`. Staging and production files currently contain example domains and empty credentials; they need real settings **once** before use. Selecting a profile does not provision its database, SMTP server, Google client or R2 bucket.

## First-time setup

Before installing dependencies in a new checkout, copy the selector and the profiles you will use. Do not overwrite existing files:

```sh
test -f .env || cp .env.example .env
test -f .env.local || cp .env.local.example .env.local
test -f .env.testing || cp .env.testing.example .env.testing
composer install
```

Configure local MySQL and generate the local APP_KEY with `php artisan key:generate` only when it is empty. This writes to the selected profile. Generate an independent test key and place it in `.env.testing` if empty; the current workspace already has one. Do not rotate existing keys during ordinary setup/deployments.

On the staging server, prepare `.env.staging` from its template; on production, prepare `.env.production`. Supply that server's own credentials/key, then change its selector. Keep production secrets on the production server. Do not run migrations or database commands while selecting the wrong environment.

## Selection and cache behavior

`app/Foundation/EnvironmentApplication.php` reads the selector before Laravel configuration loads. It accepts only local/staging/production, checks that the selected file exists and its APP_ENV matches, then lets Laravel load that file. There is no fallback to another profile. Parser errors report the filename without echoing secret-bearing lines.

The selector is authoritative for the environment name. `--env` is not a supported switching mechanism in this project. Server-injected variables may still override individual profile values, using Laravel's normal environment loading; avoid global development DB/mail variables that unexpectedly override all profiles.

Configuration cache filenames include the selected environment and a SHA-256 fingerprint of its file. Switching profiles or editing a profile therefore bypasses stale config automatically. Existing Laravel `config:cache` and `config:clear` commands operate on the selected profile's cache. Legacy `bootstrap/cache/config.php` is not used.

Cache profiles during deployment for performance; avoid caching during development. If injected server variables or config PHP code change without editing the profile, rebuild config cache explicitly. Old fingerprinted caches can contain old secrets: remove retired cache files during controlled release cleanup, never commit or expose `bootstrap/cache`.

A fresh HTTP request/application boot sees the new selector. Already-running commands, queue workers, schedulers and Octane processes retain their booted configuration and must be restarted. A file change cannot safely retarget a job already running. Use normal PHP-FPM or `artisan serve` without `--no-reload` for this request-based development workflow. Production environment changes should be performed as a controlled release, not while jobs are running.

## Staging and production

- Keep APP_DEBUG=false and SESSION_SECURE_COOKIE=true on hosted staging/production. Serve only `backend/public` over HTTPS.
- Use separate MySQL databases/accounts, APP_KEYs, Google clients and R2 buckets for each environment. Configure DB TLS according to the provider. Leave DB_SOCKET empty for TCP.
- Staging should use an SMTP sandbox and synthetic data. The demo seeder allows only local/testing and does not populate staging automatically.
- Production uses real SMTP with a verified sender. Configure the transport/port required by your provider; confirm OTP delivery before accepting users.
- Configure exact HTTPS FRONTEND_URLS. The existing SameSite=Lax cookie flow expects API, web and admin to share a parent domain. Cross-site auth and reverse-proxy trust need topology-specific configuration.
- Keep APP_KEY stable across releases and identical across instances of the same deployment. Never reuse the local key for production.
- Database-backed sessions/cache are shared by API instances. Logs go to stderr on hosted profiles and should be collected with restricted access.

## Release steps

After selecting and configuring the server profile:

```sh
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
php artisan config:cache
php artisan migrate --force
php artisan route:cache
php artisan view:cache
```

Back up the database first and review migrations. Rebuild config on the actual host with its secrets, not on a developer machine. Reload PHP processes and any managed queue workers after release. Schedule `php artisan schedule:run` every minute for timed attempts/OTP cleanup. OTP delivery is currently synchronous.

Check `/up`, database access, actual OTP delivery, Google login and private file access. `/up` alone does not verify external services. Keep the prior release and a recoverable database backup. Do not run `migrate:fresh`, PHPUnit or demo seeding against production. No deployment is performed by changing templates in this repository.

## Automated tests

Run `php artisan test` while the local profile is configured, or `vendor/bin/phpunit` directly. The PHPUnit process always selects `.env.testing`, regardless of the main selector, and `phpunit.xml` forces the isolated `prosthuti_test` connection. Tests do not select staging or production. CI must provision its own isolated MySQL test database and adjust the test connection deliberately.

The environment-selection tests boot separate processes and verify all three selectors, cache separation, cache invalidation after profile edits, and failure on missing or mismatched files. Live SMTP/Google/R2 validation still requires real environment configuration.

Reference: [Laravel environment and configuration behavior](https://laravel.com/framework/docs/13.x/configuration). The selector and fingerprinted cache behavior described here are project-specific additions.
