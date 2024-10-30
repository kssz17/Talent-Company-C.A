<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Application, PipelineStage } from '@/types'

const props = defineProps<{
  application: Application
  stages: PipelineStage[]
}>()

const emit = defineEmits<{
  close: []
  stageChange: [appId: string, stageId: string]
  evaluationAdd: [appId: string, score: number | null, notes: string]
  reject: [appId: string]
}>()

const activeTab = ref<'info' | 'evaluation' | 'activity'>('info')
const evalScore = ref<number | null>(null)
const evalNotes = ref('')
const savingEval = ref(false)

const candidate = computed(() => props.application.candidate)

async function submitEvaluation() {
  if (!evalNotes.value.trim()) return
  savingEval.value = true
  await new Promise(r => setTimeout(r, 300))
  emit('evaluationAdd', props.application.id, evalScore.value, evalNotes.value)
  evalScore.value = null
  evalNotes.value = ''
  savingEval.value = false
}

function setScore(n: number) {
  evalScore.value = evalScore.value === n ? null : n
}

const avgScore = computed(() => {
  const evals = props.application.evaluations?.filter(e => e.score != null) ?? []
  if (!evals.length) return null
  return (evals.reduce((s, e) => s + (e.score ?? 0), 0) / evals.length).toFixed(1)
})

