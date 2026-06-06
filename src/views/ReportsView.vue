<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useJobsStore }    from '@/stores/jobs'
import { usePipelineStore } from '@/stores/pipeline'

const jobsStore = useJobsStore()
const pipeline  = usePipelineStore()

onMounted(() => {
  if (!jobsStore.jobs.length) jobsStore.fetchJobs()
  pipeline.fetchAllApplications()
})

// ── Real metrics from pipeline store ──────────────────────
const metrics = computed(() => {
  const apps = pipeline.allApplications
  const now  = new Date()

  const total_applications = apps.length

  // Stage funnel — uses embedded stage from join
  const stageMap = new Map<string, { stage: string; color: string; count: number }>()
  for (const app of apps) {
    const s = (app as any).stage
    if (!s?.name) continue
    if (!stageMap.has(s.name)) stageMap.set(s.name, { stage: s.name, color: s.color, count: 0 })
    stageMap.get(s.name)!.count++
  }
  const applications_by_stage = [...stageMap.values()].sort((a, b) => b.count - a.count)

  // Hired this month (stage = 'contratado')
  const hiredApps = apps.filter(a => ((a as any).stage?.name ?? '').toLowerCase() === 'contratado')
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

  // Monthly applications — last 6 months
  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const buckets: { month: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push({ month: monthNames[d.getMonth()], count: 0 })
  }
  for (const app of apps) {
    const d = new Date(app.created_at)
    const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
    if (diff >= 0 && diff < 6) buckets[5 - diff].count++
  }
  const applications_by_month = buckets

  return {
    total_applications, applications_by_stage, hired_this_month,
    top_sources, avg_days_to_hire, conversion_rate, applications_by_month,
  }
})

const maxMonthCount  = computed(() => Math.max(...metrics.value.applications_by_month.map(m => m.count), 1))
const maxSourceCount = computed(() => Math.max(...metrics.value.top_sources.map(s => s.count), 1))

const kpis = computed(() => [
  {
    label: 'Total candidaturas',
    value: metrics.value.total_applications,
    unit:  'en todas las ofertas',
    icon:  'users',
    bg:    'rgba(94,106,210,0.15)',
    fg:    '#a5b4fc',
  },
  {
    label: 'Tiempo hasta contratación',
    value: `${metrics.value.avg_days_to_hire}d`,
    unit:  'promedio por proceso',
    icon:  'clock',
    bg:    'rgba(139,92,246,0.15)',
    fg:    '#c4b5fd',
  },
  {
    label: 'Tasa de conversión',
    value: `${metrics.value.conversion_rate}%`,
    unit:  'Aplicado → Contratado',
    icon:  'trending-up',
    bg:    'rgba(76,183,130,0.15)',
    fg:    '#4CB782',
  },
  {
    label: 'Contratados este mes',
    value: metrics.value.hired_this_month,
    unit:  'en los últimos 30 días',
    icon:  'check-circle',
    bg:    'rgba(245,166,35,0.12)',
    fg:    '#F5A623',
  },
])

// Funnel
const funnelMax  = computed(() => metrics.value.applications_by_stage[0]?.count ?? 1)
const funnelData = computed(() =>
  metrics.value.applications_by_stage.map((s, i) => ({
    ...s,
    pct:  ((s.count / funnelMax.value) * 100).toFixed(0),
    conv: i === 0
      ? 100
      : Math.round((s.count / (metrics.value.applications_by_stage[i - 1]?.count ?? 1)) * 100),
  })),
)

const statusLabel: Record<string, string> = {
  published: 'Publicada', draft: 'Borrador', paused: 'Pausada', closed: 'Cerrada',
}
const statusBadge: Record<string, string> = {
  published: 'badge-green', draft: 'badge-slate', paused: 'badge-amber', closed: 'badge-red',
}
</script>

