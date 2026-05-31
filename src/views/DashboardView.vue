<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { usePipelineStore } from '@/stores/pipeline'
import { mockMetrics } from '@/lib/mock'

const router    = useRouter()
const auth      = useAuthStore()
const jobsStore = useJobsStore()
const pipeline  = usePipelineStore()

const metrics = mockMetrics

const recentApplications = computed(() =>
  pipeline.applications
    .slice()
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5),
)

const statCards = computed(() => [
  {
    label: 'Ofertas activas',
    value: metrics.active_jobs,
    sub: `de ${metrics.total_jobs} total`,
    bg: 'var(--accent-m)',
    fg: 'var(--accent)',
  },
  {
    label: 'Candidaturas',
    value: metrics.total_applications,
    sub: 'en todas las ofertas',
    bg: 'rgba(255,255,255,0.06)',
    fg: 'var(--text-1)',
  },
  {
    label: 'Contratados este mes',
    value: metrics.hired_this_month,
    sub: 'en los últimos 30 días',
    bg: 'rgba(76,183,130,0.15)',
    fg: '#4CB782',
  },
  {
    label: 'Días promedio contrat.',
    value: metrics.avg_days_to_hire,
    sub: `Conversión ${metrics.conversion_rate}%`,
    bg: 'rgba(245,166,35,0.12)',
    fg: '#F5A623',
  },
])

function stageColor(stageId: string) {
  return pipeline.stages.find(s => s.id === stageId)?.color ?? '#64748b'
}
function stageName(stageId: string) {
  return pipeline.stages.find(s => s.id === stageId)?.name ?? '—'
}
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
      <div v-for="card in statCards" :key="card.label" class="card p-5">
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
          :style="{ background: card.bg }"
        >
          <span class="text-lg font-bold" :style="{ color: card.fg }">{{ card.value }}</span>
        </div>
        <p class="text-sm font-medium" style="color:var(--text-1);">{{ card.label }}</p>
        <p class="text-xs mt-0.5" style="color:var(--text-2);">{{ card.sub }}</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">

      <!-- Pipeline overview -->
      <div class="card lg:col-span-2">
        <div class="card-header flex items-center justify-between">
          <h3 class="text-sm font-semibold" style="color:var(--text-1);">Estado del workflow</h3>
          <button class="btn btn-secondary btn-sm" @click="router.push({ name: 'pipeline' })">
            Postulaciones
          </button>
        </div>
        <div class="card-body space-y-3">
          <div
            v-for="stage in metrics.applications_by_stage"
            :key="stage.stage"
            class="flex items-center gap-3"
          >
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: stage.color }" />
            <span class="text-sm w-24 flex-shrink-0" style="color:var(--text-2);">{{ stage.stage }}</span>
            <div class="flex-1 rounded-full h-2" style="background:rgba(255,255,255,0.07);">
              <div
                class="h-2 rounded-full transition-all"
                :style="{
                  background: stage.color,
                  width: `${(stage.count / metrics.total_applications * 100).toFixed(1)}%`,
                }"
              />
            </div>
            <span class="text-sm font-semibold w-6 text-right" style="color:var(--text-1);">{{ stage.count }}</span>
          </div>
        </div>
      </div>

      <!-- Top sources -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-sm font-semibold" style="color:var(--text-1);">Fuentes de candidatos</h3>
        </div>
        <div class="card-body space-y-3">
          <div
            v-for="(src, i) in metrics.top_sources"
            :key="src.source"
            class="flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <span class="text-xs w-4 font-mono" style="color:var(--text-3);">{{ i + 1 }}</span>
              <span class="text-sm" style="color:var(--text-1);">{{ src.source }}</span>
            </div>
            <span class="badge badge-slate">{{ src.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent applications -->
    <div class="card overflow-hidden">
      <div class="card-header flex items-center justify-between">
        <h3 class="text-sm font-semibold" style="color:var(--text-1);">Candidaturas recientes</h3>
        <button class="btn btn-secondary btn-sm" @click="router.push({ name: 'candidates' })">
          Ver todos
        </button>
      </div>
      <div>
        <div
          v-for="app in recentApplications"
          :key="app.id"
          class="row-link px-6 py-3 flex items-center gap-4 cursor-pointer"
          style="border-bottom:1px solid var(--border-2);"
          @click="router.push({ name: 'candidates-detail', params: { id: app.candidate_id } })"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            :style="{ background: stageColor(app.stage_id) + '80' }"
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
            :style="{ backgroundColor: stageColor(app.stage_id) + '20', color: stageColor(app.stage_id) }"
          >
            {{ stageName(app.stage_id) }}
          </span>
          <span class="text-xs flex-shrink-0" style="color:var(--text-3);">{{ app.source ?? '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Active jobs quick list -->
    <div class="card overflow-hidden">
      <div class="card-header flex items-center justify-between">
        <h3 class="text-sm font-semibold" style="color:var(--text-1);">Ofertas activas</h3>
        <button class="btn btn-primary btn-sm" @click="router.push({ name: 'jobs-new' })">
          + Nueva oferta
        </button>
      </div>
      <div>
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
          <button
            class="btn btn-secondary btn-sm flex-shrink-0"
            @click.stop="router.push({ name: 'pipeline', params: { jobId: job.id } })"
          >
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
