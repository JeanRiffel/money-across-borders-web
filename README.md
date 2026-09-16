# Money Across Borders — Web

A Next.js frontend for [`money-across-borders`](../money-across-borders), a cross-border remittance API
(multi-currency wallets, FX conversion, KYC, and remittances). This app covers the backend's full HTTP
surface: sign up, log in, open a wallet, submit KYC, send a remittance, and search remittance history.

## Stack

- **Next.js 16 (App Router) + TypeScript**, dark-by-default theme (toggle available).
- **shadcn/ui** on Tailwind CSS v4, built on Base UI primitives.
- **React Hook Form + Zod** for forms, validated against schemas that mirror the backend's actual request
  bodies (see `lib/schemas/`).
- **TanStack Query** for client-side data fetching against this app's own `/api/*` routes.

## Architecture: Next.js as a BFF

The browser never talks to the backend directly. Route handlers under `app/api/*` call the backend
server-to-server (`lib/api/backend-client.ts`) and store its JWT in an **httpOnly cookie**
(`lib/session.ts`) — the token is never readable from client-side JavaScript. This also means the backend
needs **no CORS configuration**: it only ever receives same-machine server-to-server requests, not browser
requests from a different origin.

`proxy.ts` (Next 16's renamed Middleware) does an optimistic cookie-presence check to redirect signed-out
visitors away from protected routes before they render; `lib/dal.ts`'s `requireSession()` is the real
server-side gate used in every protected page and route handler.

## Known constraint: no account/wallet lookup

The backend exposes exactly six endpoints — `POST /account`, `POST /login`, `POST /wallets`, `POST /kyc`,
`POST /remittances`, and `GET /remittances`. There is **no `GET /account` or `GET /wallets`** — once a
wallet is created there's no way to fetch it again. Because of this, the dashboard is an action hub (create
→ confirm), not a balance viewer, and every "wallet opened" / "KYC submitted" confirmation screen tells you
to save the returned IDs — they won't be shown again. Remittance history (`GET /remittances`) is the one
real, queryable read in the app.

## Running locally

1. Start the backend first (see `../money-across-borders/AGENTS.md`): it needs a migrated Postgres and a
   reachable Redis to boot at all.

   ```bash
   cd ../money-across-borders
   npm run db:migrate   # once, against a fresh database
   npm run dev           # http://localhost:3000
   ```

   For the remittance history page specifically, also run the indexer worker in another terminal —
   `GET /remittances` reads from Elasticsearch, which only catches up once this worker consumes the
   completion event:

   ```bash
   npm run worker:remittance-indexer
   ```

   Without Elasticsearch/that worker running, sending a remittance still works — only the history page
   will show an error until both are up.

2. Copy the env template and point it at the backend:

   ```bash
   cp .env.local.example .env.local
   ```

3. Install dependencies and start the dev server (runs on port **3001** — the backend already owns 3000):

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3001](http://localhost:3001).

## Commands

```bash
npm run dev     # next dev -p 3001
npm run build   # production build
npm run start   # serve the production build on port 3001
npm run lint    # eslint
```
