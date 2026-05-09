# Event-GH

## Introduction

Event-GH provides a robust, modern starting point for building event-service workflows with a React frontend using [Inertia](https://inertiajs.com).

Inertia allows you to build modern, single-page React applications using classic server-side routing and controllers. This lets you enjoy the frontend power of React combined with the incredible backend productivity of Laravel and lightning-fast Vite compilation.

This React starter kit utilizes React 19, TypeScript, Tailwind, and the [shadcn/ui](https://ui.shadcn.com) and [radix-ui](https://www.radix-ui.com) component libraries.

## Official Documentation

Documentation for all Laravel starter kits can be found on the [Laravel website](https://laravel.com/docs/starter-kits).

## Production (Docker Compose)

This repository includes a full production-oriented Compose stack for a single VPS:

- `nginx` (public HTTP entrypoint)
- `app` (Laravel PHP-FPM)
- `worker` (`php artisan queue:work`)
- `scheduler` (`php artisan schedule:work`)
- `postgres`
- `qr-ticket`
- `analytics`

### First deployment

1. Copy environment template and set secrets:
   - `cp .env.production.example .env`
   - Fill `APP_KEY` (or generate later), DB credentials, SMTP, `QR_TICKET_SERVICE_KEY`, `ANALYTICS_SERVICE_KEY`
2. Build and start services:
   - `docker compose build --pull`
   - `docker compose up -d`
3. Initialize Laravel:
   - `docker compose exec -T app php artisan key:generate --force` (if `APP_KEY` empty)
   - `docker compose exec -T app php artisan migrate --force`
   - `docker compose exec -T app php artisan config:cache`
   - `docker compose exec -T app php artisan route:cache`
   - `docker compose exec -T app php artisan view:cache`

### Rolling update

1. `git pull`
2. `docker compose build --pull`
3. `docker compose up -d --remove-orphans`
4. `docker compose exec -T app php artisan migrate --force`
5. `docker compose exec -T app php artisan optimize`

### Smoke checks

- `docker compose ps` (all services should be `Up`)
- `curl http://<server-host>/up` (Laravel health endpoint)
- Verify admin analytics export (PNG/PDF)
- Verify QR ticket generation after reservation confirmation

## Contributing

Thank you for considering contributing to our starter kit! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

All contributions to the Starter Kits from now on should be made through [Maestro](https://github.com/laravel/maestro).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## License

The Laravel + React starter kit is open-sourced software licensed under the MIT license.
