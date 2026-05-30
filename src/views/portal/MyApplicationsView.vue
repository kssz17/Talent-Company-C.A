<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockMyApplications } from '@/lib/mock'

const router = useRouter()

// En demo usamos los datos mock del candidato.
// En producción se haría: supabase.from('applications')
//   .select('*, job:jobs(title,location), stage:pipeline_stages(name,color)')
//   .eq('candidate_id', auth.profile?.id)
const applications = computed(() => mockMyApplications)

const statusLabel: Record<string, string> = {
  active:    'Activo',
  rejected:  'Descartado',
  withdrawn: 'Retirado',
}
const statusClass: Record<string, string> = {
  active:    'bg-blue-100 text-blue-700',
  rejected:  'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-600',
}
const workModeLabel: Record<string, string> = {
  'on-site': 'Presencial', remote: 'Remoto', hybrid: 'Híbrido',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Mis solicitudes</h1>
      <p class="text-slate-500 mt-1 text-sm">{{ applications.length }} candidaturas enviadas</p>
    </div>

    <div v-if="applications.length === 0" class="text-center py-16">
      <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <p class="text-slate-500 font-medium">Aún no has aplicado a ninguna oferta</p>
      <button
        class="mt-3 text-sm text-slate-600 underline hover:text-slate-900"
        @click="router.push({ name: 'portal-jobs' })"
      >Ver ofertas disponibles</button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="app in applications"
        :key="app.id"
        class="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <h2 class="font-semibold text-slate-900 leading-snug">{{ app.job_title }}</h2>
            <p class="text-sm text-slate-500 mt-0.5">{{ app.company }} · {{ app.location }}</p>

            <div class="flex flex-wrap items-center gap-2 mt-3">
              <!-- Estado de la solicitud -->
              <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', statusClass[app.status]]">
                {{ statusLabel[app.status] }}
              </span>
              <!-- Etapa actual -->
              <span
                class="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                :style="{ backgroundColor: app.stage_color }"
              >
                {{ app.stage }}
              </span>
              <!-- Modalidad -->
              <span class="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                {{ workModeLabel[app.work_mode] }}
              </span>
            </div>
          </div>

          <div class="text-right flex-shrink-0">
            <p class="text-xs text-slate-400">Aplicado el</p>
            <p class="text-xs font-medium text-slate-600 mt-0.5">{{ formatDate(app.applied_at) }}</p>
            <button
              class="mt-3 text-xs text-slate-500 hover:text-slate-800 underline"
              @click="router.push({ name: 'portal-job-detail', params: { id: app.job_id } })"
            >
              Ver oferta
            </button>
          </div>
        </div>

        <!-- Progress bar de etapas -->
        <div v-if="app.status === 'active'" class="mt-4 pt-4 border-t border-slate-100">
          <div class="flex items-center gap-1.5">
            <div
              v-for="(stage, i) in ['Aplicados', 'Revisión', 'Entrevista', 'Oferta', 'Contratado']"
              :key="stage"
              class="flex-1"
            >
              <div
                :class="[
                  'h-1.5 rounded-full transition-colors',
                  ['Aplicados', 'Revisión', 'Entrevista', 'Oferta', 'Contratado'].indexOf(app.stage) >= i
                    ? 'bg-slate-700' : 'bg-slate-200',
                ]"
              />
              <p class="text-[9px] text-slate-400 mt-1 text-center hidden sm:block">{{ stage }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
