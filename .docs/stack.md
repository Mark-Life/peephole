# Stack Decisions

Opinionated defaults from the template author. Use these when picking libraries/services for new features unless the project already established something else.

## AI

- All AI (server + frontend): **Vercel AI SDK** — always sufficient

## Web: Frontend / Backend Topology

- SEO-heavy, marketplace, traditional web/content: **Next.js**
- App-like, highly interactive, native feel (chat apps, instant navigation, no routing feel): **Vite + React** frontend + decoupled backend
  - Backend default: **oRPC router**
  - If using Effect: **Effect RPC**
  - Alt: Elysia, Hono (when oRPC doesn't fit)

## Client ↔ Server Communication

Pick based on project setup:

- **Next.js project**: server components + server actions for server-side; **TanStack Query** for client-side interactions (typical combo)
- **Decoupled (Vite + React) non-Effect**: **TanStack Query** + oRPC client
- **Effect-heavy project**: everything Effect — **Effect RPC**, Effect Platform, **Effect Atom** for frontend state

## Database + Auth + Storage

- Prototyping / starting out: **Supabase** (Postgres + auth + storage bundled — slower, but all-in-one)
- Production / established: **PlanetScale Postgres + Better Auth** (faster, more reliable; Better Auth has Drizzle providers, integrates into your DB) + bucket storage
  - Bucket storage options: **R2**, **S3**, or **UploadThing**. UploadThing is easiest for devs moving to PlanetScale but not ready to deal with raw S3/R2.
- Real-time as core feature: **Convex** (DB + server layer). Online-only — not for offline-capable apps.
- ORM for SQL (when not Convex): **Drizzle**

## Desktop

- Default: **Electron** + TypeScript only — consistent rendering/startup, proper AI streaming. Use even for AI chat apps.
- Tauri: only when heavy compute/processes warrant a Rust backend

## Mobile

- Always: **Expo** (latest SDK) / React Native

## Email

- **Resend**

## Background Jobs

- **Trigger.dev**

## Caching / Rate Limiting

- **Upstash Redis**

## Hosting (decoupled Bun/Node backend)

- **Railway** (current default — not ideal, occasional reliability issues, but no clearly better option right now). Cloudflare Workers ruled out (incomplete Node support). AWS only if the project already demands it.

## Observability

- Analytics + logging + error monitoring: **PostHog** (avoid Sentry — no real free tier)
- AI observability: **LangFuse** (AI SDK integration, generous free tier). Use PostHog instead if user wants everything in one place.

## Packaging

- Separate concerns into packages following monorepo conventions (e.g. `db`, `ai`, etc.)

---

## Beyond this doc

This covers the base stack. For additional tools and libraries beyond the defaults here — special-purpose stuff like media handling, security, and other niche use cases — see the curated directory: <https://andrey-markin.com/directory>
