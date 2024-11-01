<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { mockDepartments } from '@/lib/mock'
import type { JobStatus } from '@/types'

const router = useRouter()
const store  = useJobsStore()
const auth   = useAuthStore()

const statusOptions: { value: JobStatus | ''; label: string }[] = [
  { value: '',          label: 'Todos' },
  { value: 'published', label: 'Publicada' },
  { value: 'draft',     label: 'Borrador' },
  { value: 'paused',    label: 'Pausada' },
  { value: 'closed',    label: 'Cerrada' },
]

const statusBadge: Record<JobStatus, string> = {
  published: 'badge-green',
  draft:     'badge-slate',
  paused:    'badge-amber',
  closed:    'badge-red',
}
const statusLabel: Record<JobStatus, string> = {
  published: 'Publicada',
  draft:     'Borrador',
  paused:    'Pausada',
  closed:    'Cerrada',
}
const typeLabel: Record<string, string> = {
  'full-time':  'Jornada completa',
  'part-time':  'Media jornada',
  'contract':   'Contrato',
  'internship': 'Prácticas',
}
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1 max-w-xs">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="store.filters.search"
          type="text"
          placeholder="Buscar oferta..."
          class="form-input pl-9"
        />
      </div>

      <select v-model="store.filters.status" class="form-input w-36">
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>

      <select v-model="store.filters.department_id" class="form-input w-40">
        <option value="">Todos los deptos.</option>
        <option v-for="d in mockDepartments" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>

      <div class="flex gap-2 sm:ml-auto">
        <button
          v-if="auth.isRecruiter"
          class="btn btn-primary"
          @click="router.push({ name: 'jobs-new' })"
        >
          + Nueva oferta
        </button>
      </div>
    </div>

    <!-- Summary chips -->
    <div class="flex gap-2 flex-wrap">
      <span class="badge badge-green">{{ store.totalByStatus.published }} publicadas</span>
      <span class="badge badge-slate">{{ store.totalByStatus.draft }} borradores</span>
      <span class="badge badge-amber">{{ store.totalByStatus.paused }} pausadas</span>
      <span class="badge badge-red">{{ store.totalByStatus.closed }} cerradas</span>
    </div>

    <!-- Job grid -->
    <div v-if="store.filtered.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="job in store.filtered"
        :key="job.id"
        class="card hover:shadow-md transition-shadow cursor-pointer group"
        @click="router.push({ name: 'jobs-detail', params: { id: job.id } })"
      >
        <div class="p-5">
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <span :class="['badge', statusBadge[job.status]]">{{ statusLabel[job.status] }}</span>
            </div>
            <span class="text-xs text-slate-400">{{ job.created_at.slice(0,10) }}</span>
          </div>

          <h3 class="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors mb-1">
            {{ job.title }}
          </h3>
          <p class="text-sm text-slate-500 mb-3">{{ job.department?.name }}</p>

          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="badge badge-slate">{{ job.location }}</span>
            <span class="badge badge-slate">{{ typeLabel[job.type] }}</span>
            <span class="badge badge-slate capitalize">{{ job.work_mode }}</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <span class="font-semibold text-slate-800">{{ job._count?.applications ?? 0 }}</span>
              <span class="text-slate-500"> candidatos</span>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                class="btn btn-secondary btn-sm"
                @click.stop="router.push({ name: 'pipeline', params: { jobId: job.id } })"
              >
                Pipeline
              </button>
              <button
                v-if="auth.isRecruiter"
                class="btn btn-ghost btn-sm"
                @click.stop="router.push({ name: 'jobs-edit', params: { id: job.id } })"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card py-16 text-center">
      <p class="text-slate-500 text-sm">No hay ofertas que coincidan con los filtros.</p>
      <button class="btn btn-primary mt-4" @click="router.push({ name: 'jobs-new' })">
        Crear primera oferta
      </button>
    </div>
  </div>
</template>