function activityLabel(action: string): string {
  const map: Record<string, string> = {
    stage_changed:    'Cambio de etapa',
    evaluation_added: 'Evaluación añadida',
    note_added:       'Nota añadida',
  }
  return map[action] ?? action
}
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

      <!-- Modal header -->
      <div class="flex items-start justify-between p-6 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">
            {{ (candidate?.first_name?.[0] ?? '') + (candidate?.last_name?.[0] ?? '') }}
          </div>
          <div>
            <h3 class="font-semibold text-slate-900">{{ candidate?.first_name }} {{ candidate?.last_name }}</h3>
            <p class="text-sm text-slate-500">{{ candidate?.email }}</p>
          </div>
        </div>
        <button class="text-slate-400 hover:text-slate-600 transition-colors" @click="emit('close')">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Stage selector -->
      <div class="px-6 py-3 bg-slate-50 border-b border-slate-100">
        <div class="flex items-center gap-2 overflow-x-auto">
          <span class="text-xs text-slate-500 flex-shrink-0">Mover a:</span>
          <button
            v-for="stage in stages"
            :key="stage.id"
            :class="[
              'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border',
              application.stage_id === stage.id
                ? 'text-white border-transparent'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300',
            ]"
            :style="application.stage_id === stage.id ? { background: stage.color, borderColor: stage.color } : {}"
            @click="emit('stageChange', application.id, stage.id)"
          >
            {{ stage.name }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-slate-100 px-6 flex-shrink-0">
        <button
          v-for="tab in [{ id: 'info', label: 'Información' }, { id: 'evaluation', label: 'Evaluaciones' }, { id: 'activity', label: 'Actividad' }]"
          :key="tab.id"
          :class="[
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          ]"
          @click="activeTab = tab.id as 'info' | 'evaluation' | 'activity'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab content -->
      <div class="flex-1 overflow-y-auto p-6">

        <!-- INFO TAB -->
        <div v-if="activeTab === 'info'" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div v-if="candidate?.phone">
              <p class="text-xs text-slate-500 mb-0.5">Teléfono</p>
              <p class="text-sm font-medium text-slate-800">{{ candidate.phone }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-0.5">Fuente</p>
              <p class="text-sm font-medium text-slate-800">{{ application.source ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-0.5">Aplicado el</p>
              <p class="text-sm font-medium text-slate-800">{{ application.created_at.slice(0,10) }}</p>
            </div>
          </div>

          <div v-if="candidate?.linkedin_url || candidate?.portfolio_url" class="flex gap-2 flex-wrap">
            <a
              v-if="candidate.linkedin_url"
              :href="candidate.linkedin_url"
              target="_blank"
              class="btn btn-secondary btn-sm"
            >
              LinkedIn ↗
            </a>
            <a
              v-if="candidate.portfolio_url"
              :href="candidate.portfolio_url"
              target="_blank"
              class="btn btn-secondary btn-sm"
            >
              Portfolio ↗
            </a>
          </div>

          <div v-if="application.cover_letter">
            <p class="text-xs text-slate-500 mb-1">Carta de presentación</p>
            <div class="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {{ application.cover_letter }}
            </div>
          </div>

          <!-- Average score -->
          <div v-if="avgScore !== null" class="flex items-center gap-2">
            <p class="text-xs text-slate-500">Puntuación promedio:</p>
            <div class="flex items-center gap-1">
              <svg v-for="i in 5" :key="i" class="w-4 h-4"
                viewBox="0 0 24 24"
                :fill="i <= Math.round(Number(avgScore)) ? '#f59e0b' : 'none'"
                :stroke="i <= Math.round(Number(avgScore)) ? '#f59e0b' : '#d1d5db'"
                stroke-width="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span class="text-sm font-semibold text-amber-600">{{ avgScore }}</span>
            </div>
          </div>
        </div>

        <!-- EVALUATION TAB -->
        <div v-else-if="activeTab === 'evaluation'" class="space-y-5">
          <!-- Existing evaluations -->
          <div v-if="(application.evaluations?.length ?? 0) > 0" class="space-y-3">
            <div
              v-for="ev in application.evaluations"
              :key="ev.id"
              class="bg-slate-50 rounded-xl p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-slate-800">{{ ev.evaluator?.full_name }}</p>
                <div class="flex gap-0.5">
                  <svg v-for="i in 5" :key="i" class="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    :fill="ev.score && i <= ev.score ? '#f59e0b' : 'none'"
                    :stroke="ev.score && i <= ev.score ? '#f59e0b' : '#d1d5db'"
                    stroke-width="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed">{{ ev.notes }}</p>
              <p class="text-xs text-slate-400 mt-2">{{ ev.created_at.slice(0,10) }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-slate-400 text-center py-4">No hay evaluaciones aún.</p>

          <!-- Add evaluation form -->
          <div class="border-t border-slate-100 pt-4 space-y-3">
            <p class="text-sm font-medium text-slate-700">Añadir evaluación</p>
            <div>
              <p class="text-xs text-slate-500 mb-1.5">Puntuación</p>
              <div class="flex gap-1">
                <button
                  v-for="i in 5"
                  :key="i"
                  class="focus:outline-none transition-transform hover:scale-110"
                  @click="setScore(i)"
                >
                  <svg class="w-6 h-6"
                    viewBox="0 0 24 24"
                    :fill="evalScore !== null && i <= evalScore ? '#f59e0b' : 'none'"
                    :stroke="evalScore !== null && i <= evalScore ? '#f59e0b' : '#d1d5db'"
                    stroke-width="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <textarea
                v-model="evalNotes"
                rows="3"
                placeholder="Escribe tus observaciones sobre el candidato..."
                class="form-input resize-none"
              />
            </div>
            <button
              class="btn btn-primary btn-sm"
              :disabled="!evalNotes.trim() || savingEval"
              @click="submitEvaluation"
            >
              {{ savingEval ? 'Guardando...' : 'Guardar evaluación' }}
            </button>
          </div>
        </div>

        <!-- ACTIVITY TAB -->
        <div v-else-if="activeTab === 'activity'">
          <div v-if="(application.activities?.length ?? 0) > 0" class="space-y-3">
            <div
              v-for="act in [...(application.activities ?? [])].reverse()"
              :key="act.id"
              class="flex gap-3"
            >
              <div class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div class="w-2 h-2 rounded-full bg-primary-500" />
              </div>
              <div>
                <p class="text-sm text-slate-800 font-medium">{{ activityLabel(act.action) }}</p>
                <p v-if="act.metadata?.from" class="text-xs text-slate-500">
                  {{ act.metadata.from }} → {{ act.metadata.to }}
                </p>
                <p class="text-xs text-slate-400 mt-0.5">
                  {{ act.user?.full_name }} · {{ act.created_at.slice(0,10) }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-slate-400 text-center py-4">Sin actividad registrada.</p>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="flex items-center justify-between p-4 border-t border-slate-100 flex-shrink-0">
        <button
          class="btn btn-danger btn-sm"
          @click="emit('reject', application.id)"
        >
          Descartar candidato
        </button>
        <button class="btn btn-secondary btn-sm" @click="emit('close')">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
