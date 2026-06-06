<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { mockDepartments } from '@/lib/mock'
import type { JobStatus } from '@/types'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import { useJobGradient, useJobAccent } from '@/composables/useJobGradient'

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
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style="color:var(--text-3);"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        >
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

    <!-- Job grid skeleton -->
    <div v-if="store.loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div v-for="i in 6" :key="i" class="card overflow-hidden" style="padding:0;">
        <SkeletonBlock height="6rem" rounded="0" />
        <div class="p-4 space-y-2.5">
          <SkeletonBlock width="70%" height="1.125rem" />
          <SkeletonBlock width="40%" height="0.875rem" />
          <div class="flex gap-1.5">
            <SkeletonBlock width="4.5rem" height="1.25rem" rounded="9999px" />
            <SkeletonBlock width="5.5rem" height="1.25rem" rounded="9999px" />
          </div>
        </div>
      </div>
    </div>

    <!-- Job grid -->
    <div v-else-if="store.filtered.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="job in store.filtered"
        :key="job.id"
        class="card cursor-pointer group overflow-hidden"
        style="transition:border-color .15s,box-shadow .15s;padding:0;"
        @mouseenter="($el as HTMLElement).style.borderColor = 'rgba(255,255,255,0.16)'"
        @mouseleave="($el as HTMLElement).style.borderColor = ''"
        @click="router.push({ name: 'jobs-detail', params: { id: job.id } })"
      >
        <!-- ── Gradient header ── -->
        <div
          class="relative h-24 flex items-end px-4 pb-3"
          :style="{ background: useJobGradient(job.title) }"
        >
          <!-- Initials bubble -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
            style="background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);color:#fff;border:1.5px solid rgba(255,255,255,0.25);"
          >
            {{ job.title.slice(0,2).toUpperCase() }}
          </div>
          <!-- Status badge top-right -->
          <span
            :class="['badge', statusBadge[job.status]]"
            style="position:absolute;top:0.625rem;right:0.75rem;"
          >
            {{ statusLabel[job.status] }}
          </span>
        </div>

        <!-- ── Card body ── -->
        <div class="p-4">
          <div class="flex items-start justify-between gap-2 mb-0.5">
            <h3 class="font-semibold leading-snug group-hover:opacity-80 transition-opacity" style="color:var(--text-1);">
              {{ job.title }}
            </h3>
            <span class="text-xs flex-shrink-0 mt-0.5" style="color:var(--text-3);">{{ job.created_at.slice(0,10) }}</span>
          </div>
          <p class="text-sm mb-3" style="color:var(--text-2);">{{ job.department?.name }}</p>

          <div class="flex flex-wrap gap-1.5 mb-4">
            <span class="badge badge-slate">{{ job.location }}</span>
            <span class="badge badge-slate">{{ typeLabel[job.type] }}</span>
            <span class="badge badge-slate capitalize">{{ job.work_mode }}</span>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-sm">
              <div
                class="w-1.5 h-1.5 rounded-full"
                :style="{ background: useJobAccent(job.title) }"
              />
              <span class="font-semibold" style="color:var(--text-1);">{{ job._count?.applications ?? 0 }}</span>
              <span style="color:var(--text-2);">candidatos</span>
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

    <div v-else-if="!store.loading" class="card py-16 text-center">
      <p class="text-sm" style="color:var(--text-2);">No hay ofertas que coincidan con los filtros.</p>
      <button class="btn btn-primary mt-4" @click="router.push({ name: 'jobs-new' })">
        Crear primera oferta
      </button>
    </div>

  </div>
</template>
