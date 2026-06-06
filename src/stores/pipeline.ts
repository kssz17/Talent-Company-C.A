import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Application, ApplicationWithRelations, PipelineStage, Evaluation } from '@/types'
import { mockApplications, mockStages, mockEvaluations, mockActivities } from '@/lib/mock'
import { useAuthStore } from './auth'
import { useToastStore } from './toast'

const useMock = !!import.meta.env.VITEST ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('your-project')

// Query para cargar una application con todas sus relaciones
const APPLICATION_QUERY = `
  *,
  candidate:candidates(*),
  stage:pipeline_stages(*),
  evaluations(
    *,
    evaluator:profiles(id, full_name, email, role)
  ),
  documents(*),
  activities(
    *,
    user:profiles(id, full_name, email, role)
  )
` as const

export const usePipelineStore = defineStore('pipeline', () => {
  const applications    = ref<Application[]>([])
  const allApplications = ref<ApplicationWithRelations[]>([])  // cross-job, for metrics
  const stages          = ref<PipelineStage[]>([])
  const loading         = ref(false)
  const loadingAll      = ref(false)
  const error           = ref<string | null>(null)
  const activeJobId     = ref<string | null>(null)

  // ── Computed ──────────────────────────────────────────────

  const stagesForJob = computed(() =>
    stages.value
      .filter(s => s.job_id === activeJobId.value)
      .sort((a, b) => a.order - b.order),
  )

  const applicationsByStage = computed(() => {
    const map = new Map<string, Application[]>()
    stagesForJob.value.forEach(s => map.set(s.id, []))
    applications.value
      .filter(a => a.job_id === activeJobId.value && a.status === 'active')
      .forEach(a => map.get(a.stage_id)?.push(a))
    return map
  })

  function getApplicationById(id: string) {
    return applications.value.find(a => a.id === id) ?? null
  }

  // ── Data fetching ─────────────────────────────────────────

  async function setActiveJob(jobId: string) {
    activeJobId.value = jobId

    if (useMock) {
      stages.value = mockStages.filter(s => s.job_id === jobId)
      applications.value = mockApplications
        .filter(a => a.job_id === jobId)
        .map(a => ({
          ...a,
          evaluations: mockEvaluations.filter(e => e.application_id === a.id),
          activities:  mockActivities.filter(act => act.application_id === a.id),
        }))
      return
    }

    loading.value = true
    error.value   = null

    const [stagesRes, appsRes] = await Promise.all([
      supabase
        .from('pipeline_stages')
        .select('*')
        .eq('job_id', jobId)
        .order('order'),

      supabase
        .from('applications')
        .select(APPLICATION_QUERY)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false }),
    ])

    if (stagesRes.error) error.value = stagesRes.error.message
    else stages.value = (stagesRes.data ?? []) as PipelineStage[]

    if (appsRes.error) error.value = appsRes.error.message
    else applications.value = (appsRes.data ?? []) as unknown as Application[]

    loading.value = false
  }

  // ── Fetch all (for metrics / dashboard) ──────────────────

  async function fetchAllApplications() {
    if (useMock) {
      allApplications.value = mockApplications.map(a => ({
        ...a,
        evaluations: mockEvaluations.filter(e => e.application_id === a.id),
        activities:  mockActivities.filter(act => act.application_id === a.id),
      })) as unknown as ApplicationWithRelations[]
      return
    }

    loadingAll.value = true
    const { data } = await supabase
      .from('applications')
      .select(`
        id, job_id, candidate_id, stage_id, status, source, cover_letter,
        created_at, updated_at,
        candidate:candidates(id, first_name, last_name, email, phone),
        stage:pipeline_stages(id, name, color, "order"),
        job:jobs(id, title, location, work_mode, department:departments(name))
      `)
      .order('created_at', { ascending: false })

    if (data) allApplications.value = data as unknown as ApplicationWithRelations[]
    loadingAll.value = false
  }

  // ── Mutations ─────────────────────────────────────────────

  async function moveApplication(applicationId: string, newStageId: string) {
    const auth  = useAuthStore()
    const toast = useToastStore()
    const idx   = applications.value.findIndex(a => a.id === applicationId)
    if (idx === -1) return

    const app      = applications.value[idx]
    const oldStage = stages.value.find(s => s.id === app.stage_id)
    const newStage = stages.value.find(s => s.id === newStageId)

    // Optimistic update
    const newActivity = {
      id:             `act-${Date.now()}`,
      application_id: applicationId,
      user_id:        auth.profile?.id ?? '',
      user:           auth.profile ?? undefined,
      action:         'stage_changed',
      metadata:       { from: oldStage?.name, to: newStage?.name },
      created_at:     new Date().toISOString(),
    }

    applications.value[idx] = {
      ...app,
      stage_id:   newStageId,
      stage:      newStage,
      updated_at: new Date().toISOString(),
      activities: [...(app.activities ?? []), newActivity],
    }

    if (!useMock) {
      const { error: sbErr } = await supabase
        .from('applications')
        .update({ stage_id: newStageId })
        .eq('id', applicationId)

      if (sbErr) {
        error.value = sbErr.message
        applications.value[idx] = app   // rollback
        toast.error('Error al mover candidato', sbErr.message)
        return
      }

      await supabase.from('activities').insert({
        application_id: applicationId,
        user_id:        auth.profile?.id,
        action:         'stage_changed',
        metadata:       { from: oldStage?.name, to: newStage?.name },
      })
    }

    toast.success('Candidato movido', `${newStage?.name ?? 'nueva etapa'}`)
  }

  async function addEvaluation(
    applicationId: string,
    score: number | null,
    notes: string,
  ): Promise<Evaluation | undefined> {
    const auth  = useAuthStore()
    const toast = useToastStore()
    const idx   = applications.value.findIndex(a => a.id === applicationId)
    if (idx === -1) return

    const evaluation: Evaluation = {
      id:             `e-${Date.now()}`,
      application_id: applicationId,
      evaluator_id:   auth.profile?.id ?? '',
      evaluator:      auth.profile ?? undefined,
      score,
      notes,
      created_at:     new Date().toISOString(),
    }

    const app = applications.value[idx]
    applications.value[idx] = {
      ...app,
      evaluations: [...(app.evaluations ?? []), evaluation],
    }

    if (!useMock) {
      const { data, error: sbErr } = await supabase
        .from('evaluations')
        .insert({
          application_id: applicationId,
          evaluator_id:   auth.profile?.id,
          score,
          notes,
        })
        .select(`*, evaluator:profiles(id, full_name, email, role)`)
        .single()

      if (sbErr) {
        error.value = sbErr.message
        applications.value[idx] = app   // rollback
        toast.error('Error al guardar evaluación', sbErr.message)
        return
      }

      const evals = applications.value[idx].evaluations ?? []
      const eIdx  = evals.findIndex(e => e.id === evaluation.id)
      if (eIdx !== -1) evals[eIdx] = data as unknown as Evaluation
      toast.success('Evaluación guardada')
      return data as unknown as Evaluation
    }

    toast.success('Evaluación guardada')
    return evaluation
  }

  async function rejectApplication(applicationId: string) {
    const toast = useToastStore()
    const idx   = applications.value.findIndex(a => a.id === applicationId)
    if (idx === -1) return

    applications.value[idx] = { ...applications.value[idx], status: 'rejected' }

    if (!useMock) {
      const { error: sbErr } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId)

      if (sbErr) {
        toast.error('Error al descartar candidato', sbErr.message)
        return
      }
    }

    toast.info('Candidato descartado')
  }

  // ── Realtime (TODO) ───────────────────────────────────────
  // supabase.channel('pipeline').on('postgres_changes', ...).subscribe()

  return {
    applications, stages, loading, error, activeJobId,
    stagesForJob, applicationsByStage,
    getApplicationById, setActiveJob, fetchAllApplications,
    moveApplication, addEvaluation, rejectApplication,
    allApplications, loadingAll,
  }
})
