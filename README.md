# smart-sender-solution

A small SPA for the Smart Sender frontend test task: sign in, browse webhooks, edit one.
There's no real backend. The API is mocked with MSW according to the contract.

**Live demo:** https://smart-sender-solution-one.vercel.app/

Test account: `demo@smartsender.com` / `passme123`

## Running it

Node 20 or newer.

```bash
npm install
npm run dev      # http://localhost:5173 (by default)
npm test         # Vitest
```

Other scripts: `npm run build`, `npm run preview`, `npm run typecheck`, `npm run lint`, `npm run format`.

 Notice please: The mock keeps its state in memory, so a page reload logs you out and resets edited webhooks. The list's `page` and `search` survive: after signing in you're sent back to the same URL.

To see the session refresh in action, sign in, wait 30 seconds, and click to another page of the list. In the Network tab you'll see a 401, one `rotate`, and the original request retried.

## Stack

Vite, React 19, TypeScript (strict), React Router 7, TanStack Query, react-hook-form + zod, Tailwind v4 + shadcn/ui, MSW, Vitest.

## Key decisions

**Session and retries.** CSRF is fetched once and shared between parallel requests. A 419 refreshes it and retries once. A 401 triggers a single shared rotate: parallel requests wait on the same promise, so the server sees one rotate. A 401 that arrives after a rotate has already finished just retries. If the rotate fails, the session ends once: the cache is cleared and you land on login.

**Login.** `device_session_token` only exists inside the login function (login → issue → me) and never reaches state, storage or the URL. The fingerprint is random, stored in `localStorage`.

**State.** Server data lives in TanStack Query. The only extra state is a tiny auth status store, which the route guard and the HTTP client both need.

**URL.** `page` and `search` live in the URL and are validated with zod. Back/forward works. The `?redirect=` target is checked so it can't send you to another site.

**Forms.** Client-side zod validation, but server 422 errors are mapped onto the fields.

**Scale.** No monorepo, no state library, no axios. The task doesn't need them.

## Tests

The required one: two parallel requests get 401, the server sees one rotate, and both succeed. Plus edge cases: failed rotate, CSRF retry, late 401.