<template>
  <div class="space-y-6 max-w-6xl mx-auto">

    <!-- KPI row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="kpi in kpis" :key="kpi.label" class="card p-5">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
          :style="{ background: kpi.bg }"
        >
          <svg class="w-4 h-4" :style="{ color: kpi.fg }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <template v-if="kpi.icon === 'users'">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </template>
            <template v-else-if="kpi.icon === 'clock'">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </template>
            <template v-else-if="kpi.icon === 'trending-up'">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </template>
            <template v-else-if="kpi.icon === 'check-circle'">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </template>
          </svg>
        </div>
        <p class="text-2xl font-bold" style="color:var(--text-1);">{{ kpi.value }}</p>
        <p class="text-sm font-medium mt-0.5" style="color:var(--text-1);">{{ kpi.label }}</p>
        <p class="text-xs mt-0.5" style="color:var(--text-3);">{{ kpi.unit }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pipeline.loadingAll" class="text-center py-16 text-sm" style="color:var(--text-3);">
      Cargando datos…
    </div>

    <template v-else>

    <!-- FUNNEL -->
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold" style="color:var(--text-1);">Embudo de selección</h3>
            <p class="text-xs mt-0.5" style="color:var(--text-2);">Conversión de candidatos a través del pipeline</p>
          </div>
          <span class="badge badge-slate">{{ metrics.total_applications }} candidatos totales</span>
        </div>
      </div>
      <div class="card-body">
        <div v-if="funnelData.length === 0" class="text-center py-8 text-sm" style="color:var(--text-3);">
          Sin candidaturas todavía.
        </div>
        <div v-else class="flex flex-col gap-2">
          <div
            v-for="(stage, i) in funnelData"
            :key="stage.stage"
            class="relative flex items-center gap-4"
          >
            <div class="flex-1 relative" style="min-height: 44px;">
              <div class="absolute inset-y-0 left-0 right-0 rounded-lg" style="background:rgba(255,255,255,0.04);" />
              <div
                class="absolute inset-y-0 rounded-lg transition-all duration-700"
                :style="{
                  background: stage.color,
                  left: `${(100 - Number(stage.pct)) / 2}%`,
                  right: `${(100 - Number(stage.pct)) / 2}%`,
                  opacity: 0.85,
                }"
              />
              <div class="relative z-10 flex items-center justify-between px-4 h-full" style="min-height: 44px;">
                <span class="text-sm font-semibold text-white drop-shadow-sm">{{ stage.stage }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold text-white drop-shadow-sm">{{ stage.count }}</span>
                  <span class="text-xs bg-white/25 text-white rounded-full px-2 py-0.5 font-medium">
                    {{ stage.pct }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Conversion arrow -->
            <div
              v-if="i < funnelData.length - 1"
              class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 z-20
                     flex items-center gap-1 rounded-full px-2 py-0.5"
              style="background:var(--surface-3);border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,0.3);"
            >
              <svg class="w-2.5 h-2.5" style="color:var(--text-3);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
              </svg>
              <span class="text-[10px] font-semibold" style="color:var(--text-2);">
                {{ funnelData[i + 1]?.conv }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div v-if="funnelData.length" class="flex items-center gap-6 mt-6 pt-4 flex-wrap" style="border-top:1px solid var(--border);">
          <div v-for="stage in funnelData" :key="stage.stage + '_leg'" class="flex items-center gap-1.5">
            <div class="w-2.5 h-2.5 rounded-sm" :style="{ background: stage.color }" />
            <span class="text-xs" style="color:var(--text-2);">{{ stage.stage }}</span>
            <span class="text-xs font-semibold" style="color:var(--text-1);">{{ stage.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">

      <!-- Monthly bar chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-sm font-semibold" style="color:var(--text-1);">Candidaturas por mes</h3>
        </div>
        <div class="card-body">
          <div class="flex items-end gap-3 h-36">
            <div
              v-for="month in metrics.applications_by_month"
              :key="month.month"
              class="flex-1 flex flex-col items-center gap-1.5"
            >
              <span class="text-xs font-semibold" style="color:var(--text-2);">{{ month.count }}</span>
              <div class="w-full flex flex-col-reverse" style="height: 96px;">
                <div
                  class="w-full rounded-t-md transition-all duration-700"
                  :style="{ background: 'var(--accent)', height: `${(month.count / maxMonthCount * 100).toFixed(1)}%` }"
                />
                <div class="flex-1 rounded-t-sm" style="background:var(--accent-d);" />
              </div>
              <span class="text-xs font-medium" style="color:var(--text-3);">{{ month.month }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top sources -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-sm font-semibold" style="color:var(--text-1);">Fuentes de captación</h3>
        </div>
        <div class="card-body space-y-2.5">
          <div v-if="metrics.top_sources.length === 0" class="text-sm py-4 text-center" style="color:var(--text-3);">
            Sin datos de fuente todavía.
          </div>
          <div
            v-for="(src, i) in metrics.top_sources"
            :key="src.source"
            class="flex items-center gap-3 group"
          >
            <span class="text-xs font-mono w-4 text-right" style="color:var(--text-3);">{{ i + 1 }}</span>
            <span class="text-sm w-24 flex-shrink-0 font-medium" style="color:var(--text-1);">{{ src.source }}</span>
            <div class="flex-1 rounded-full h-3 overflow-hidden" style="background:rgba(255,255,255,0.07);">
              <div
                class="h-3 rounded-full transition-all duration-500 group-hover:opacity-80"
                :style="{
                  width: `${(src.count / maxSourceCount * 100).toFixed(1)}%`,
                  background: ['#6366f1','#8b5cf6','#3b82f6','#10b981','#f59e0b'][i],
                }"
              />
            </div>
            <span class="text-sm font-bold w-6 text-right" style="color:var(--text-1);">{{ src.count }}</span>
            <span class="text-xs w-10 text-right" style="color:var(--text-3);">
              {{ metrics.total_applications > 0 ? (src.count / metrics.total_applications * 100).toFixed(0) : 0 }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Job performance table -->
      <div class="card lg:col-span-2">
        <div class="card-header">
          <h3 class="text-sm font-semibold" style="color:var(--text-1);">Rendimiento por oferta</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr style="border-bottom:1px solid var(--border);background:rgba(255,255,255,0.02);">
                <th class="th">Oferta</th>
                <th class="th">Depto.</th>
                <th class="th text-center">Candidatos</th>
                <th class="th text-center">Estado</th>
                <th class="th hidden lg:table-cell">Publicada</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="jobsStore.jobs.length === 0">
                <td colspan="5" class="td text-center py-8" style="color:var(--text-3);">Sin ofertas todavía.</td>
              </tr>
              <tr
                v-for="job in jobsStore.jobs"
                :key="job.id"
                class="table-row"
              >
                <td class="td">
                  <p class="font-semibold text-sm" style="color:var(--text-1);">{{ job.title }}</p>
                  <p class="text-xs" style="color:var(--text-3);">{{ job.location }} · {{ job.work_mode }}</p>
                </td>
                <td class="td" style="color:var(--text-2);">{{ job.department?.name ?? '—' }}</td>
                <td class="td text-center">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    style="background:rgba(255,255,255,0.07);color:var(--text-1);"
                  >
                    {{ job._count?.applications ?? 0 }}
                  </span>
                </td>
                <td class="td text-center">
                  <span :class="['badge', statusBadge[job.status]]">{{ statusLabel[job.status] }}</span>
                </td>
                <td class="td hidden lg:table-cell">
                  <span class="text-xs" style="color:var(--text-3);">{{ job.published_at?.slice(0, 10) ?? '—' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    </template>
  </div>
</template>
