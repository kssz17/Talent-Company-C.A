<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { usePipelineStore } from '@/stores/pipeline'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import { useColorHash } from '@/composables/useColorHash'

const router    = useRouter()
const auth      = useAuthStore()
const jobsStore = useJobsStore()
const pipeline  = usePipelineStore()

onMounted(() => {
  if (!jobsStore.jobs.length) jobsStore.fetchJobs()
  pipeline.fetchAllApplications()
})

// ── Computed metrics from real data ───────────────────────────
const metrics = computed(() => {
  const apps = pipeline.allApplications   // ApplicationWithRelations[] — fully typed
  const jobs = jobsStore.jobs

  const total_jobs         = jobs.length
  const active_jobs        = jobs.filter(j => j.status === 'published').length
  const total_applications = apps.length

  // Applications per stage
  const stageMap = new Map<string, { stage: string; color: string; count: number }>()
  for (const app of apps) {
    const s = app.stage
    if (!s?.name) continue
    if (!stageMap.has(s.name)) stageMap.set(s.name, { stage: s.name, color: s.color, count: 0 })
    stageMap.get(s.name)!.count++
  }
  const applications_by_stage = [...stageMap.values()].sort((a, b) => b.count - a.count)

  // Hired this month
  const now = new Date()
  const hiredApps = apps.filter(a => a.stage?.name?.toLowerCase() === 'contratado')
  const hired_this_month = hiredApps.filter(a => {
    const d = new Date(a.updated_at ?? a.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Top sources
  const srcMap = new Map<string, number>()
  for (const app of apps) if (app.source) srcMap.set(app.source, (srcMap.get(app.source) ?? 0) + 1)
  const top_sources = [...srcMap.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Avg days to hire
  const avg_days_to_hire = hiredApps.length
    ? Math.round(hiredApps.reduce((s, a) =>
        s + (new Date(a.updated_at ?? a.created_at).getTime() - new Date(a.created_at).getTime()) / 86400000, 0
      ) / hiredApps.length)
    : 0

  // Conversion rate
  const conversion_rate = total_applications > 0
    ? Math.round((hiredApps.length / total_applications) * 1000) / 10
    : 0

  return { total_jobs, active_jobs, total_applications, hired_this_month, avg_days_to_hire, conversion_rate, applications_by_stage, top_sources }
})

const recentApplications = computed(() =>
  pipeline.allApplications
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5),
)

const statCards = computed(() => [
  { label: 'Ofertas activas',        value: metrics.value.active_jobs,       sub: `de ${metrics.value.total_jobs} total`,          bg: 'var(--accent-m)',        fg: 'var(--accent)' },
  { label: 'Candidaturas',           value: metrics.value.total_applications, sub: 'en todas las ofertas',                         bg: 'rgba(255,255,255,0.06)', fg: 'var(--text-1)' },
  { label: 'Contratados este mes',   value: metrics.value.hired_this_month,   sub: 'en los últimos 30 días',                       bg: 'rgba(76,183,130,0.15)', fg: '#4CB782' },
  { label: 'Días promedio contrat.', value: metrics.value.avg_days_to_hire,   sub: `Conversión ${metrics.value.conversion_rate}%`, bg: 'rgba(245,166,35,0.12)', fg: '#F5A623' },
])
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">

    <!-- Greeting -->
    <div>
      <h2 class="text-xl font-semibold" style="color:var(--text-1);">
        Hola, {{ auth.profile?.full_name?.split(' ')[0] }} 👋
      </h2>
      <p class="text-sm mt-0.5" style="color:var(--text-2);">
        Aquí tienes el resumen del pipeline de hoy.
      </p>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Skeleton state -->
      <template v-if="pipeline.loadingAll">
        <div v-for="i in 4" :key="i" class="card p-5 space-y-3">
          <SkeletonBlock width="2.5rem" height="2.5rem" rounded="0.75rem" />
          <SkeletonBlock width="60%" height="1rem" />
          <SkeletonBlock width="80%" height="0.75rem" />
        </div>
      </template>
      <!-- Real data -->
      <template v-else>
        <div v-for="card in statCards" :key="card.label" class="card p-5">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0" :style="{ background: card.bg }">
            <span class="text-lg font-bold" :style="{ color: card.fg }">{{ card.value }}</span>
          </div>
          <p class="text-sm font-medium" style="color:var(--text-1);">{{ card.label }}</p>
          <p class="text-xs mt-0.5" style="color:var(--text-2);">{{ card.sub }}</p>
        </div>
      </template>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">

      <!-- Pipeline overview -->
      <div class="card lg:col-span-2">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-sm font-semibold" style="color:var(--text-1);">Estado del workflow</h3>
          <button class="btn btn-secondary btn-sm" @click="router.push({ name: 'pipeline' })">Postulaciones</button>
        </div>
        <div class="card-body space-y-3">
          <div v-if="pipeline.loadingAll" class="space-y-3">
            <div v-for="i in 4" :key="i" class="flex items-center gap-3">
              <SkeletonBlock width="0.625rem" height="0.625rem" rounded="9999px" />
              <SkeletonBlock width="6rem" height="0.875rem" />
              <div class="flex-1"><SkeletonBlock height="0.5rem" rounded="9999px" /></div>
              <SkeletonBlock width="1rem" height="0.875rem" />
            </div>
          </div>
          <template v-else-if="metrics.applications_by_stage.length">
            <div v-for="stage in metrics.applications_by_stage" :key="stage.stage" class="flex items-center gap-3">
              <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: stage.color }" />
              <span class="text-sm w-24 flex-shrink-0" style="color:var(--text-2);">{{ stage.stage }}</span>
              <div class="flex-1 rounded-full h-2" style="background:rgba(255,255,255,0.07);">
                <div
                  class="h-2 rounded-full transition-all"
                  :style="{ background: stage.color, width: `${(stage.count / metrics.total_applications * 100).toFixed(1)}%` }"
                />
              </div>
              <span class="text-sm font-semibold w-6 text-right" style="color:var(--text-1);">{{ stage.count }}</span>
            </div>
          </template>
          <p v-else class="text-sm text-center py-4" style="color:var(--text-3);">Sin candidaturas todavía.</p>
        </div>
      </div>

      <!-- Top sources -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-sm font-semibold" style="color:var(--text-1);">Fuentes de candidatos</h3>
        </div>
        <div class="card-body space-y-3">
          <div v-if="metrics.top_sources.length" v-for="(src, i) in metrics.top_sources" :key="src.source" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs w-4 font-mono" style="color:var(--text-3);">{{ i + 1 }}</span>
              <span class="text-sm" style="color:var(--text-1);">{{ src.source }}</span>
            </div>
            <span class="badge badge-slate">{{ src.count }}</span>
          </div>
          <p v-else class="text-sm text-center py-2" style="color:var(--text-3);">Sin datos aún.</p>
        </div>
      </div>
    </div>

    <!-- Recent applications -->
    <div class="card overflow-hidden">
      <div class="card-header flex items-center justify-between">
        <h3 class="text-sm font-semibold" style="color:var(--text-1);">Candidaturas recientes</h3>
        <button class="btn btn-secondary btn-sm" @click="router.push({ name: 'candidates' })">Ver todos</button>
      </div>
      <div v-if="pipeline.loadingAll">
        <div v-for="i in 5" :key="i" class="px-6 py-3 flex items-center gap-4" style="border-bottom:1px solid var(--border-2);">
          <SkeletonBlock width="2rem" height="2rem" rounded="9999px" />
          <div class="flex-1 space-y-1.5">
            <SkeletonBlock width="50%" height="0.875rem" />
            <SkeletonBlock width="35%" height="0.75rem" />
          </div>
          <SkeletonBlock width="4.5rem" height="1.25rem" rounded="9999px" />
          <SkeletonBlock width="2.5rem" height="0.75rem" />
        </div>
      </div>
      <div v-else-if="recentApplications.length">
        <div
          v-for="app in recentApplications"
          :key="app.id"
          class="row-link px-6 py-3 flex items-center gap-4 cursor-pointer"
          style="border-bottom:1px solid var(--border-2);"
          @click="router.push({ name: 'candidates-detail', params: { id: app.candidate_id } })"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            :style="{ background: useColorHash((app.candidate?.first_name ?? '') + (app.candidate?.last_name ?? '')) }"
          >
            {{ (app.candidate?.first_name?.[0] ?? '') + (app.candidate?.last_name?.[0] ?? '') }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" style="color:var(--text-1);">
              {{ app.candidate?.first_name }} {{ app.candidate?.last_name }}
            </p>
            <p class="text-xs truncate" style="color:var(--text-2);">{{ app.job?.title }}</p>
          </div>
          <span
            class="badge flex-shrink-0"
            :style="{ backgroundColor: (app.stage?.color ?? '#64748b') + '20', color: app.stage?.color ?? '#64748b' }"
          >
            {{ app.stage?.name ?? '—' }}
          </span>
          <span class="text-xs flex-shrink-0" style="color:var(--text-3);">{{ app.source ?? '—' }}</span>
        </div>
      </div>
      <div v-else class="py-10 text-center text-sm" style="color:var(--text-3);">Sin candidaturas recientes.</div>
    </div>

    <!-- Active jobs quick list -->
    <div class="card overflow-hidden">
      <div class="card-header flex items-center justify-between">
        <h3 class="text-sm font-semibold" style="color:var(--text-1);">Ofertas activas</h3>
        <button class="btn btn-primary btn-sm" @click="router.push({ name: 'jobs-new' })">+ Nueva oferta</button>
      </div>
      <div v-if="jobsStore.jobs.filter(j => j.status === 'published').length === 0" class="py-10 text-center text-sm" style="color:var(--text-3);">
        No hay ofertas publicadas.
      </div>
      <div v-else>
        <div
          v-for="job in jobsStore.jobs.filter(j => j.status === 'published')"
          :key="job.id"
          class="row-link px-6 py-3 flex items-center gap-4 cursor-pointer"
          style="border-bottom:1px solid var(--border-2);"
          @click="router.push({ name: 'jobs-detail', params: { id: job.id } })"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate" style="color:var(--text-1);">{{ job.title }}</p>
            <p class="text-xs" style="color:var(--text-2);">{{ job.department?.name }} · {{ job.location }}</p>
          </div>
          <span class="badge badge-blue flex-shrink-0">{{ job._count?.applications ?? 0 }} candidatos</span>
          <button class="btn btn-secondary btn-sm flex-shrink-0" @click.stop="router.push({ name: 'pipeline', params: { jobId: job.id } })">
            Ver pipeline
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.row-link { transition: background 0.1s; }
.row-link:hover { background: rgba(255,255,255,0.025); }
</style>
