<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { mockMyApplications, type MyApplication } from '@/lib/mock'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'

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
const statusConfig: Record<string, { label: string; cls: string }> = {
  active:    { label: 'Activo',     cls: 'badge-blue' },
  rejected:  { label: 'Descartado', cls: 'badge-red' },
  withdrawn: { label: 'Retirado',   cls: 'badge-slate' },
}

const workModeLabel: Record<string, string> = {
  'on-site': 'Presencial', remote: 'Remoto', hybrid: 'Híbrido',
}
const workModeBadge: Record<string, string> = {
  'on-site': 'badge-amber',
  remote:    'badge-green',
  hybrid:    'badge-blue',
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
        <h1 class="text-2xl font-bold" style="color:var(--text-1);">Mis solicitudes</h1>
        <p class="mt-1 text-sm" style="color:var(--text-2);">
          {{ applications.length }} candidaturas enviadas
        </p>
      </div>
      <div class="flex gap-3">
        <div class="card px-5 py-3 text-center">
          <p class="text-xl font-bold" style="color:var(--accent);">{{ activeCount }}</p>
          <p class="text-[10px] mt-0.5 uppercase tracking-wider" style="color:var(--text-3);">Activas</p>
        </div>
        <div class="card px-5 py-3 text-center">
          <p class="text-xl font-bold" style="color:var(--text-2);">{{ rejectedCount }}</p>
          <p class="text-[10px] mt-0.5 uppercase tracking-wider" style="color:var(--text-3);">Cerradas</p>
        </div>
      </div>
    </div>

    <!-- ── Loading skeleton ──────────────────────────────────── -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="app-card">
        <div class="p-5">
          <div class="flex items-start gap-4">
            <SkeletonBlock width="2.75rem" height="2.75rem" rounded="0.75rem" />
            <div class="flex-1 space-y-2">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1.5 flex-1">
                  <SkeletonBlock width="60%" height="1rem" />
                  <SkeletonBlock width="45%" height="0.875rem" />
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <SkeletonBlock width="4rem" height="1.25rem" rounded="9999px" />
                  <SkeletonBlock width="5rem" height="1.25rem" rounded="9999px" />
                </div>
              </div>
              <div class="flex items-center justify-between mt-3">
                <SkeletonBlock width="5rem" height="1.25rem" rounded="9999px" />
                <SkeletonBlock width="7rem" height="0.75rem" />
              </div>
            </div>
          </div>
          <div class="mt-5 pt-4" style="border-top:1px solid var(--border);">
            <div class="flex gap-1.5">
              <SkeletonBlock v-for="s in 5" :key="s" height="0.375rem" rounded="9999px" />
            </div>
          </div>
        </div>
        <div class="px-5 py-3 flex items-center justify-between" style="background:rgba(255,255,255,0.02);border-top:1px solid var(--border);">
          <SkeletonBlock width="8rem" height="0.75rem" />
          <SkeletonBlock width="5rem" height="0.75rem" />
        </div>
      </div>
    </div>

    <!-- ── Empty ──────────────────────────────────────────────── -->
    <div v-else-if="applications.length === 0" class="card py-20 text-center">
      <div
        class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style="background:rgba(255,255,255,0.06);"
      >
        <svg class="w-8 h-8" style="color:var(--text-3);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <p class="font-semibold" style="color:var(--text-1);">Aún no has aplicado a ninguna oferta</p>
      <p class="text-sm mt-1 mb-4" style="color:var(--text-3);">Encuentra tu próxima oportunidad en el tablón de empleos</p>
      <button class="btn btn-secondary btn-sm" @click="router.push({ name: 'portal-jobs' })">
        Ver ofertas disponibles →
      </button>
    </div>

    <!-- ── Cards ──────────────────────────────────────────────── -->
    <div v-else class="space-y-4">
      <div
        v-for="app in applications"
        :key="app.id"
        class="app-card"
      >
        <div class="p-5">
          <div class="flex items-start gap-4">
            <!-- Company logo -->
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style="background:linear-gradient(135deg,var(--surface-3),var(--surface-2));"
            >
              TC
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 class="font-semibold leading-snug" style="color:var(--text-1);">{{ app.job_title }}</h2>
                  <p class="text-sm mt-0.5" style="color:var(--text-2);">{{ app.company }} · {{ app.location }}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <span :class="['badge', statusConfig[app.status]?.cls ?? 'badge-slate']">
                    {{ statusConfig[app.status]?.label ?? app.status }}
                  </span>
                  <span :class="['badge', workModeBadge[app.work_mode] ?? 'badge-slate']">
                    {{ workModeLabel[app.work_mode] ?? app.work_mode }}
                  </span>
                </div>
              </div>

              <!-- Stage + date -->
              <div class="flex items-center justify-between mt-3 flex-wrap gap-2">
                <span
                  class="badge text-white"
                  :style="{ backgroundColor: app.stage_color + '30', color: app.stage_color }"
                >
                  {{ app.stage }}
                </span>
                <p class="text-xs" style="color:var(--text-3);">Aplicado el {{ formatDate(app.applied_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Progress track (active only) -->
          <div v-if="app.status === 'active'" class="mt-5 pt-4" style="border-top:1px solid var(--border);">
            <div class="flex gap-1.5">
              <div v-for="(stage, i) in STAGES" :key="stage" class="flex-1">
                <div
                  class="h-1.5 rounded-full transition-all duration-500"
                  :style="stageIndex(app.stage) >= i
                    ? 'background:var(--accent);'
                    : 'background:rgba(255,255,255,0.08);'"
                />
                <p
                  class="text-[9px] mt-1.5 text-center font-medium hidden sm:block"
                  :style="stageIndex(app.stage) === i ? 'color:var(--text-1);' : 'color:var(--text-3);'"
                >
                  {{ stage }}
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="app.status === 'rejected'" class="mt-4 pt-4" style="border-top:1px solid var(--border);">
            <p class="text-xs italic" style="color:var(--text-3);">Esta candidatura fue descartada. ¡Sigue aplicando!</p>
          </div>
        </div>

        <!-- Card footer -->
        <div
          class="px-5 py-3 flex items-center justify-between"
          style="background:rgba(255,255,255,0.02);border-top:1px solid var(--border);"
        >
          <p class="text-xs" style="color:var(--text-3);">
            Etapa: <span class="font-semibold" style="color:var(--text-2);">{{ app.stage }}</span>
          </p>
          <button
            class="text-xs font-medium flex items-center gap-1 transition-colors"
            style="color:var(--text-2);"
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

<style scoped>
.app-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: border-color 0.15s;
}
.app-card:hover { border-color: rgba(255,255,255,0.12); }
</style>
