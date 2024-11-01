<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { usePipelineStore } from '@/stores/pipeline'
import type { JobStatus } from '@/types'

const route    = useRoute()
const router   = useRouter()
const store    = useJobsStore()
const auth     = useAuthStore()
const pipeline = usePipelineStore()

const job = computed(() => store.getById(String(route.params.id)))

const applications = computed(() =>
  pipeline.applications.filter(a => a.job_id === job.value?.id),
)

const statusConfig: Record<JobStatus, { label: string; badge: string }> = {
  published: { label: 'Publicada',  badge: 'badge-green' },
  draft:     { label: 'Borrador',   badge: 'badge-slate' },
  paused:    { label: 'Pausada',    badge: 'badge-amber' },
  closed:    { label: 'Cerrada',    badge: 'badge-red'   },
}

const typeLabel: Record<string, string> = {
  'full-time':  'Jornada completa',
  'part-time':  'Media jornada',
  'contract':   'Contrato',
  'internship': 'Prácticas',
}
const workModeLabel: Record<string, string> = {
  'on-site': 'Presencial',
  'remote':  'Remoto',
  'hybrid':  'Híbrido',
}

function stageColor(stageId: string) {
  return pipeline.stages.find(s => s.id === stageId)?.color ?? '#64748b'
}
function stageName(stageId: string) {
  return pipeline.stages.find(s => s.id === stageId)?.name ?? '—'
}

async function handleStatusChange(status: JobStatus) {
  if (!job.value) return
  await store.changeStatus(job.value.id, status)
}
</script>

<template>
  <div v-if="!job" class="text-center py-20">
    <p class="text-slate-500">Oferta no encontrada.</p>
    <button class="btn btn-secondary mt-4" @click="router.push({ name: 'jobs' })">Volver a ofertas</button>
  </div>

  <div v-else class="max-w-5xl mx-auto space-y-5">
    <!-- Back + actions -->
    <div class="flex items-center gap-3 flex-wrap">
      <button class="btn btn-ghost btn-sm" @click="router.push({ name: 'jobs' })">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Ofertas
      </button>
      <div class="flex-1" />
      <button
        class="btn btn-secondary btn-sm"
        @click="router.push({ name: 'pipeline', params: { jobId: job.id } })"
      >
        Ver pipeline Kanban
      </button>
      <button
        v-if="auth.isRecruiter"
        class="btn btn-ghost btn-sm"
        @click="router.push({ name: 'jobs-edit', params: { id: job.id } })"
      >
        Editar
      </button>
    </div>

    <div class="grid lg:grid-cols-3 gap-5">
      <!-- Main info -->
      <div class="lg:col-span-2 space-y-5">
        <div class="card p-6">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <span :class="['badge', statusConfig[job.status].badge]">
                {{ statusConfig[job.status].label }}
              </span>
              <h2 class="text-xl font-semibold text-slate-900 mt-2">{{ job.title }}</h2>
              <p class="text-sm text-slate-500 mt-1">{{ job.department?.name }}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mb-6">
            <span class="badge badge-slate">📍 {{ job.location }}</span>
            <span class="badge badge-slate">{{ typeLabel[job.type] }}</span>
            <span class="badge badge-slate">{{ workModeLabel[job.work_mode] }}</span>
            <span v-if="job.salary_min || job.salary_max" class="badge badge-blue">
              {{ job.salary_min?.toLocaleString('es') }}€ – {{ job.salary_max?.toLocaleString('es') }}€
            </span>
          </div>

          <div class="prose prose-sm max-w-none text-slate-700">
            <h4 class="text-sm font-semibold text-slate-800 mb-2">Descripción</h4>
            <p class="whitespace-pre-line text-sm leading-relaxed">{{ job.description }}</p>
          </div>

          <div v-if="job.requirements" class="mt-5">
            <h4 class="text-sm font-semibold text-slate-800 mb-2">Requisitos</h4>
            <p class="whitespace-pre-line text-sm text-slate-600 leading-relaxed">{{ job.requirements }}</p>
          </div>
        </div>
      </div>

      <!-- Sidebar meta -->
      <div class="space-y-4">
        <!-- Status control -->
        <div v-if="auth.isRecruiter" class="card p-4 space-y-2">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Cambiar estado</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="s in (['published', 'paused', 'draft', 'closed'] as JobStatus[])"
              :key="s"
              :disabled="job.status === s"
              class="btn btn-secondary btn-sm disabled:opacity-30"
              @click="handleStatusChange(s)"
            >
              {{ statusConfig[s].label }}
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="card p-4 space-y-3">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">Estadísticas</p>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Candidaturas</span>
            <span class="font-semibold text-slate-800">{{ applications.length }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Publicada</span>
            <span class="font-medium text-slate-700">{{ job.published_at?.slice(0,10) ?? '—' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-600">Creada por</span>
            <span class="font-medium text-slate-700">{{ job.creator?.full_name }}</span>
          </div>
        </div>

        <!-- Recent candidates -->
        <div class="card p-4">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Candidatos recientes</p>
          <div class="space-y-2">
            <div
              v-for="app in applications.slice(0, 4)"
              :key="app.id"
              class="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1 -mx-1 transition-colors"
              @click="router.push({ name: 'candidates-detail', params: { id: app.candidate_id } })"
            >
              <div class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                {{ (app.candidate?.first_name?.[0] ?? '') + (app.candidate?.last_name?.[0] ?? '') }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-slate-700 truncate">
                  {{ app.candidate?.first_name }} {{ app.candidate?.last_name }}
                </p>
              </div>
              <span
                class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                :style="{ backgroundColor: stageColor(app.stage_id) + '20', color: stageColor(app.stage_id) }"
              >
                {{ stageName(app.stage_id) }}
              </span>
            </div>
          </div>
          <button
            v-if="applications.length > 4"
            class="text-xs text-primary-600 hover:text-primary-700 mt-2 font-medium"
            @click="router.push({ name: 'pipeline', params: { jobId: job.id } })"
          >
            Ver todos ({{ applications.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
