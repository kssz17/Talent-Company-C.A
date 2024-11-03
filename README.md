# Talent Company C.A — ATS System

Applicant Tracking System (ATS) built as a portfolio project to demonstrate Vue 3 + TypeScript + Supabase skills applied to the HR domain.

**Live demo** → _coming soon (Vercel)_

---

## Why this project

I built this because I wanted a portfolio piece that matches the actual domain I want to work in — HR software. A generic todo app or weather widget doesn't show that I understand the real workflows a recruiter uses every day: managing job postings, moving candidates through a pipeline, evaluating profiles, tracking where candidates come from.

The inspiration was Bizneo ATS, a Spanish product I studied to understand the UX patterns that matter in this space.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Vue 3 + Composition API | Industry standard in Spanish/European B2B SaaS |
| Language | TypeScript (strict mode) | Catches bugs at compile time, better DX |
| State | Pinia | Official Vue state manager, cleaner than Vuex |
| Backend | Supabase (PostgreSQL + Auth + Storage) | Real-time capable, built-in RLS for row-level auth |
| Styling | Tailwind CSS | Fast iteration without fighting CSS specificity |
| Tests | Vitest + Vue Test Utils | Fast, ESM-native, same config as Vite |
| Build | Vite | Sub-second HMR, native ESM |

---

## Features

- **Job management** — create, publish, pause, close job postings with status workflow
- **Kanban pipeline** — drag & drop candidates through custom stages (Aplicados → Revisión → Entrevista → Oferta → Contratado)
- **Candidate evaluations** — star rating + notes per evaluator, averaged score on card
- **Bulk actions** — select multiple candidates, move or reject in one click
- **Reports** — selection funnel visualization, monthly trends, source breakdown
- **Templates** — reusable job offer and evaluation templates
- **Role-based access** — admin / recruiter / manager with Supabase RLS policies
- **Dev mode** — runs fully with mock data when Supabase isn't configured

---

## Getting started

```bash
git clone https://github.com/your-username/talent-ats.git
cd talent-ats
npm install
npm run dev          # runs on http://localhost:5173
```

The app works out of the box with mock data. To connect a real backend:

### Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Copy your credentials from **Settings → API**
4. Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

5. Restart the dev server. The app switches to real data automatically.

### Create a test user

In Supabase **Authentication → Users → Invite user**, add an email. The database trigger auto-creates the profile row. To set the role, run:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

---

## Project structure

```
src/
├── types/          → Single source of truth for all TypeScript types
├── lib/
│   ├── supabase.ts → Supabase client (auto-detects mock vs real mode)
│   └── mock.ts     → Dev data — used only when VITE_SUPABASE_URL isn't set
├── stores/
│   ├── auth.ts     → Authentication, session restore, role helpers
│   ├── jobs.ts     → Job CRUD + filter state
│   └── pipeline.ts → Kanban state, move/evaluate/reject operations
├── router/         → Vue Router with auth guards
├── layouts/
│   └── AppLayout.vue   → Top nav layout (no sidebar)
├── components/
│   ├── layout/AppTopNav.vue
│   └── pipeline/       → KanbanColumn, KanbanCard, CandidateModal
└── views/
    ├── DashboardView.vue
    ├── jobs/            → List, Form, Detail
    ├── pipeline/        → Kanban board
    ├── candidates/      → Table with bulk actions, detail
    ├── ReportsView.vue  → Funnel + charts
    ├── TemplatesView.vue
    └── auth/LoginView.vue
supabase/
└── schema.sql      → Full schema with enums, RLS policies, triggers
```

---

## Architecture decisions

**Why mock fallback instead of just Supabase?**
Reviewers can clone and run the project without needing to set up a database. The switch is transparent — same store API, different data source.

**Why no chart library?**
The funnel and bar charts are built with pure CSS/Tailwind. It keeps the bundle small and avoids fighting a library's opinion of what a chart should look like. The trade-off is less flexibility for complex visualizations.

**Why inline SVG icons?**
No icon library dependency. Each icon is a handful of SVG paths. The bundle doesn't grow, there's no class naming to memorize, and the icons look consistent across all sizes.

**Known limitations / roadmap**
- [ ] CV file upload (Supabase Storage is set up, UI pending)
- [ ] Candidate creation form (currently candidates come from applying to an offer)
- [ ] Real-time pipeline updates via Supabase channels (TODO left in `pipeline.ts`)
- [ ] Email notifications on stage change
- [ ] Pagination for candidate table (noted as TODO when > 50 candidates)
- [ ] i18n — German localization (`de`) for Personalverwaltung context

---

## Running tests

```bash
npm run test              # watch mode
npm run test -- --run     # single run
npm run test:coverage     # coverage report
```

24 unit tests covering auth, job CRUD, and pipeline operations. Tests run against the Pinia stores directly — no browser required.

---

## License

MIT
