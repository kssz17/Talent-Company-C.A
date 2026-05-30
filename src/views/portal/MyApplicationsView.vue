<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { mockMyApplications, type MyApplication } from '@/lib/mock'

const router = useRouter()
const auth   = useAuthStore()

const useMock = !!import.meta.env.VITEST ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('your-project')

const loading      = ref(false)
const applications = ref<MyApplication[]>([])

const STAGES = ['Aplicados', 'Revisión', 'Entrevista', 'Oferta', 'Contratado']

onMounted(async () => {
  if (useMock) {
    applications.value = mockMyApplications
    return
  }

  if (!auth.profile?.email) return
  loading.value = true

  // 1. Buscar el registro del candidato por email
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id')
    .eq('email', auth.profile.email)
    .maybeSingle()

  if (!candidate) {
    loading.value = false
    return
  }

  // 2. Cargar sus solicitudes con job y stage
  const { data: rows } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      created_at,
      job:jobs(id, title, location, work_mode),
      stage:pipeline_stages(name, color)
    `)
    .eq('candidate_id', candidate.id)
    .order('created_at', { ascending: false })

  applications.value = (rows ?? []).map((r: any) => ({
    id:          r.id,
    job_id:      r.job?.id ?? '',
    job_title:   r.job?.title ?? '—',
    company:     'Talent Company C.A',
    location:    r.job?.location ?? '—',
    work_mode:   r.job?.work_mode ?? 'on-site',
    stage:       r.stage?.name ?? '—',
    stage_color: r.stage?.color ?? '#64748b',
    status:      r.status,
    applied_at:  r.created_at,
  }))

  loading.value = false
})

// ── Helpers ──────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; class: string }> = {
  active:    { label: 'Activo',     class: 'bg-blue-100 text-blue-700' },
  rejected:  { label: 'Descartado', class: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Retirado',   class: 'bg-slate-100 text-slate-500' },
}

const workModeLabel: Record<string, string> = {
  'on-site': 'Presencial', remote: 'Remoto', hybrid: 'Híbrido',
}

const workModeBadge: Record<string, string> = {
  'on-site': 'bg-orange-100 text-orange-700',
  remote:    'bg-green-100 text-green-700',
  hybrid:    'bg-blue-100 text-blue-700',
}

function stageIndex(stage: string) {
  return STAGES.indexOf(stage)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

const activeCount   = computed(() => applications.value.filter(a => a.status === 'active').length)
const rejectedCount = computed(() => applications.value.filter(a => a.status !== 'active').length)
</script>

<template>
  <div class="space-y-6">

    <!-- ── Header ────────────────────────────────────────────── -->
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Mis solicitudes</h1>
        <p class="text-slate-500 mt-1 text-sm">
          {{ applications.length }} candidaturas enviadas
        </p>
      </div>
      <div class="flex gap-3">
        <div class="text-center bg-white border border-slate-200 rounded-xl px-5 py-3">
          <p class="text-xl font-bold text-blue-600">{{ activeCount }}</p>
          <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Activas</p>
        </div>
        <div class="text-center bg-white border border-slate-200 rounded-xl px-5 py-3">
          <p class="text-xl font-bold text-slate-700">{{ rejectedCount }}</p>
          <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Cerradas</p>
        </div>
      </div>
    </div>

    <!-- ── Loading ────────────────────────────────────────────── -->
    <div v-if="loading" class="text-center py-16 text-slate-400 text-sm">
      Cargando solicitudes…
    </div>

    <!-- ── Empty ──────────────────────────────────────────────── -->
    <div v-else-if="applications.length === 0" class="bg-white border border-slate-200 rounded-xl py-20 text-center">
      <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <p class="font-semibold text-slate-700 mb-1">Aún no has aplicado a ninguna oferta</p>
      <p class="text-sm text-slate-400 mb-4">Encuentra tu próxima oportunidad en el tablón de empleos</p>
      <button
        class="text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
        @click="router.push({ name: 'portal-jobs' })"
      >
        Ver ofertas disponibles →
      </button>
    </div>

    <!-- ── Cards ──────────────────────────────────────────────── -->
    <div v-else class="space-y-4">
      <div
        v-for="app in applications"
        :key="app.id"
        class="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all"
      >
        <div class="p-5">
          <div class="flex items-start gap-4">
            <!-- Logo empresa -->
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style="background:linear-gradient(135deg,#1e293b,#334155);"
            >
              TC
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 class="font-semibold text-slate-900 leading-snug">{{ app.job_title }}</h2>
                  <p class="text-sm text-slate-500 mt-0.5">{{ app.company }} · {{ app.location }}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full', statusConfig[app.status]?.class ?? 'bg-slate-100 text-slate-600']">
                    {{ statusConfig[app.status]?.label ?? app.status }}
                  </span>
                  <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', workModeBadge[app.work_mode] ?? 'bg-slate-100 text-slate-600']">
                    {{ workModeLabel[app.work_mode] ?? app.work_mode }}
                  </span>
                </div>
              </div>

              <!-- Stage + fecha -->
              <div class="flex items-center justify-between mt-3 flex-wrap gap-2">
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                  :style="{ backgroundColor: app.stage_color }"
                >
                  {{ app.stage }}
                </span>
                <p class="text-xs text-slate-400">Aplicado el {{ formatDate(app.applied_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Progress track (solo activas) -->
          <div v-if="app.status === 'active'" class="mt-5 pt-4 border-t border-slate-100">
            <div class="flex gap-1.5">
              <div v-for="(stage, i) in STAGES" :key="stage" class="flex-1">
                <div
                  :class="[
                    'h-1.5 rounded-full transition-all duration-500',
                    stageIndex(app.stage) >= i ? 'bg-slate-700' : 'bg-slate-200',
                  ]"
                />
                <p
                  :class="[
                    'text-[9px] mt-1.5 text-center font-medium hidden sm:block',
                    stageIndex(app.stage) === i ? 'text-slate-700' : 'text-slate-400',
                  ]"
                >
                  {{ stage }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="app.status === 'rejected'" class="mt-4 pt-4 border-t border-slate-100">
            <p class="text-xs text-slate-400 italic">Esta candidatura fue descartada. ¡Sigue aplicando!</p>
          </div>
        </div>

        <!-- Footer card -->
        <div class="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p class="text-xs text-slate-400">
            Etapa: <span class="font-semibold text-slate-600">{{ app.stage }}</span>
          </p>
          <button
            class="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            @click="router.push({ name: 'portal-job-detail', params: { id: app.job_id } })"
          >
            Ver oferta
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
