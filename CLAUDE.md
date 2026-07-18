# CLAUDE.md — PanTrack

> Personal finance management web app. **Tagline:** Track Every Penny. Plan Every Future.
> Source of truth: `Pantrack PRD main.md` (product) and `Pantrack TRD main.md` (technical).
> This file tells you *how to work*. When PRD/TRD conflict with an assumption, the docs win.

---

## 1. What we are building (MVP scope)

A web app where a user can:
1. **Register / Login** (JWT auth, bcrypt-hashed passwords)
2. Complete a **9-screen onboarding** (welcome → features → account → profile type → currency → monthly income → monthly budget → categories → success)
3. Land on a **Dashboard**: total income, total expenses, remaining balance, savings, budget status, 5 recent transactions
4. **Add / edit / delete / filter Income** and **Expenses** (amount, category, date, description)
5. Manage **Categories** (8 defaults pre-loaded: Food, Rent, Transport, Shopping, Bills, Entertainment, Healthcare, Education; plus custom with icon + color)
6. Create **Budgets** per category per month/year, with alerts at 80% and 100% usage
7. View **Analytics** (expense pie chart, income vs expense bar chart, monthly trend) and **Reports** (daily/weekly/monthly/annual)

Out of scope for MVP (do NOT build unless asked): savings goals, bill reminders, dark mode, PDF/Excel export, mobile app, AI insights, bank integration, OCR, 2FA. See PRD §15 / TRD §18.

---

## 2. Tech stack (locked — do not substitute)

**Frontend:** React + TypeScript, Tailwind CSS, React Router, React Query (server state), Axios, React Hook Form + Zod (validation), Recharts (charts).
**Backend:** Node.js + Express + TypeScript, Prisma ORM, JWT, bcrypt.
**Database:** PostgreSQL (Neon in prod).
**Deploy:** Vercel (frontend), Render (backend), Neon (DB), GitHub.

Three-tier architecture: React → REST API (HTTPS) → Express → Prisma → PostgreSQL.

---

## 3. Folder structure (per TRD §14)

```
PanTrack/
  client/   → components/ pages/ layouts/ hooks/ services/ context/ utils/ assets/ App.tsx
  server/   → controllers/ routes/ middleware/ services/ prisma/ config/ utils/ types/ server.ts
```

---

## 4. Data model (Prisma) — TRD §5–6

All money = `Decimal`, all ids = `UUID`. User owns Income, Expense, Budget, Category (one-to-many, **cascade delete**). Category is referenced by Income/Expense/Budget.

- **User**: id, fullName, email(unique), password(hashed), currency(default NGN), timestamps
  - Onboarding fields (per decision 2026-07-17): `monthlyIncome` Decimal?, `monthlyBudget` Decimal?, `profileType` String?, `onboarded` Boolean default false
- **Income**: id, userId, amount(>0), categoryId, description?, date, createdAt
- **Expense**: id, userId, amount(>0), categoryId, description?, date, createdAt
- **Category**: id, userId, name, icon, color, isDefault
- **Budget**: id, userId, categoryId, amount(>0), month(1–12), year

---

## 5. REST API contract — TRD §7

Base: `/api`. Auth via **httpOnly cookie** `token` (set on login/register, `SameSite=Strict`, `Secure` in prod, 7d), per the 2026-07-17 decision — **not** a Bearer header. Axios must send `withCredentials: true`.

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/onboarding`
- `GET|POST /income`, `PATCH|DELETE /income/:id`
- `GET|POST /expenses`, `PATCH|DELETE /expenses/:id`
- `GET|POST /categories`, `DELETE /categories/:id`
- `GET|POST /budget`, `PATCH /budget/:id`
- `GET /dashboard`, `GET /analytics`

**Response envelope (always):**
```json
{ "success": true, "message": "...", "data": {...} }        // success
{ "success": false, "message": "..." }                       // error
```
Status codes: 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 500 server. Don't invent other shapes.

---

## 6. Non-negotiable rules

- **Validation everywhere.** Amount > 0; category & date required; email valid+unique; password ≥ 8 chars. Validate on both client (Zod) and server.
- **Security (TRD §10):** bcrypt, JWT (httpOnly cookie), HTTPS, CORS, Helmet, rate limiting, input validation, Prisma (no raw SQL), secrets only in `.env` (never commit), auth middleware on every protected route. **CSRF:** relying on `SameSite=Strict` for MVP; add token-based CSRF protection before exposing state-changing routes cross-site.
- **Auth expiry:** JWT `JWT_EXPIRES_IN=7d`; inactive-for-7-days users must re-login.
- **Budget alerts:** warn at 80%, red at 100%; block expense save flow shows warning but still saves (see PRD expense AC).
- **Real-time UX:** new income/expense reflects on dashboard without page refresh (React Query invalidation).
- **Never commit `.env`.** Env vars: DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, PORT(5000), NODE_ENV, CORS_ORIGIN.

---

## 7. How to work (to avoid wasted tokens / going in circles)

**Before building any feature:**
1. Read the relevant PRD user story + acceptance criteria AND the TRD section. They are the spec — don't guess requirements.
2. Check `progress.md` for what's already done and what's next. **Do not rebuild finished work.**
3. Confirm the API contract in §5 above before writing frontend calls or backend routes — keep them in sync.

**When to use skills** (invoke via the Skill tool):
- **Any new feature / component / behavior** → `brainstorming` first (clarify intent before coding), then `writing-plans` for multi-step work.
- **Executing a written plan** → `executing-plans` or `subagent-driven-development`.
- **Writing a feature or bugfix** → `test-driven-development` (write the failing test first per TRD §15 testing strategy).
- **Any bug / test failure / unexpected behavior** → `systematic-debugging` before proposing a fix.
- **UI / dashboard / forms / charts / onboarding screens** → `impeccable` (or `taste-skill`) for polished frontend; keep it beginner-friendly, responsive, simple (PRD §11 usability).
- **Before claiming done / committing** → `verification-before-completion` (run it, show output, no unverified "it works").
- **Simplicity check** → `ponytail` when a solution feels over-engineered (this is an MVP; prefer the simplest thing that meets the AC).
- **Before merging a branch** → `requesting-code-review`.

Only invoke a skill that genuinely applies. Don't stack skills for trivial edits.

**Build order (recommended sequence):**
1. Backend scaffold: Express + TS + Prisma schema + migrations + DB connection
2. Auth module (register/login/logout/me) + JWT middleware
3. Categories (seed 8 defaults on registration) → Income → Expenses → Budget
4. Dashboard aggregate endpoint → Analytics endpoint
5. Frontend scaffold: React + TS + Tailwind + Router + React Query + Axios client
6. Auth pages + onboarding flow → Dashboard → Income/Expense pages → Budget → Analytics/Reports
7. Wire validation (Zod), error handling, polish UI

**After finishing any meaningful unit of work: update `progress.md`.**

---

## 8. Performance targets (TRD §12)

Dashboard < 2s, API < 500ms, login < 1s, analytics < 3s, search < 1s. Index `userId` fields; paginate long lists.

---

## 9. Definition of done for a feature

- Matches the PRD acceptance criteria for that story.
- Server validates input and returns the standard envelope.
- Client validates with Zod and shows user-friendly errors.
- Auth-protected where required.
- Verified running (not just written) per `verification-before-completion`.
- `progress.md` updated.
