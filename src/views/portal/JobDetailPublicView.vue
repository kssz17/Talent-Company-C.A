<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'

const route  = useRoute()
const router = useRouter()
const store  = useJobsStore()
const auth   = useAuthStore()

const applying    = ref(false)
const submitted   = ref(false)
const sending     = ref(false)
const applyError  = ref<string | null>(null)
const coverLetter = ref('')
const phone       = ref('')

const useMock = !!import.meta.env.VITEST ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('your-project')

onMounted(() => {
  if (!store.jobs.length) store.fetchJobs()
})

const job = computed(() => store.getById(String(route.params.id)))

const workModeLabel: Record<string, string> = { 'on-site': 'Presencial', remote: 'Remoto', hybrid: 'Híbrido' }
const workModeBadge: Record<string, string> = {
  'on-site': 'badge-amber',
  remote:    'badge-green',
  hybrid:    'badge-blue',
}
const typeLabel: Record<string, string> = {
  'full-time': 'Jornada completa', 'part-time': 'Media jornada',
  contract: 'Temporal', internship: 'Prácticas',
}

function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) => `${(n / 1000).toFixed(0)}k`
  if (min && max) return `${fmt(min)} – ${fmt(max)} €/año`
  if (min) return `Desde ${fmt(min)} €/año`
  return `Hasta ${fmt(max!)} €/año`
}

function parseRequirements(text: string) {
  return text.split('\n').filter(Boolean).map(line =>
    line.startsWith('- ') ? line.slice(2) : line,
  )
}

async function applyToJob() {
  if (!job.value || !auth.profile) return
  sending.value  = true
  applyError.value = null

  if (useMock) {
    await new Promise(r => setTimeout(r, 700))
    submitted.value = true
    sending.value   = false
    return
  }

  // ── 1. Find or create candidate record ──
  const { data: existing } = await supabase
    .from('candidates')
    .select('id')
    .eq('email', auth.profile.email)
    .maybeSingle()

  let candidateId = existing?.id

  if (!candidateId) {
    const parts     = (auth.profile.full_name ?? '').trim().split(' ')
    const firstName = parts[0] ?? auth.profile.email.split('@')[0]
    const lastName  = parts.slice(1).join(' ') || ''

    const { data: newCandidate, error: cErr } = await supabase
      .from('candidates')
      .insert({
        email:      auth.profile.email,
        first_name: firstName,
        last_name:  lastName,
        phone:      phone.value || null,
      })
      .select('id')
      .single()

    if (cErr) {
      applyError.value = 'Error al registrar tu candidatura. Inténtalo de nuevo.'
      sending.value = false
      return
    }
    candidateId = newCandidate.id
  }

  // ── 2. Get first stage ──
  const { data: stageList } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('job_id', job.value.id)
    .order('order')
    .limit(1)

  const firstStageId = stageList?.[0]?.id
  if (!firstStageId) {
    applyError.value = 'Esta oferta no tiene pipeline configurado. Contacta al reclutador.'
    sending.value = false
    return
  }

  // ── 3. Insert application ──
  const { error: appErr } = await supabase
    .from('applications')
    .insert({
      job_id:       job.value.id,
      candidate_id: candidateId,
      stage_id:     firstStageId,
      status:       'active',
      cover_letter: coverLetter.value || null,
      source:       'Portal web',
    })

  if (appErr) {
    applyError.value = appErr.code === '23505'
      ? 'Ya has enviado una solicitud para esta oferta.'
      : 'Error al enviar la solicitud. Inténtalo de nuevo.'
    sending.value = false
    return
  }

  submitted.value = true
  sending.value   = false
}
</script>

