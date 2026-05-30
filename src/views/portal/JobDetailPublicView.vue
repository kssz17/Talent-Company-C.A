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

const applying  = ref(false)
const submitted = ref(false)
const sending   = ref(false)
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
  'on-site': 'bg-orange-100 text-orange-700',
  remote:    'bg-green-100 text-green-700',
  hybrid:    'bg-blue-100 text-blue-700',
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

// Convierte el markdown simple de requirements en lista HTML
function parseRequirements(text: string) {
  return text.split('\n').filter(Boolean).map(line =>
    line.startsWith('- ') ? line.slice(2) : line,
  )
}

async function applyToJob() {
  if (!job.value) return
  sending.value = true

  if (useMock) {
    await new Promise(r => setTimeout(r, 700))
    submitted.value = true
    sending.value   = false
    return
  }

  // En real: buscar o crear el candidate row, luego insertar application
  // Por simplicidad del demo usamos el profile del candidato
  const candidateId = auth.profile?.id
  if (!candidateId) { sending.value = false; return }

  // Obtener el stage inicial del job (el primero en orden)
  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('id')
    .eq('job_id', job.value.id)
    .order('order')
    .limit(1)

  const firstStageId = stages?.[0]?.id
  if (!firstStageId) { sending.value = false; return }

  await supabase.from('applications').insert({
    job_id:       job.value.id,
    candidate_id: candidateId,
    stage_id:     firstStageId,
    status:       'active',
  })

  submitted.value = true
  sending.value   = false
}
</script>

<template>
  <div>
    <!-- Back -->
    <button
      class="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      @click="router.push({ name: 'portal-jobs' })"
    >
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Volver a ofertas
    </button>

    <div v-if="!job" class="text-center py-20 text-slate-400">
      Oferta no encontrada.
    </div>

    <div v-else class="grid lg:grid-cols-3 gap-6 items-start">

      <!-- ── Detalle ────────────────────────────────────────── -->
      <div class="lg:col-span-2 space-y-5">

        <!-- Cabecera -->
        <div class="bg-white border border-slate-200 rounded-xl p-6">
          <h1 class="text-xl font-bold text-slate-900 leading-snug mb-2">{{ job.title }}</h1>
          <p class="text-slate-500 text-sm mb-4">Talent Company C.A · {{ job.location }}</p>
          <div class="flex flex-wrap gap-2">
            <span :class="['text-xs font-medium px-2.5 py-1 rounded-full', workModeBadge[job.work_mode]]">
              {{ workModeLabel[job.work_mode] }}
            </span>
            <span class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {{ typeLabel[job.type] }}
            </span>
            <span v-if="job.department?.name" class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              {{ job.department.name }}
            </span>
            <span v-if="formatSalary(job.salary_min, job.salary_max)" class="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">
              {{ formatSalary(job.salary_min, job.salary_max) }}
            </span>
          </div>
        </div>

        <!-- Descripción -->
        <div class="bg-white border border-slate-200 rounded-xl p-6">
          <h2 class="text-sm font-semibold text-slate-800 mb-3">Descripción del puesto</h2>
          <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ job.description }}</p>
        </div>

        <!-- Requisitos -->
        <div v-if="job.requirements" class="bg-white border border-slate-200 rounded-xl p-6">
          <h2 class="text-sm font-semibold text-slate-800 mb-3">Requisitos</h2>
          <ul class="space-y-2">
            <li
              v-for="(req, i) in parseRequirements(job.requirements)"
              :key="i"
              class="flex items-start gap-2 text-sm text-slate-600"
            >
              <svg class="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ req }}
            </li>
          </ul>
        </div>
      </div>

      <!-- ── Panel aplicación ──────────────────────────────── -->
      <div class="lg:col-span-1">
        <div class="bg-white border border-slate-200 rounded-xl p-6 sticky top-20">

          <!-- Estado: enviada -->
          <div v-if="submitted" class="text-center py-4">
            <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p class="font-semibold text-slate-900">¡Solicitud enviada!</p>
            <p class="text-sm text-slate-500 mt-1">Puedes seguir el estado en "Mis solicitudes".</p>
            <button
              class="mt-4 text-sm text-slate-600 hover:text-slate-900 underline"
              @click="router.push({ name: 'portal-applications' })"
            >
              Ver mis solicitudes
            </button>
          </div>

          <!-- Formulario de aplicación -->
          <div v-else-if="applying" class="space-y-4">
            <h3 class="font-semibold text-slate-900 text-sm">Completa tu solicitud</h3>

            <div>
              <label class="text-xs font-medium text-slate-600 block mb-1">Teléfono (opcional)</label>
              <input
                v-model="phone"
                type="tel"
                placeholder="+34 600 000 000"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 block mb-1">Carta de presentación (opcional)</label>
              <textarea
                v-model="coverLetter"
                rows="4"
                placeholder="¿Por qué eres el candidato ideal para este puesto?"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400 resize-none"
              />
            </div>

            <button
              :disabled="sending"
              class="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              @click="applyToJob"
            >
              {{ sending ? 'Enviando…' : 'Enviar solicitud' }}
            </button>
            <button
              class="w-full text-sm text-slate-500 hover:text-slate-700"
              @click="applying = false"
            >
              Cancelar
            </button>
          </div>

          <!-- Botón inicial -->
          <div v-else class="space-y-4">
            <div class="text-center">
              <p class="text-xs text-slate-400 mb-1">Empresa</p>
              <p class="font-semibold text-slate-800">Talent Company C.A</p>
            </div>
            <div v-if="formatSalary(job.salary_min, job.salary_max)" class="text-center border-t border-slate-100 pt-4">
              <p class="text-xs text-slate-400 mb-1">Salario</p>
              <p class="font-semibold text-slate-800">{{ formatSalary(job.salary_min, job.salary_max) }}</p>
            </div>
            <button
              class="w-full bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
              @click="applying = true"
            >
              Aplicar a esta oferta
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
