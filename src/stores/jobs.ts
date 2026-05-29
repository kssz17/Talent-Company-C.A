import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Job, JobStatus, Filters } from '@/types'
import { DEFAULT_STAGES } from '@/types'
import { mockJobs } from '@/lib/mock'
import { useAuthStore } from './auth'

const useMock = !!import.meta.env.VITEST ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('your-project')

// Supabase devuelve el count de relaciones así: [{ count: N }]
function extractCount(rel: unknown): number {
  if (Array.isArray(rel) && rel.length > 0 && typeof rel[0] === 'object') {
    return (rel[0] as { count?: number }).count ?? 0
  }
  return 0
}

export const useJobsStore = defineStore('jobs', () => {
  const jobs    = ref<Job[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)
  const filters = ref<Filters>({ search: '', status: '', department_id: '' })

  // ── Computed ──────────────────────────────────────────────

  const filtered = computed(() => {
    let list = jobs.value
    const { search, status, department_id } = filters.value
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.department?.name.toLowerCase().includes(q),
      )
    }
    if (status)        list = list.filter(j => j.status === status)
    if (department_id) list = list.filter(j => j.department_id === department_id)
    return list
  })

  const totalByStatus = computed(() => ({
    published: jobs.value.filter(j => j.status === 'published').length,
    draft:     jobs.value.filter(j => j.status === 'draft').length,
    paused:    jobs.value.filter(j => j.status === 'paused').length,
    closed:    jobs.value.filter(j => j.status === 'closed').length,
  }))

  function getById(id: string) {
    return jobs.value.find(j => j.id === id) ?? null
  }

  // ── Data fetching ─────────────────────────────────────────

  async function fetchJobs() {
    loading.value = true
    error.value   = null

    if (useMock) {
      await new Promise(r => setTimeout(r, 200))
      jobs.value    = [...mockJobs]
      loading.value = false
      return
    }

    const { data, error: sbErr } = await supabase
      .from('jobs')
      .select(`
        *,
        department:departments(*),
        creator:profiles!created_by(id, full_name, email, role),
        applications(count)
      `)
      .order('created_at', { ascending: false })

    if (sbErr) {
      error.value   = sbErr.message
      loading.value = false
      return
    }

    jobs.value = (data ?? []).map(j => ({
      ...j,
      _count: { applications: extractCount(j.applications) },
    })) as unknown as Job[]

    loading.value = false
  }

  // ── CRUD ──────────────────────────────────────────────────

  async function create(
    payload: Omit<Job, 'id' | 'created_at' | '_count' | 'creator' | 'department'>,
  ): Promise<Job> {
    loading.value = true

    if (useMock) {
      await new Promise(r => setTimeout(r, 300))
      const job: Job = {
        ...payload,
        id:         `j${Date.now()}`,
        created_at: new Date().toISOString(),
        _count:     { applications: 0 },
        creator:    useAuthStore().profile ?? undefined,
      }
      jobs.value.unshift(job)
      loading.value = false
      return job
    }

    const auth = useAuthStore()

    // Mapeamos solo las columnas escalares que existen en la tabla.
    // Esto evita pasar campos de relación (creator, department) a Supabase
    // y convierte department_id vacío en null para no violar el tipo uuid.
    const { data, error: sbErr } = await supabase
      .from('jobs')
      .insert({
        title:         payload.title,
        description:   payload.description,
        requirements:  payload.requirements,
        status:        payload.status,
        type:          payload.type,
        work_mode:     payload.work_mode,
        location:      payload.location,
        salary_min:    payload.salary_min   ?? null,
        salary_max:    payload.salary_max   ?? null,
        department_id: payload.department_id || null,
        template_id:   payload.template_id  ?? null,
        published_at:  payload.published_at,
        closed_at:     payload.closed_at,
        created_by:    auth.profile?.id,
      })
      .select('*')
      .single()

    if (sbErr || !data) {
      error.value = sbErr?.message ?? 'Error al crear la oferta'
      loading.value = false
      throw new Error(error.value)
    }

    // Crear etapas por defecto para la nueva oferta
    await _createDefaultStages(data.id)

    const job: Job = {
      ...data as unknown as Job,
      _count:   { applications: 0 },
      creator:  auth.profile ?? undefined,
    }
    jobs.value.unshift(job)
    loading.value = false
    return job
  }

  async function update(id: string, payload: Partial<Job>) {
    loading.value = true

    if (useMock) {
      await new Promise(r => setTimeout(r, 250))
      const idx = jobs.value.findIndex(j => j.id === id)
      if (idx !== -1) Object.assign(jobs.value[idx], payload)
      loading.value = false
      return
    }

    // Extraemos relaciones y normalizamos department_id vacío → null
    const { department: _dep, creator: _cr, _count: _cnt, ...fields } = payload
    if ('department_id' in fields && !fields.department_id) fields.department_id = null
    const { error: sbErr } = await supabase.from('jobs').update(fields).eq('id', id)

    if (!sbErr) {
      const idx = jobs.value.findIndex(j => j.id === id)
      if (idx !== -1) Object.assign(jobs.value[idx], payload)
    } else {
      error.value = sbErr.message
    }
    loading.value = false
  }

  async function changeStatus(id: string, status: JobStatus) {
    const patch: Partial<Job> = { status }
    if (status === 'published') patch.published_at = new Date().toISOString()
    if (status === 'closed')   patch.closed_at    = new Date().toISOString()
    await update(id, patch)
  }

  async function remove(id: string) {
    if (!useMock) {
      await supabase.from('jobs').delete().eq('id', id)
    }
    jobs.value = jobs.value.filter(j => j.id !== id)
  }

  // ── Private helpers ───────────────────────────────────────

  async function _createDefaultStages(jobId: string) {
    const rows = DEFAULT_STAGES.map(s => ({ ...s, job_id: jobId }))
    await supabase.from('pipeline_stages').insert(rows)
  }

  return {
    jobs, loading, error, filters,
    filtered, totalByStatus,
    getById, fetchJobs, create, update, changeStatus, remove,
  }
})