<template>
  <div>
    <!-- Back -->
    <button
      class="back-btn flex items-center gap-1.5 text-sm mb-6"
      @click="router.push({ name: 'portal-jobs' })"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Volver a ofertas
    </button>

    <div v-if="!job" class="text-center py-20" style="color:var(--text-3);">
      Oferta no encontrada.
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-6 items-start">

      <!-- ── Detail ────────────────────────────────────────────── -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Header card -->
        <div class="card p-6">
          <h1 class="text-xl font-bold leading-snug mb-2" style="color:var(--text-1);">{{ job.title }}</h1>
          <p class="text-sm mb-4" style="color:var(--text-2);">Talent Company C.A · {{ job.location }}</p>
          <div class="flex flex-wrap gap-2">
            <span :class="['badge', workModeBadge[job.work_mode]]">
              {{ workModeLabel[job.work_mode] }}
            </span>
            <span class="badge badge-slate">{{ typeLabel[job.type] }}</span>
            <span v-if="job.department?.name" class="badge badge-slate">
              {{ job.department.name }}
            </span>
            <span v-if="formatSalary(job.salary_min, job.salary_max)" class="badge badge-green">
              {{ formatSalary(job.salary_min, job.salary_max) }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div class="card p-6">
          <h2 class="text-sm font-semibold mb-3" style="color:var(--text-1);">Descripción del puesto</h2>
          <p class="text-sm leading-relaxed whitespace-pre-line" style="color:var(--text-2);">{{ job.description }}</p>
        </div>

        <!-- Requirements -->
        <div v-if="job.requirements" class="card p-6">
          <h2 class="text-sm font-semibold mb-3" style="color:var(--text-1);">Requisitos</h2>
          <ul class="space-y-2">
            <li
              v-for="(req, i) in parseRequirements(job.requirements)"
              :key="i"
              class="flex items-start gap-2 text-sm"
              style="color:var(--text-2);"
            >
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" style="color:var(--text-3);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ req }}
            </li>
          </ul>
        </div>
      </div>

      <!-- ── Apply panel ──────────────────────────────────────── -->
      <div class="lg:col-span-1">
        <div class="card p-6 sticky top-20">

          <!-- Submitted -->
          <div v-if="submitted" class="text-center py-4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style="background:rgba(76,183,130,0.18);"
            >
              <svg class="w-6 h-6" style="color:#4CB782;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p class="font-semibold" style="color:var(--text-1);">¡Solicitud enviada!</p>
            <p class="text-sm mt-1" style="color:var(--text-2);">Puedes seguir el estado en "Mis solicitudes".</p>
            <button
              class="mt-4 text-sm underline"
              style="color:var(--text-2);"
              @click="router.push({ name: 'portal-applications' })"
            >
              Ver mis solicitudes
            </button>
          </div>

          <!-- Application form -->
          <div v-else-if="applying" class="space-y-4">
            <h3 class="font-semibold text-sm" style="color:var(--text-1);">Completa tu solicitud</h3>

            <div>
              <label class="form-label">Teléfono (opcional)</label>
              <input v-model="phone" type="tel" placeholder="+34 600 000 000" class="form-input w-full" />
            </div>
            <div>
              <label class="form-label">Carta de presentación (opcional)</label>
              <textarea
                v-model="coverLetter"
                rows="4"
                placeholder="¿Por qué eres el candidato ideal para este puesto?"
                class="form-input w-full resize-none"
              />
            </div>

            <div
              v-if="applyError"
              class="text-xs rounded-lg px-3 py-2"
              style="color:#f87171;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);"
            >
              {{ applyError }}
            </div>

            <button
              :disabled="sending"
              class="btn btn-primary w-full disabled:opacity-50"
              @click="applyToJob"
            >
              {{ sending ? 'Enviando…' : 'Enviar solicitud' }}
            </button>
            <button
              class="w-full text-sm"
              style="color:var(--text-3);background:none;border:none;cursor:pointer;"
              @click="applying = false; applyError = null"
            >
              Cancelar
            </button>
          </div>

          <!-- Initial state -->
          <div v-else class="space-y-4">
            <div class="text-center">
              <p class="text-xs" style="color:var(--text-3);">Empresa</p>
              <p class="font-semibold mt-0.5" style="color:var(--text-1);">Talent Company C.A</p>
            </div>
            <div v-if="formatSalary(job.salary_min, job.salary_max)" class="text-center pt-4" style="border-top:1px solid var(--border);">
              <p class="text-xs" style="color:var(--text-3);">Salario</p>
              <p class="font-semibold mt-0.5" style="color:var(--text-1);">{{ formatSalary(job.salary_min, job.salary_max) }}</p>
            </div>
            <button class="btn btn-primary w-full" @click="applying = true">
              Aplicar a esta oferta
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-2);
  transition: color 0.1s;
  padding: 0;
}
.back-btn:hover { color: var(--text-1); }
</style>
