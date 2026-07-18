# PanTrack — Progress Log

> Update this file after every meaningful unit of work. Keep it honest: only mark ✅ when verified running, not just written.
> Legend: ✅ done · 🚧 in progress · ⬜ not started · ⛔ blocked

**Last updated:** 2026-07-17

---

## Current status

Full MVP codebase scaffolded and builds clean. Backend (Express + Prisma) and frontend (Vite + React + Tailwind) both typecheck and compile. Database connection pending — needs a PostgreSQL instance (local or Neon) to run migrations and test.

**Next up:** Set up a PostgreSQL database and run Prisma migration.

---

## Milestones

### 0. Project setup
- ✅ Initialize git repo
- ✅ Create `client/` and `server/` folder structure (per TRD §14)
- ✅ `.gitignore` (node_modules, .env, dist)
- ✅ `.env.example` files for client + server

### 1. Backend foundation
- ✅ Express + TypeScript server scaffold (`server.ts`)
- ✅ Prisma init + `schema.prisma` (User, Income, Expense, Category, Budget)
- ✅ First migration + DB connection — local PostgreSQL (offline), migration `init` applied + demo seed
- ✅ Security middleware: Helmet, CORS, rate limiting
- ✅ Standard response + error handler utils

### 2. Authentication
- ✅ Register (`POST /api/auth/register`) — bcrypt hash, seed 8 default categories
- ✅ Login (`POST /api/auth/login`) — JWT via httpOnly cookie (7d)
- ✅ Logout, `GET /api/auth/me`, `PATCH /api/auth/onboarding`
- ✅ JWT auth middleware on protected routes

### 3. Core modules (backend)
- ✅ Categories: GET / POST / DELETE
- ✅ Income: GET / POST / PATCH / DELETE + filter
- ✅ Expenses: GET / POST / PATCH / DELETE + filter + budget warning
- ✅ Budget: GET / POST / PATCH / DELETE (80% / 100% alert logic)
- ✅ Dashboard aggregate: `GET /api/dashboard`
- ✅ Analytics: `GET /api/analytics`

### 4. Frontend foundation
- ✅ React + TS + Tailwind scaffold (Vite)
- ✅ React Router, React Query, Axios client (with auth interceptor)
- ✅ Auth context + protected route wrapper

### 5. Frontend features
- ✅ Auth pages (register / login)
- ✅ Onboarding flow (9 screens — PRD §12)
- ✅ Dashboard (summary cards + recent transactions)
- ✅ Income page (list + add/edit/delete + filter)
- ✅ Expenses page (list + add/edit/delete + filter + budget warning)
- ✅ Categories management (icons + colors)
- ✅ Budget page (progress bars, 80%/100% states)
- ✅ Analytics (Recharts: pie, bar, trend)
- ✅ Reports (daily / weekly / monthly / annual)

### 6. Quality & deploy
- ✅ Zod validation wired on all forms
- ⬜ Unit + integration tests (TRD §15)
- ✅ Responsive pass (mobile/tablet/desktop) — verified via headless screenshots at 390px + 1440px; no horizontal bleed
- ⬜ Deploy: Vercel (client) + Render (server) + Neon (DB)

---

## Change log

