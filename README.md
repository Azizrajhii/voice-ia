# Souty — Tunisian Voice AI Assistant

Souty is a voice assistant that listens and speaks in Tunisian Derja, French,
or English. The browser's speech recognition/synthesis APIs handle voice I/O;
an Express + MySQL backend handles auth, chat history, and calls the Gemini
API for the actual conversation.

This project was built with [Lovable](https://lovable.dev).

## Stack

- **Frontend**: TanStack Start (React 19), Tailwind, shadcn/ui
- **Backend**: Express, MySQL (via [XAMPP](https://www.apachefriends.org/) locally), JWT auth
- **AI**: [Gemini API](https://ai.google.dev/) (free tier)

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7e072bdb-ca6b-486c-93ad-e2d8bbd2911e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

You need Node.js/npm and [XAMPP](https://www.apachefriends.org/) (for MySQL) installed locally.

1. Start MySQL from the XAMPP control panel.
2. Load the schema once:
   ```sh
   mysql -u root -p < backend/sql/schema.sql
   ```
   (default XAMPP root user has no password — omit `-p`)
3. Copy env files and fill in real values:
   ```sh
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```
   At minimum, set `JWT_SECRET` and `GEMINI_API_KEY` in `backend/.env`. Get a
   free Gemini key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
4. Install and run both apps:
   ```sh
   npm i
   npm --prefix backend i
   npm run dev           # frontend, http://localhost:5173
   npm run dev:backend   # backend, http://localhost:4005
   ```

The frontend proxies `/api/*` to the backend in dev (see `vite.config.ts`).
The backend serves the health endpoint at `/api/health` from `backend/server.js`.

### Environment variables

**Frontend (`.env`)** — only needed in production, to point the built app at
a separately-hosted backend:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Full URL of the deployed backend's `/api`, e.g. `https://api.example.com/api`. Unset in dev — the Vite proxy handles it. |

**Backend (`backend/.env`)**

| Variable | Purpose |
| --- | --- |
| `PORT` | Port for the Express server (auto-increments if taken) |
| `MYSQL_HOST` / `MYSQL_PORT` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_DATABASE` | MySQL connection (XAMPP defaults: `localhost`, `3306`, `root`, empty password) |
| `JWT_SECRET` | Long random string used to sign auth tokens — required |
| `GEMINI_API_KEY` | Free Gemini API key — required for chat to work |
| `GEMINI_MODEL` | Gemini model id (defaults to `gemini-3.6-flash`) |

## Features

- **Voice chat** — browser speech recognition + synthesis, switch between
  Derja/French/English mid-conversation, powered by Gemini.
- **Auth** — JWT-based register/login, no third-party auth provider.
- **History** (`/history`) — every saved exchange, grouped by day, with
  pagination and a "clear history" action.
- **Settings** (`/settings`) — edit display name, change password, delete
  account (cascades to delete all of that account's messages).
- **Rate limiting** — `/auth/*` (10 req/15min per IP) and `/chat`
  (20 req/min per IP) are throttled via `express-rate-limit`, and Gemini's
  transient `503` ("model overloaded") is retried automatically with
  backoff before the user ever sees an error.

## Architecture

- `backend/` is the single source of truth for data and auth: it owns the
  MySQL `users`/`messages` tables, issues JWTs on register/login, and calls
  the Gemini API server-side (so the API key never reaches the browser).
- The frontend calls the backend exclusively through `src/lib/api.ts`,
  attaching the JWT (stored in `localStorage`) as a Bearer token.
- Auth state lives in `src/hooks/useAuth.tsx`, provided once at the app root
  (`AuthProvider` in `src/routes/__root.tsx`) so route guards and pages share
  one fetch instead of re-checking the session independently.

## Testing & CI

- Frontend: `npm test` runs Vitest (`src/lib/*.test.ts`) — request/auth-header
  logic in `api.ts` and the History page's date-grouping helper.
- Backend: `npm --prefix backend test` runs Node's built-in test runner
  against `backend/lib/*.test.js` — chat input validation, the Gemini
  request/response mapping, and the retry/backoff logic, all as pure
  functions with no database or network needed.
- `.github/workflows/ci.yml` runs lint, typecheck, tests, and a build on
  every push/PR, for both the frontend and backend, as two independent jobs.

## Roadmap

Everything below this point is either already deployed-quality or a
deliberate choice not to build yet — this is a punch list, not a backlog of
known-broken things.

- [ ] `.env` was previously committed with **live Supabase keys** (since
      removed from the code, but still present in git history). Rotate those
      keys if the Supabase project still exists — deleting the code that used
      them doesn't undo the exposure.
- [ ] The `supabase/` directory (old Lovable Cloud migrations) is now dead —
      delete it once you've confirmed nothing else in Lovable depends on it.
- [ ] No integration tests hit a real MySQL instance — the backend tests are
      all pure-function unit tests. Worth adding if the schema grows.
- [ ] No deploy target yet (deliberately, for now) — when ready, the backend
      needs a host with a real MySQL instance (Railway, Render, PlanetScale,
      or a VPS), and the frontend needs `VITE_API_URL` pointed at it.
- [ ] Add 2-3 screenshots or a short screen recording of a real conversation
      (in Derja, French, and English) to this README.
- [ ] Rename the repo/package from the generic `tanstack_start_ts` to
      something reflecting the actual product (`souty`, `souty-voice-ai`).
