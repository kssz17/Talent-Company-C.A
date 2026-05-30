/**
 * Datos de demostración usados cuando Supabase no está configurado.
 * Activa el modo real añadiendo credenciales en .env.local
 *
 * TODO: eliminar este archivo cuando el 100% de las vistas consuma Supabase
 */
import type {
  Profile, Job, Candidate, Application, PipelineStage,
  Evaluation, Department, PipelineMetrics, Activity,
} from '@/types'

export const mockDepartments: Department[] = [
  { id: 'd1', name: 'Tecnología',       description: 'Ingeniería y desarrollo de producto', created_at: '2024-03-12' },
  { id: 'd2', name: 'Marketing',        description: 'Growth, contenido y comunicación',    created_at: '2024-03-12' },
  { id: 'd3', name: 'Recursos Humanos', description: 'People & Culture',                    created_at: '2024-03-12' },
  { id: 'd4', name: 'Operaciones',      description: 'Procesos internos y logística',       created_at: '2024-03-14' },
  { id: 'd5', name: 'Ventas',           description: 'Comercial y partnerships',            created_at: '2024-03-14' },
]

export const mockProfiles: Profile[] = [
  { id: 'u1', email: 'admin@talentflow.dev',     full_name: 'Ana García',      role: 'admin',     avatar_url: null, department_id: 'd3', created_at: '2024-01-08' },
  { id: 'u2', email: 'recruiter@talentflow.dev', full_name: 'Carlos Méndez',   role: 'recruiter', avatar_url: null, department_id: 'd3', created_at: '2024-02-03' },
  { id: 'u3', email: 'manager@talentflow.dev',   full_name: 'Laura Fernández', role: 'manager',   avatar_url: null, department_id: 'd1', created_at: '2024-02-17' },
  { id: 'u4', email: 'candidato@demo.com',        full_name: 'Kevin Sanchez',   role: 'candidate', avatar_url: null, department_id: null, created_at: '2024-03-01' },
]

// Solicitudes del candidato demo para el portal
export interface MyApplication {
  id: string
  job_id: string
  job_title: string
  company:   string
  location:  string
  work_mode: string
  stage:     string
  stage_color: string
  status:    'active' | 'rejected' | 'withdrawn'
  applied_at: string
}

export const mockMyApplications: MyApplication[] = [
  { id: 'ma1', job_id: 'j1', job_title: 'Frontend Developer — Vue.js + TypeScript', company: 'Talent Company C.A', location: 'Madrid', work_mode: 'hybrid',  stage: 'Entrevista', stage_color: '#8b5cf6', status: 'active',   applied_at: '2024-11-02' },
  { id: 'ma2', job_id: 'j2', job_title: 'Product Designer UI/UX',                   company: 'Talent Company C.A', location: 'Barcelona', work_mode: 'remote', stage: 'Revisión',   stage_color: '#3b82f6', status: 'active',   applied_at: '2024-10-28' },
  { id: 'ma3', job_id: 'j3', job_title: 'Backend Engineer — Node.js',               company: 'Talent Company C.A', location: 'Valencia',  work_mode: 'on-site',stage: 'Aplicados',  stage_color: '#64748b', status: 'rejected', applied_at: '2024-10-15' },
]

export const mockStages: PipelineStage[] = [
  { id: 's1', job_id: 'j1', name: 'Aplicados',  order: 1, color: '#64748b', created_at: '2024-01-08' },
  { id: 's2', job_id: 'j1', name: 'Revisión',   order: 2, color: '#3b82f6', created_at: '2024-01-08' },
  { id: 's3', job_id: 'j1', name: 'Entrevista', order: 3, color: '#8b5cf6', created_at: '2024-01-08' },
  { id: 's4', job_id: 'j1', name: 'Oferta',     order: 4, color: '#f59e0b', created_at: '2024-01-08' },
  { id: 's5', job_id: 'j1', name: 'Contratado', order: 5, color: '#10b981', created_at: '2024-01-08' },
]