| Date | What changed | Notes |
|------|--------------|-------|
| 2026-07-17 | Created `CLAUDE.md` and `progress.md` from PRD + TRD | Planning stage; no code yet |
| 2026-07-17 | Scaffolded entire backend: Express + TS + Prisma schema, Auth (JWT+cookie), Categories, Income, Expenses, Budget, Dashboard, Analytics | All controllers/routes/middleware written; typecheck clean |
| 2026-07-17 | Scaffolded entire frontend: Vite + React + TS + Tailwind, all 11 pages (auth, onboarding, dashboard, income, expenses, categories, budget, analytics, reports), AuthContext, routing | Full build succeeds; Recharts wired |
| 2026-07-18 | Account settings page + profile menu | New `/account` page: Profile card (fullName, profileType, currency — currency updates app-wide via AuthContext) + Password card (new password, no current-password check per request). New backend endpoints `PATCH /auth/profile` and `POST /auth/change-password` (Zod-validated, auth-protected). Linked from a new interactive profile menu (avatar dropdown: name/email, Account settings, Sign out — also fixes no-signout-on-mobile). Endpoints + page verified. |
| 2026-07-18 | Details modal centered + pop animation; sidebar edge shadow | Converted the transaction details from right drawer to a centered modal with pop-in/pop-out (reduced-motion safe); added a soft right-edge shadow to the sidebar so it reads as a panel. |
| 2026-07-18 | Transaction details drawer (view/edit/delete) | New `TransactionDrawer` slide-over (right on desktop, bottom sheet on mobile) opens when any transaction row is clicked — on Dashboard recents, Expenses, Income, and Reports. Self-contained: own React Query update+delete mutations keyed by type, invalidates all relevant caches. Enriched `/dashboard` recentTransactions with categoryId/icon/color/description/createdAt. Replaced hover-only row edit/delete with fully-clickable rows (fixes touch reachability). Verified with screenshots (desktop right-dock, mobile bottom-sheet, edit form). Brainstormed + approved before build. |
| 2026-07-18 | Fixed Reports "bleeding", sidebar scroll + collapsible | Root cause of Reports overflow was Prisma `Decimal` serializing to a JSON string → `0 + "12500"` string-concatenated into a quadrillion-sized number; fixed by returning numeric `amount` from income/expense/budget GET endpoints (+ defensive `Number()` in Reports). App shell switched to fixed `h-screen` layout so only `<main>` scrolls (sidebar/topbar no longer scroll with content). Sidebar now collapsible (icon-rail, persisted in localStorage). Verified with screenshots. |
| 2026-07-18 | Responsive + polish pass (impeccable adapt/polish), verified with screenshots | Global overflow-x guard; removed placeholder topbar search/bell → live date pill; polished `<Select>` component (custom chevron, no OS arrow) across Expenses/Income/Budget; edit/delete actions now tap-reachable on mobile (were hover-only); Reports period tabs scroll on narrow screens; responsive type on Dashboard/Reports; loosened Clash Display heading tracking (word gaps were cramped); abbreviated Analytics Y-axis ticks (150k) to stop clipping. Verified via puppeteer-core headless screenshots at 390px + 1440px (login, dashboard, expenses, budget, analytics, landing) — no horizontal bleed. |
| 2026-07-18 | Offline-ready: local Postgres + self-hosted fonts | Installed/connected local PostgreSQL; `prisma migrate dev` created DB + tables; wrote `prisma/seed.ts` (demo@pantrack.app / password123 with realistic income/expenses/budgets). Self-hosted Satoshi + Clash Display woff2 in `client/src/assets/fonts` (removed Fontshare CDN) so fonts work offline. Verified end-to-end: login → dashboard returns live seeded data. |
| 2026-07-18 | Full UI redesign — soft neumorphic hybrid (impeccable skill) | Palette + tokens extracted from "Dash Ref" (violet primary, lavender base) into Tailwind v4 `@theme`; neumorphic utility layer (raised/inset/btn/field) in index.css; Manrope font (Plus Jakarta Sans is on the reflex-reject list); added lucide-react icons + Logo/CategoryIcon/AuthBrandPanel components + currency formatter. New public landing page at `/` (hero from "Pantrack hero" ref, self-contained product preview). Redesigned MainLayout shell, Dashboard, Login/Register, 8-step Onboarding, Income, Expenses, Categories, Budget, Analytics, Reports. Also fixed hardcoded ₦ (now respects user currency). PRODUCT.md written. Client typecheck + prod build pass clean. |
| 2026-07-18 | Doc-alignment audit + fixes | Dashboard now returns merged 5 recent txns (was raw array — broke Recent Transactions); JWT honors `JWT_EXPIRES_IN`; login route Zod-validated; category delete blocks when in use; `@@index([userId])` on Income/Expense/Category/Budget; analytics monthly trend rewritten without raw SQL (TRD §10); "Skip onboarding" now marks user onboarded; CLAUDE.md §5/§6 reconciled to cookie auth + CSRF note. Both builds pass clean. |

---

## Decisions & open questions

- **2026-07-17 — Auth token storage:** Use **httpOnly cookie** (`SameSite=Strict`, `Secure` in prod, 7-day expiry) instead of Bearer + localStorage. Reason: finance app; cookie prevents XSS token theft. Cost: add CSRF protection + Axios `withCredentials: true`. _Settled — do not revisit._
- **2026-07-17 — Onboarding income/budget storage:** Store on the **User table** (`monthlyIncome`, `monthlyBudget`, `profileType`, `onboarded`), not a new table. Reason: 1:1 with user, MVP-minimal. Actual Income/Budget records stay in their own tables. _Settled — do not revisit._
