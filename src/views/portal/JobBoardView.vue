<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import type { WorkMode, JobType } from '@/types'

const router = useRouter()
const store  = useJobsStore()

const search   = ref('')
const workMode = ref<WorkMode | ''>('')
const jobType  = ref<JobType | ''>('')

onMounted(() => {
  if (!store.jobs.length) store.fetchJobs()
})

const publishedJobs = computed(() =>
  store.jobs
    .filter(j => j.status === 'published')
    .filter(j => !search.value   || j.title.toLowerCase().includes(search.value.toLowerCase()) || j.location.toLowerCase().includes(search.value.toLowerCase()))
    .filter(j => !workMode.value || j.work_mode === workMode.value)
    .filter(j => !jobType.value  || j.type === jobType.value),
)

const workModeLabel: Record<WorkMode, string> = {
  'on-site': 'Presencial',
  remote:    'Remoto',
  hybrid:    'Híbrido',
}
const workModeBadge: Record<WorkMode, string> = {
  'on-site': 'bg-orange-100 text-orange-700',
  remote:    'bg-green-100 text-green-700',
  hybrid:    'bg-blue-100 text-blue-700',
}
const typeLabel: Record<string, string> = {
  'full-time':  'Jornada completa',
  'part-time':  'Media jornada',
  contract:     'Contrato temporal',
  internship:   'Prácticas',
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) => `${(n / 1000).toFixed(0)}k`
  if (min && max) return `${fmt(min)} – ${fmt(max)} €`
  if (min) return `Desde ${fmt(min)} €`
  return `Hasta ${fmt(max!)} €`
}
</script>

<template>
  <div class="space-y-6">

    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Ofertas de empleo</h1>
      <p class="text-slate-500 mt-1 text-sm">
        {{ publishedJobs.length }} {{ publishedJobs.length === 1 ? 'oferta disponible' : 'ofertas disponibles' }}
      </p>
    </div>

    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por título o ciudad…"
          class="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 bg-white"
        />
      </div>
      <select v-model="workMode" class="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-slate-400">
        <option value="">Modalidad</option>
        <option value="remote">Remoto</option>
        <option value="hybrid">Híbrido</option>
        <option value="on-site">Presencial</option>
      </select>
      <select v-model="jobType" class="border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-slate-400">
        <option value="">Tipo</option>
        <option value="full-time">Jornada completa</option>
        <option value="part-time">Media jornada</option>
        <option value="contract">Temporal</option>
        <option value="internship">Prácticas</option>
      </select>
    </div>

    <!-- Lista de ofertas -->
    <div v-if="store.loading" class="text-center py-16 text-slate-400">Cargando ofertas…</div>

    <div v-else-if="publishedJobs.length === 0" class="text-center py-16">
      <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
      <p class="text-slate-500 font-medium">No hay ofertas que coincidan</p>
      <p class="text-slate-400 text-sm mt-1">Prueba a cambiar los filtros</p>
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="job in publishedJobs"
        :key="job.id"
        class="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
        @click="router.push({ name: 'portal-job-detail', params: { id: job.id } })"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <!-- Título -->
            <h2 class="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors leading-snug">
              {{ job.title }}
            </h2>
            <p class="text-sm text-slate-500 mt-0.5">Talent Company C.A · {{ job.location }}</p>

            <!-- Badges -->
            <div class="flex flex-wrap items-center gap-2 mt-3">
              <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', workModeBadge[job.work_mode]]">
                {{ workModeLabel[job.work_mode] }}
              </span>
              <span class="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {{ typeLabel[job.type] }}
              </span>
              <span v-if="job.department?.name" class="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {{ job.department.name }}
              </span>
            </div>
          </div>

          <!-- Salario + flecha -->
          <div class="text-right flex-shrink-0">
            <p v-if="formatSalary(job.salary_min, job.salary_max)" class="text-sm font-semibold text-slate-800">
              {{ formatSalary(job.salary_min, job.salary_max) }}
            </p>
            <p class="text-xs text-slate-400 mt-1">/año</p>
            <svg class="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors mt-2 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
