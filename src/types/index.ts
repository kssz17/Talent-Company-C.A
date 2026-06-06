// ─── Auth / Users ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'recruiter' | 'manager' | 'candidate'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  department_id: string | null
  created_at: string
}

// ─── Departments ─────────────────────────────────────────────────────────────

export interface Department {
  id: string
  name: string
  description: string | null
  created_at: string
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export type JobStatus = 'draft' | 'published' | 'paused' | 'closed'
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship'
export type WorkMode = 'on-site' | 'remote' | 'hybrid'

export interface Job {
  id: string
  title: string
  department_id: string | null
  department?: Department
  description: string
  requirements: string
  status: JobStatus
  type: JobType
  work_mode: WorkMode
  location: string
  salary_min: number | null
  salary_max: number | null
  template_id: string | null
  created_by: string
  creator?: Profile
  created_at: string
  published_at: string | null
  closed_at: string | null
  _count?: { applications: number }
}

// ─── Pipeline Stages ─────────────────────────────────────────────────────────

export interface PipelineStage {
  id: string
  job_id: string
  name: string
  order: number
  color: string
  created_at: string
}

export const DEFAULT_STAGES: Omit<PipelineStage, 'id' | 'job_id' | 'created_at'>[] = [
  { name: 'Aplicados',  order: 1, color: '#64748b' },
  { name: 'Revisión',   order: 2, color: '#3b82f6' },
  { name: 'Entrevista', order: 3, color: '#8b5cf6' },
  { name: 'Oferta',     order: 4, color: '#f59e0b' },
  { name: 'Contratado', order: 5, color: '#10b981' },
]

// ─── Candidates ───────────────────────────────────────────────────────────────

export interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  created_at: string
  full_name?: string
}

// ─── Applications ─────────────────────────────────────────────────────────────

export type ApplicationStatus = 'active' | 'rejected' | 'withdrawn'

export interface Application {
  id: string
  job_id: string
  job?: Job
  candidate_id: string
  candidate?: Candidate
  stage_id: string
  stage?: PipelineStage
  status: ApplicationStatus
  source: string | null
  cover_letter: string | null
  created_at: string
  updated_at: string
  evaluations?: Evaluation[]
  documents?: Document[]
  activities?: Activity[]
}

// ─── Evaluations ──────────────────────────────────────────────────────────────

export interface Evaluation {
  id: string
  application_id: string
  evaluator_id: string
  evaluator?: Profile
  score: number | null
  notes: string
  created_at: string
}

// ─── Documents ────────────────────────────────────────────────────────────────

export interface Document {
  id: string
  application_id: string
  name: string
  file_path: string
  file_type: string
  size: number
  uploaded_at: string
}

// ─── Templates ────────────────────────────────────────────────────────────────

export type TemplateType = 'job' | 'evaluation'

export interface Template {
  id: string
  name: string
  type: TemplateType
  content: string
  created_by: string
  created_at: string
}

// ─── Activities ───────────────────────────────────────────────────────────────

export interface Activity {
  id: string
  application_id: string
  user_id: string
  user?: Profile
  action: string
  metadata: Record<string, unknown>
  created_at: string
}

// ─── Application with guaranteed relations ────────────────────────────────────
// Used by fetchAllApplications (cross-job metrics, dashboard, reports).
// All foreign keys are always joined, so no `as any` casts needed.

export interface ApplicationWithRelations extends Omit<Application, 'stage' | 'candidate' | 'job'> {
  stage:     PipelineStage
  candidate: Pick<Candidate, 'id' | 'first_name' | 'last_name' | 'email' | 'phone'>
  job:       Pick<Job, 'id' | 'title' | 'location' | 'work_mode'> & {
    department?: Pick<Department, 'name'>
  }
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface PipelineMetrics {
  total_jobs: number
  active_jobs: number
  total_applications: number
  hired_this_month: number
  avg_days_to_hire: number
  conversion_rate: number
  applications_by_stage: { stage: string; count: number; color: string }[]
  applications_by_month: { month: string; count: number }[]
  top_sources: { source: string; count: number }[]
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Paginated<T> {
  data: T[]
  count: number
  page: number
  per_page: number
}

export interface Filters {
  search?: string
  status?: string
  department_id?: string
  type?: string
  page?: number
  per_page?: number
}
