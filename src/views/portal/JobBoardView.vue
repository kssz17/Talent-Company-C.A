<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import type { WorkMode, JobType } from '@/types'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import { useJobGradient, useJobAccent } from '@/composables/useJobGradient'

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
  'on-site': 'badge-amber',
  remote:    'badge-green',
  hybrid:    'badge-blue',
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
      <h1 class="text-2xl font-bold" style="color:var(--text-1);">Ofertas de empleo</h1>
      <p class="mt-1 text-sm" style="color:var(--text-2);">
        {{ publishedJobs.length }} {{ publishedJobs.length === 1 ? 'oferta disponible' : 'ofertas disponibles' }}
      </p>
    </div>

    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style="color:var(--text-3);"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        >
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por título o ciudad…"
          class="form-input w-full pl-9"
        />
      </div>
      <select v-model="workMode" class="form-input">
        <option value="">Modalidad</option>
        <option value="remote">Remoto</option>
        <option value="hybrid">Híbrido</option>
        <option value="on-site">Presencial</option>
      </select>
      <select v-model="jobType" class="form-input">
        <option value="">Tipo</option>
        <option value="full-time">Jornada completa</option>
        <option value="part-time">Media jornada</option>
        <option value="contract">Temporal</option>
        <option value="internship">Prácticas</option>
      </select>
    </div>

    <!-- Loading skeleton -->
    <div v-if="store.loading" class="grid gap-4 sm:grid-cols-2">
      <div v-for="i in 4" :key="i" class="job-card overflow-hidden" style="padding:0;">
        <SkeletonBlock height="7rem" rounded="0" />
        <div class="p-4 space-y-2.5">
          <SkeletonBlock width="65%" height="1rem" />
          <SkeletonBlock width="45%" height="0.875rem" />
          <div class="flex gap-2">
            <SkeletonBlock width="5rem" height="1.25rem" rounded="9999px" />
            <SkeletonBlock width="5.5rem" height="1.25rem" rounded="9999px" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="publishedJobs.length === 0" class="text-center py-16">
      <svg class="w-12 h-12 mx-auto mb-3" style="color:var(--text-3);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="2" y="7" width="20" height="14" rx="2"/>
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
      <p class="font-medium" style="color:var(--text-2);">No hay ofertas que coincidan</p>
      <p class="text-sm mt-1" style="color:var(--text-3);">Prueba a cambiar los filtros</p>
    </div>

    <!-- Job list -->
    <div v-else class="grid gap-4 sm:grid-cols-2">
      <div
        v-for="job in publishedJobs"
        :key="job.id"
        class="job-card cursor-pointer group overflow-hidden"
        style="padding:0;"
        @click="router.push({ name: 'portal-job-detail', params: { id: job.id } })"
      >
        <!-- Gradient header -->
        <div
          class="h-28 flex items-end px-4 pb-3 relative"
          :style="{ background: useJobGradient(job.title) }"
        >
          <!-- Company initials -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            style="background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);color:#fff;border:1.5px solid rgba(255,255,255,0.25);"
          >
            {{ job.title.slice(0,2).toUpperCase() }}
          </div>
          <!-- Salary chip top-right -->
          <div
            v-if="formatSalary(job.salary_min, job.salary_max)"
            class="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-lg"
            style="background:rgba(0,0,0,0.35);backdrop-filter:blur(6px);color:#fff;"
          >
            {{ formatSalary(job.salary_min, job.salary_max) }}
          </div>
        </div>

        <!-- Card body -->
        <div class="p-4">
          <h2 class="font-semibold leading-snug mb-0.5" style="color:var(--text-1);">{{ job.title }}</h2>
          <p class="text-sm mb-3" style="color:var(--text-2);">Talent Company C.A · {{ job.location }}</p>

          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span :class="['badge', workModeBadge[job.work_mode]]">{{ workModeLabel[job.work_mode] }}</span>
            <span class="badge badge-slate">{{ typeLabel[job.type] }}</span>
            <span v-if="job.department?.name" class="badge badge-slate">{{ job.department.name }}</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full" :style="{ background: useJobAccent(job.title) }" />
              <span class="text-xs" style="color:var(--text-3);">{{ job._count?.applications ?? 0 }} candidatos</span>
            </div>
            <svg
              class="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              style="color:var(--text-3);"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.job-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.job-card:hover {
  border-color: rgba(255,255,255,0.14);
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  background: var(--surface-2);
}
</style>
