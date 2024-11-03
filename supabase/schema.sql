-- TalentFlow ATS — Supabase Schema
-- Run this in the Supabase SQL editor to create the full schema.

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ───────────────────────────────────────────────────────────────────
create type user_role      as enum ('admin', 'recruiter', 'manager');
create type job_status     as enum ('draft', 'published', 'paused', 'closed');
create type job_type       as enum ('full-time', 'part-time', 'contract', 'internship');
create type work_mode      as enum ('on-site', 'remote', 'hybrid');
create type app_status     as enum ('active', 'rejected', 'withdrawn');
create type template_type  as enum ('job', 'evaluation');

-- ─── Profiles (extends auth.users) ───────────────────────────────────────────
create table profiles (
  id           uuid primary key references auth.users on delete cascade,
  email        text not null,
  full_name    text not null,
  role         user_role not null default 'recruiter',
  avatar_url   text,
  department_id uuid,
  created_at   timestamptz default now()
);

-- ─── Departments ─────────────────────────────────────────────────────────────
create table departments (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  created_at  timestamptz default now()
);

alter table profiles add constraint fk_department
  foreign key (department_id) references departments(id) on delete set null;

-- ─── Jobs ─────────────────────────────────────────────────────────────────────
create table jobs (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  department_id uuid references departments(id) on delete set null,
  description   text not null default '',
  requirements  text not null default '',
  status        job_status not null default 'draft',
  type          job_type not null default 'full-time',
  work_mode     work_mode not null default 'hybrid',
  location      text not null,
  salary_min    integer,
  salary_max    integer,
  template_id   uuid,
  created_by    uuid not null references profiles(id),
  created_at    timestamptz default now(),
  published_at  timestamptz,
  closed_at     timestamptz
);

-- ─── Pipeline Stages ─────────────────────────────────────────────────────────
create table pipeline_stages (
  id         uuid primary key default uuid_generate_v4(),
  job_id     uuid not null references jobs(id) on delete cascade,
  name       text not null,
  "order"    smallint not null,
  color      text not null default '#64748b',
  created_at timestamptz default now()
);

-- ─── Candidates ───────────────────────────────────────────────────────────────
create table candidates (
  id             uuid primary key default uuid_generate_v4(),
  first_name     text not null,
  last_name      text not null,
  email          text not null unique,
  phone          text,
  linkedin_url   text,
  portfolio_url  text,
  created_at     timestamptz default now()
);

-- ─── Applications ─────────────────────────────────────────────────────────────
create table applications (
  id           uuid primary key default uuid_generate_v4(),
  job_id       uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references candidates(id) on delete cascade,
  stage_id     uuid not null references pipeline_stages(id),
  status       app_status not null default 'active',
  source       text,
  cover_letter text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (job_id, candidate_id)
);

-- ─── Evaluations ──────────────────────────────────────────────────────────────
create table evaluations (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  evaluator_id   uuid not null references profiles(id),
  score          smallint check (score between 1 and 5),
  notes          text not null default '',
  created_at     timestamptz default now()
);

-- ─── Documents ────────────────────────────────────────────────────────────────
create table documents (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  name           text not null,
  file_path      text not null,
  file_type      text not null,
  size           integer not null,
  uploaded_at    timestamptz default now()
);

-- ─── Templates ────────────────────────────────────────────────────────────────
create table templates (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  type       template_type not null,
  content    text not null default '',
  created_by uuid not null references profiles(id),
  created_at timestamptz default now()
);

-- ─── Activities ───────────────────────────────────────────────────────────────
create table activities (
  id             uuid primary key default uuid_generate_v4(),
  application_id uuid not null references applications(id) on delete cascade,
  user_id        uuid not null references profiles(id),
  action         text not null,
  metadata       jsonb not null default '{}',
  created_at     timestamptz default now()
);

-- ─── RLS Policies ─────────────────────────────────────────────────────────────
alter table profiles        enable row level security;
alter table departments     enable row level security;
alter table jobs            enable row level security;
alter table pipeline_stages enable row level security;
alter table candidates      enable row level security;
alter table applications    enable row level security;
alter table evaluations     enable row level security;
alter table documents       enable row level security;
alter table templates       enable row level security;
alter table activities      enable row level security;

-- Helper: get current user role
create or replace function current_role_ats()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer stable;

-- Profiles: visible to authenticated users
create policy "profiles_select" on profiles for select to authenticated using (true);
create policy "profiles_update" on profiles for update to authenticated using (id = auth.uid());

-- Jobs: all authenticated can read; only admin/recruiter can write
create policy "jobs_select"  on jobs for select to authenticated using (true);
create policy "jobs_insert"  on jobs for insert to authenticated with check (current_role_ats() in ('admin','recruiter'));
create policy "jobs_update"  on jobs for update to authenticated using (current_role_ats() in ('admin','recruiter'));
create policy "jobs_delete"  on jobs for delete to authenticated using (current_role_ats() = 'admin');

-- Pipeline stages: same as jobs
create policy "stages_select" on pipeline_stages for select to authenticated using (true);
create policy "stages_write"  on pipeline_stages for all   to authenticated using (current_role_ats() in ('admin','recruiter'));

-- Candidates: all authenticated
create policy "candidates_select" on candidates for select to authenticated using (true);
create policy "candidates_write"  on candidates for all    to authenticated using (current_role_ats() in ('admin','recruiter'));

-- Applications: all authenticated can read; admin/recruiter can write
create policy "apps_select" on applications for select to authenticated using (true);
create policy "apps_write"  on applications for all    to authenticated using (current_role_ats() in ('admin','recruiter'));

-- Evaluations: all can read; managers can write evaluations
create policy "evals_select" on evaluations for select to authenticated using (true);
create policy "evals_insert" on evaluations for insert to authenticated with check (current_role_ats() in ('admin','recruiter','manager'));

-- Documents: all can read; recruiter can upload
create policy "docs_select" on documents for select to authenticated using (true);
create policy "docs_insert" on documents for insert to authenticated with check (current_role_ats() in ('admin','recruiter'));

-- Templates: all can read; admin/recruiter can write
create policy "templates_select" on templates for select to authenticated using (true);
create policy "templates_write"  on templates for all    to authenticated using (current_role_ats() in ('admin','recruiter'));

-- Activities: all can read; system inserts
create policy "activities_select" on activities for select to authenticated using (true);
create policy "activities_insert" on activities for insert to authenticated with check (true);

-- ─── Trigger: updated_at on applications ────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger applications_updated_at
  before update on applications
  for each row execute function set_updated_at();

-- ─── Trigger: auto-create profile on signup ───────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'recruiter'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