export const mockJobs: Job[] = [
  {
    id: 'j1',
    title: 'Frontend Developer — Vue.js + TypeScript',
    department_id: 'd1',
    department: mockDepartments[0],
    description: `Buscamos un **Frontend Developer** para reforzar nuestro equipo de producto.\n\nTrabajará codo a codo con diseño y backend en una plataforma SaaS B2B con ~8.000 usuarios activos. El stack es Vue 3 + TypeScript y usamos Supabase como BaaS.\n\nEl trabajo es híbrido (Madrid), con dos días de teletrabajo a la semana.`,
    requirements: `- Vue 3 (Composition API) — mínimo 2 años\n- TypeScript estricto\n- Tests unitarios con Vitest o Jest\n- Git + PRs + code review\n- Se valora: Supabase / PostgreSQL, Figma`,
    status: 'published',
    type: 'full-time',
    work_mode: 'hybrid',
    location: 'Madrid',
    salary_min: 34000,
    salary_max: 48000,
    template_id: null,
    created_by: 'u2',
    creator: mockProfiles[1],
    created_at: '2024-10-28',
    published_at: '2024-10-29',
    closed_at: null,
    _count: { applications: 8 },
  },
  {
    id: 'j2',
    title: 'Recruiter IT — sector tecnológico',
    department_id: 'd3',
    department: mockDepartments[2],
    description: `Incorporamos un Recruiter con foco en perfiles técnicos (dev, QA, DevOps). Llevarás end-to-end los procesos de selección para cliente final y consultoras.`,
    requirements: `- Experiencia mínima 3 años en reclutamiento IT\n- Uso habitual de LinkedIn Recruiter\n- Inglés B2 (se hacen entrevistas en inglés)\n- Habilidades de negociación`,
    status: 'published',
    type: 'full-time',
    work_mode: 'on-site',
    location: 'Barcelona',
    salary_min: 38000,
    salary_max: 52000,
    template_id: null,
    created_by: 'u1',
    creator: mockProfiles[0],
    created_at: '2024-11-04',
    published_at: '2024-11-05',
    closed_at: null,
    _count: { applications: 5 },
  },
  {
    id: 'j3',
    title: 'Growth Marketing Manager',
    department_id: 'd2',
    department: mockDepartments[1],
    description: 'Liderarás la estrategia de adquisición B2B: SEO técnico, campañas de performance y automatización de marketing.',
    requirements: `- +4 años en marketing digital B2B\n- Google Ads + Meta Business certificado\n- Experiencia con HubSpot o similar\n- Analítica avanzada (GA4, Looker Studio)`,
    status: 'draft',
    type: 'full-time',
    work_mode: 'remote',
    location: 'Remoto (España)',
    salary_min: 42000,
    salary_max: 58000,
    template_id: null,
    created_by: 'u2',
    creator: mockProfiles[1],
    created_at: '2024-11-18',
    published_at: null,
    closed_at: null,
    _count: { applications: 0 },
  },
  {
    id: 'j4',
    title: 'Backend Developer — Node.js',
    department_id: 'd1',
    department: mockDepartments[0],
    description: 'Desarrollará APIs REST y gestionará migraciones de base de datos en un entorno de microservicios.',
    requirements: `- Node.js + TypeScript\n- PostgreSQL avanzado\n- Docker\n- AWS (EC2, RDS, S3)`,
    status: 'closed',
    type: 'full-time',
    work_mode: 'hybrid',
    location: 'Madrid',
    salary_min: 38000,
    salary_max: 54000,
    template_id: null,
    created_by: 'u2',
    creator: mockProfiles[1],
    created_at: '2024-08-19',
    published_at: '2024-08-22',
    closed_at: '2024-10-31',
    _count: { applications: 23 },
  },
]

export const mockCandidates: Candidate[] = [
  { id: 'c1', first_name: 'Marc',      last_name: 'Viladrich',   email: 'marc.viladrich@gmail.com',   phone: '+34 621 445 381', linkedin_url: 'https://linkedin.com/in/marc-v', portfolio_url: 'https://marcv.dev', created_at: '2024-10-31' },
  { id: 'c2', first_name: 'Nuria',     last_name: 'Camps',       email: 'nuria.camps@outlook.com',    phone: '+34 634 112 908', linkedin_url: null, portfolio_url: null, created_at: '2024-11-02' },
  { id: 'c3', first_name: 'Ibai',      last_name: 'Etxebarria',  email: 'ibai.etx@proton.me',         phone: '+34 655 203 741', linkedin_url: 'https://linkedin.com/in/ibai-etx', portfolio_url: null, created_at: '2024-11-05' },
  { id: 'c4', first_name: 'Valentina', last_name: 'Ríos',        email: 'vrios.dev@gmail.com',        phone: null, linkedin_url: null, portfolio_url: 'https://vrios.io', created_at: '2024-11-07' },
  { id: 'c5', first_name: 'Ferran',    last_name: 'Puigdomènech',email: 'f.puig@yahoo.es',            phone: '+34 612 987 003', linkedin_url: 'https://linkedin.com/in/fpuig', portfolio_url: null, created_at: '2024-11-09' },
  { id: 'c6', first_name: 'Ainhoa',    last_name: 'Larrea',      email: 'alarrea@hotmail.com',        phone: '+34 677 345 219', linkedin_url: null, portfolio_url: null, created_at: '2024-11-12' },
  { id: 'c7', first_name: 'Rodrigo',   last_name: 'Salgado',     email: 'rodrigo.salgado@gmail.com',  phone: '+34 609 781 442', linkedin_url: 'https://linkedin.com/in/rsalgado', portfolio_url: 'https://rsalgado.me', created_at: '2024-11-14' },
  { id: 'c8', first_name: 'Txell',     last_name: 'Guitart',     email: 'txell.guitart@live.com',     phone: null, linkedin_url: null, portfolio_url: null, created_at: '2024-11-17' },
]

