<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePipelineStore } from '@/stores/pipeline'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const pipeline = usePipelineStore()
const auth     = useAuthStore()

const search    = ref('')
const stageFilter = ref('')
const selected  = ref<Set<string>>(new Set())
const showBulkMenu = ref(false)

const uniqueCandidates = computed(() => {
  const seen = new Set<string>()
  return pipeline.applications
    .filter(a => {
      if (seen.has(a.candidate_id)) return false
      seen.add(a.candidate_id)
      return true
    })
    .filter(a => {
      const q = search.value.toLowerCase()
      const c = a.candidate
      const matchSearch = !q ||
        c?.first_name.toLowerCase().includes(q) ||
        c?.last_name.toLowerCase().includes(q) ||
        c?.email.toLowerCase().includes(q)

      const matchStage = !stageFilter.value || a.stage_id === stageFilter.value

      return matchSearch && matchStage
    })
})

const allSelected = computed(() =>
  uniqueCandidates.value.length > 0 &&
  uniqueCandidates.value.every(a => selected.value.has(a.candidate_id)),
)

function toggleAll() {
  if (allSelected.value) {
    selected.value = new Set()
  } else {
    selected.value = new Set(uniqueCandidates.value.map(a => a.candidate_id))
  }
}

function toggleOne(id: string) {
  const next = new Set(selected.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selected.value = next
}

function clearSelection() {
  selected.value = new Set()
  showBulkMenu.value = false
}

// Bulk actions (en una app real harían llamadas a Supabase)
function bulkAction(action: string) {
  const count = selected.value.size
  alert(`Acción "${action}" aplicada a ${count} candidato(s). (En producción: llamada a Supabase)`)
  clearSelection()
}

function stageName(stageId: string) {
  return pipeline.stages.find(s => s.id === stageId)?.name ?? '—'
}
function stageColor(stageId: string) {
  return pipeline.stages.find(s => s.id === stageId)?.color ?? '#64748b'
}

const uniqueStages = computed(() => {
  const ids = new Set(pipeline.applications.map(a => a.stage_id))
  return pipeline.stages.filter(s => ids.has(s.id))
})

function avgScore(candidateId: string): number | null {
  const apps = pipeline.applications.filter(a => a.candidate_id === candidateId)
  const evals = apps.flatMap(a => a.evaluations ?? []).filter(e => e.score != null)
  if (!evals.length) return null
  return Math.round(evals.reduce((s, e) => s + (e.score ?? 0), 0) / evals.length)
}
</script>

<template>
  <div class="space-y-4 max-w-6xl mx-auto">

    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" type="text" placeholder="Buscar por nombre o email..." class="form-input pl-9" />
      </div>

      <!-- Stage filter -->
      <select v-model="stageFilter" class="form-input w-40">
        <option value="">Todas las etapas</option>
        <option v-for="s in uniqueStages" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>

      <div class="flex items-center gap-2 sm:ml-auto">
        <span class="badge badge-slate self-center">{{ uniqueCandidates.length }} candidatos</span>
      </div>
    </div>

    <!-- Bulk actions bar — aparece cuando hay selección -->
    <Transition name="slide-down">
      <div
        v-if="selected.size > 0"
        class="flex items-center gap-3 bg-primary-600 text-white rounded-xl px-5 py-3 shadow-lg"
      >
        <span class="text-sm font-semibold">
          {{ selected.size }} seleccionado{{ selected.size !== 1 ? 's' : '' }}
        </span>
        <div class="h-4 w-px bg-primary-400" />

        <div class="flex items-center gap-2 flex-wrap">
          <button
            class="text-xs font-medium bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
            @click="bulkAction('Mover a Revisión')"
          >
            → Mover a Revisión
          </button>
          <button
            class="text-xs font-medium bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg transition-colors"
            @click="bulkAction('Enviar email')"
          >
            ✉ Enviar email
          </button>
          <button
            v-if="auth.isRecruiter"
            class="text-xs font-medium bg-red-500/70 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors"
            @click="bulkAction('Descartar')"
          >
            ✕ Descartar
          </button>
        </div>

        <button
          class="ml-auto text-white/60 hover:text-white transition-colors text-xs font-medium"
          @click="clearSelection"
        >
          Cancelar
        </button>
      </div>
    </Transition>

    <!-- Table -->
    <div class="card overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <!-- Checkbox seleccionar todo -->
            <th class="w-10 px-4 py-3">
              <input
                type="checkbox"
                class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                :checked="allSelected"
                :indeterminate="selected.size > 0 && !allSelected"
                @change="toggleAll"
              />
            </th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidato</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Oferta</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Etapa</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Fuente</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Puntuación</th>
            <th class="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Aplicado</th>
            <th class="px-4 py-3 w-20"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="app in uniqueCandidates"
            :key="app.id"
            :class="[
              'hover:bg-slate-50 transition-colors',
              selected.has(app.candidate_id) ? 'bg-primary-50' : '',
            ]"
          >
            <!-- Checkbox individual -->
            <td class="px-4 py-3" @click.stop>
              <input
                type="checkbox"
                class="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                :checked="selected.has(app.candidate_id)"
                @change="toggleOne(app.candidate_id)"
              />
            </td>

            <!-- Candidato -->
            <td
              class="px-4 py-3 cursor-pointer"
              @click="router.push({ name: 'candidates-detail', params: { id: app.candidate_id } })"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  :style="{ background: stageColor(app.stage_id) }"
                >
                  {{ (app.candidate?.first_name?.[0] ?? '') + (app.candidate?.last_name?.[0] ?? '') }}
                </div>
                <div class="min-w-0">
                  <p class="font-semibold text-slate-800 truncate">
                    {{ app.candidate?.first_name }} {{ app.candidate?.last_name }}
                  </p>
                  <p class="text-xs text-slate-400 truncate">{{ app.candidate?.email }}</p>
                </div>
              </div>
            </td>

            <!-- Oferta -->
            <td class="px-4 py-3 hidden sm:table-cell">
              <span class="text-slate-600 text-sm truncate max-w-[11rem] block">
                {{ app.job?.title ?? '—' }}
              </span>
            </td>

            <!-- Etapa -->
            <td class="px-4 py-3">
              <span
                class="badge"
                :style="{ backgroundColor: stageColor(app.stage_id) + '18', color: stageColor(app.stage_id) }"
              >
                {{ stageName(app.stage_id) }}
              </span>
            </td>

            <!-- Fuente -->
            <td class="px-4 py-3 hidden md:table-cell">
              <span class="text-slate-500 text-sm">{{ app.source ?? '—' }}</span>
            </td>

            <!-- Puntuación -->
            <td class="px-4 py-3 hidden lg:table-cell">
              <div v-if="avgScore(app.candidate_id) !== null" class="flex items-center gap-0.5">
                <svg
                  v-for="i in 5"
                  :key="i"
                  class="w-3 h-3"
                  viewBox="0 0 24 24"
                  :fill="i <= (avgScore(app.candidate_id) ?? 0) ? '#f59e0b' : 'none'"
                  :stroke="i <= (avgScore(app.candidate_id) ?? 0) ? '#f59e0b' : '#e2e8f0'"
                  stroke-width="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <span v-else class="text-xs text-slate-300">Sin eval.</span>
            </td>

            <!-- Fecha -->
            <td class="px-4 py-3 hidden md:table-cell">
              <span class="text-xs text-slate-400">{{ app.created_at.slice(0, 10) }}</span>
            </td>

            <!-- Acción -->
            <td class="px-4 py-3 text-right">
              <button
                class="btn btn-ghost btn-sm text-xs opacity-0 group-hover:opacity-100"
                @click="router.push({ name: 'candidates-detail', params: { id: app.candidate_id } })"
              >
                Ver →
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="uniqueCandidates.length === 0" class="py-16 text-center">
        <svg class="w-8 h-8 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p class="text-slate-400 text-sm">No se encontraron candidatos con estos filtros.</p>
        <button class="text-xs text-primary-600 hover:underline mt-1" @click="search = ''; stageFilter = ''">
          Limpiar filtros
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active { transition: all .2s ease-out; }
.slide-down-leave-active { transition: all .15s ease-in; }
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
