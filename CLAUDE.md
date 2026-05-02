# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Start dev server** (runs Laravel, queue worker, Pail log viewer, and Vite concurrently):

```bash
composer run dev
```

**Run tests:**

```bash
php artisan test --compact               # all tests
php artisan test --compact --filter=Name # specific test
```

**Lint & format PHP:**

```bash
vendor/bin/pint --dirty --format agent  # fix changed files
```

**Lint & format JS/TS:**

```bash
npm run lint          # fix ESLint issues
npm run format        # fix Prettier issues
npm run types:check   # TypeScript type check
```

**Build frontend:**

```bash
npm run build
```

**Full CI check (lint + types + tests):**

```bash
composer run ci:check
```

**Generate Wayfinder route functions** (run after adding/changing controllers or routes):

```bash
php artisan wayfinder:generate
```

## Domain

This is an **event services reservation platform**. Clients book event decoration/animation services (births, birthdays, graduations, weddings, etc.), and admins manage bookings and payments.

### User Roles

`User.role` is either `client` or `admin`. There is no role middleware on the admin routes yet — authorization must be enforced manually.

### Reservation Workflow

`Reservation.statut` transitions: `en_attente` → `confirmee` | `annulee`. Each reservation has:

- one `Evenement` (event details: date, location, type, guest count, type-specific fields)
- one optional `Personnalisation` (decoration style, custom text, pricing breakdown)
- many `Paiement`s (advance payments), each with many `RecuPaiement`s (uploaded proof files)

`CoordonneesBancaires` is a standalone model (bank transfer details shown to clients).

### Dual-Area Architecture

- **Client area** (`/reservations`): create reservation (wizard), list own reservations, view detail, upload payment proof.
- **Admin area** (`/admin/*`): view all reservations with search/filter, change statut, validate/refuse payments, global stats dashboard.

Admin pages live under `resources/js/pages/admin/`, client reservation pages under `resources/js/pages/reservations/`.

## Architecture

This is a Laravel 13 + Inertia v3 + React 19 SPA. The PHP backend serves pages via `Inertia::render()` and the frontend is fully client-side rendered.

### Backend

- **Routes**: `routes/web.php` (home, client reservations, admin area) and `routes/settings.php` (profile/security/appearance). Auth routes are registered automatically by Fortify.
- **Controllers**: `app/Http/Controllers/` for client-facing; `app/Http/Controllers/Admin/` for the admin area; `app/Http/Controllers/Settings/` for settings pages.
- **Authentication**: Managed by Laravel Fortify (`app/Actions/Fortify/`, `app/Providers/FortifyServiceProvider.php`). Supports login, registration, 2FA (TOTP), password reset, email verification.
- **Shared Inertia props**: Defined in `app/Http/Middleware/HandleInertiaRequests.php` — shares `name`, `auth.user`, and `sidebarOpen` to all pages.
- **Database**: SQLite (dev). Migrations in `database/migrations/`.

### Frontend

- **Entry point**: `resources/js/app.tsx` — bootstraps Inertia and assigns layouts automatically by page name prefix (`auth/*` → `AuthLayout`, `settings/*` → `[AppLayout, SettingsLayout]`, default → `AppLayout`).
- **Pages**: `resources/js/pages/` — Inertia page components. Auth pages under `auth/`, settings under `settings/`, client reservation pages under `reservations/`, admin pages under `admin/`.
- **Layouts**: `resources/js/layouts/` — `app-layout.tsx` wraps the sidebar layout; `auth-layout.tsx` wraps auth pages. The sidebar layout uses shadcn/ui `<Sidebar>`.
- **Components**: `resources/js/components/` — app-specific components (sidebar, nav, header, etc.). `resources/js/components/ui/` — shadcn/ui primitives (button, input, dialog, etc.).
- **Wayfinder**: Auto-generated TypeScript route functions live in `resources/js/actions/` (by controller) and `resources/js/routes/` (by named route). Always import from these instead of hardcoding URLs.
- **Styles**: Tailwind v4 via `resources/css/app.css`.
- **Types**: `resources/js/types/` — shared TypeScript types (`auth.ts`, `navigation.ts`, `ui.ts`).
- **Hooks**: `resources/js/hooks/` — custom hooks including `use-appearance` (light/dark theme), `use-flash-toast`, `use-two-factor-auth`.

## 🎨 Design System — Color Palette

All colors are defined as CSS variables in `resources/css/app.css` and mapped in `tailwind.config.js`.
Never use hardcoded hex values in JSX/TSX — always use Tailwind utilities.

### Tokens

| Token                    | Value     | Usage                            |
| ------------------------ | --------- | -------------------------------- |
| `--color-primary`        | `#E91E63` | Buttons, titles, active elements |
| `--color-primary-soft`   | `#F06292` | Hover states, badges             |
| `--color-bg-global`      | `#F5F5F5` | Page background (`<body>`)       |
| `--color-bg-card`        | `#FCE4EC` | Card / soft section backgrounds  |
| `--color-bg-white`       | `#FFFFFF` | Card surface, modals             |
| `--color-text-primary`   | `#333333` | Main body text                   |
| `--color-text-secondary` | `#777777` | Muted / helper text              |
| `--color-border`         | `#E0E0E0` | All borders and input outlines   |
| `--color-success`        | `#4CAF50` | Success / confirmation           |
| `--color-error`          | `#F44336` | Error / destructive              |
| `--color-admin`          | `#3F51B5` | Admin-only UI elements           |

### Rules

- **Page background:** `bg-bg-global` on root layout
- **Cards:** `bg-white border border-border rounded-xl`
- **Soft sections:** `bg-bg-card` (`#FCE4EC`)
- **Buttons:** use shadcn `<Button>` — `variant="default"` maps to `--primary`
- **Inputs:** `border-border rounded-md focus-visible:ring-primary`
- **Success/error text:** `text-success` / `text-error`
- **Border radius:** buttons `rounded-lg`, cards `rounded-xl`, inputs `rounded-md`
- **DO NOT** use `style={{ color: '#E91E63' }}` inline — use Tailwind utilities only
- **DO NOT** add new colors without updating `app.css` and `tailwind.config.js` first

## 🖼️ Landing Page Reference

The file `docs/landing-reference.html` is the **design reference** for the public landing page.

When building `resources/js/pages/home.tsx` (or the welcome page), follow this reference exactly:

- **Sections in order:** Nav → Hero → Services → Events → How it works → Testimonials → Contact CTA → Footer
- **Fonts:** `Cormorant Garamond` (serif, for headings) + `Lato` (sans-serif, for body). Import from Google Fonts in `app.css`.
- **Color tokens:** use the CSS variables defined in this CLAUDE.md (`--color-primary`, etc.) — do NOT copy the `oklch()` values from the HTML file, map them to our palette instead.
- **Animations:** scroll reveal (`data-reveal` + IntersectionObserver) → convert to a `useScrollReveal` custom hook in `resources/js/hooks/`.
- **Inertia links:** replace all `<a href="#">` that point to internal pages with `<Link>` from `@inertiajs/react`.
- **Wayfinder:** use generated route functions for the reservation CTA button (`/reservations/create`).
- **No raw CSS:** translate all styles to Tailwind utilities. Inline styles are not allowed.

<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.5
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/wayfinder (WAYFINDER) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available in `**/skills/**`. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.
- To check environment variables, read the `.env` file directly.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
    - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- The `{name}` argument should not include the test suite directory. Use `php artisan make:test --pest SomeFeatureTest` instead of `php artisan make:test --pest Feature/SomeFeatureTest`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