const stageMap: Record<string, string> = {
  c1: 's3', c2: 's2', c3: 's1', c4: 's4', c5: 's1', c6: 's2', c7: 's5', c8: 's1',
}

export const mockApplications: Application[] = mockCandidates.map((c, i) => ({
  id: `a${i + 1}`,
  job_id: 'j1',
  job: mockJobs[0],
  candidate_id: c.id,
  candidate: { ...c, full_name: `${c.first_name} ${c.last_name}` },
  stage_id: stageMap[c.id],
  stage: mockStages.find(s => s.id === stageMap[c.id]),
  status: 'active' as const,
  source: ['LinkedIn', 'Referido', 'Web propia', 'Infojobs', 'Indeed'][i % 5],
  cover_letter: i === 0
    ? 'Estimado equipo,\n\nMe dirijo a ustedes para expresar mi interés en la posición de Frontend Developer. Llevo tres años trabajando con Vue 3 en proyectos de e-commerce y SaaS...'
    : null,
  created_at: `2024-11-${String(1 + i).padStart(2, '0')}`,
  updated_at: `2024-11-${String(8 + i).padStart(2, '0')}`,
  evaluations: [],
  documents: [],
  activities: [],
}))

export const mockEvaluations: Evaluation[] = [
  {
    id: 'e1',
    application_id: 'a1',
    evaluator_id: 'u3',
    evaluator: mockProfiles[2],
    score: 4,
    notes: 'Buen dominio de Vue 3 y TypeScript. El portfolio es sólido aunque le falta algo de experiencia en testing. Recomiendo pasar a entrevista técnica.',
    created_at: '2024-11-19',
  },
  {
    id: 'e2',
    application_id: 'a4',
    evaluator_id: 'u3',
    evaluator: mockProfiles[2],
    score: 5,
    notes: 'Perfil muy completo. Portfolio con proyectos reales, buena comunicación en la llamada inicial. Candidata prioritaria — no dejar enfriar.',
    created_at: '2024-11-21',
  },
]

export const mockActivities: Activity[] = [
  { id: 'act1', application_id: 'a1', user_id: 'u2', user: mockProfiles[1], action: 'stage_changed',    metadata: { from: 'Aplicados', to: 'Revisión' },   created_at: '2024-11-08' },
  { id: 'act2', application_id: 'a1', user_id: 'u3', user: mockProfiles[2], action: 'evaluation_added', metadata: { score: 4 },                            created_at: '2024-11-19' },
  { id: 'act3', application_id: 'a1', user_id: 'u2', user: mockProfiles[1], action: 'stage_changed',    metadata: { from: 'Revisión', to: 'Entrevista' },   created_at: '2024-11-22' },
]

// Métricas con números irregulares — más creíbles
export const mockMetrics: PipelineMetrics = {
  total_jobs: 4,
  active_jobs: 2,
  total_applications: 41,   // no 36 redondo
  hired_this_month: 3,
  avg_days_to_hire: 31,     // no 28 perfecto
  conversion_rate: 11.3,    // no 12.5 limpio
  applications_by_stage: [
    { stage: 'Aplicados',  count: 16, color: '#64748b' },
    { stage: 'Revisión',   count: 11, color: '#3b82f6' },
    { stage: 'Entrevista', count: 8,  color: '#8b5cf6' },
    { stage: 'Oferta',     count: 3,  color: '#f59e0b' },
    { stage: 'Contratado', count: 3,  color: '#10b981' },
  ],
  applications_by_month: [
    { month: 'Jul', count: 5 },
    { month: 'Ago', count: 9 },
    { month: 'Sep', count: 14 },
    { month: 'Oct', count: 21 },
    { month: 'Nov', count: 41 },
  ],
  top_sources: [
    { source: 'LinkedIn',   count: 21 },
    { source: 'Web propia', count: 9 },
    { source: 'Referido',   count: 6 },
    { source: 'Infojobs',   count: 3 },
    { source: 'Indeed',     count: 2 },
  ],
}
