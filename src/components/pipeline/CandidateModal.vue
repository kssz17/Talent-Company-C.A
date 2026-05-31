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

const activeTab  = ref<'info' | 'evaluation' | 'activity'>('info')
const evalScore  = ref<number | null>(null)
const evalNotes  = ref('')
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
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background:rgba(0,0,0,0.72);backdrop-filter:blur(4px);"
    @click.self="emit('close')"
  >
    <div
      class="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl"
      style="background:var(--surface-2);border:1px solid var(--border);box-shadow:0 24px 64px rgba(0,0,0,0.6);"
    >

      <!-- Header -->
      <div class="flex items-start justify-between p-6 flex-shrink-0" style="border-bottom:1px solid var(--border);">
        <div class="flex items-center gap-3">
          <div
            class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style="background:var(--accent-m);color:var(--accent);"
          >
            {{ (candidate?.first_name?.[0] ?? '') + (candidate?.last_name?.[0] ?? '') }}
          </div>
          <div>
            <h3 class="font-semibold" style="color:var(--text-1);">
              {{ candidate?.first_name }} {{ candidate?.last_name }}
            </h3>
            <p class="text-sm" style="color:var(--text-2);">{{ candidate?.email }}</p>
          </div>
        </div>
        <button
          class="transition-colors p-1 rounded-lg"
          style="color:var(--text-3);"
          @mouseenter="($el as HTMLElement).style.color = 'var(--text-1)'"
          @mouseleave="($el as HTMLElement).style.color = 'var(--text-3)'"
          @click="emit('close')"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Stage selector -->
      <div class="px-6 py-3 flex-shrink-0" style="background:rgba(255,255,255,0.02);border-bottom:1px solid var(--border);">
        <div class="flex items-center gap-2 overflow-x-auto">
          <span class="text-xs flex-shrink-0" style="color:var(--text-3);">Mover a:</span>
          <button
            v-for="stage in stages"
            :key="stage.id"
            class="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all"
            :style="application.stage_id === stage.id
              ? { background: stage.color, color: '#fff', border: `1px solid ${stage.color}` }
              : { background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)' }"
            @click="emit('stageChange', application.id, stage.id)"
          >
            {{ stage.name }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex flex-shrink-0 px-6" style="border-bottom:1px solid var(--border);">
        <button
          v-for="tab in [{ id: 'info', label: 'Información' }, { id: 'evaluation', label: 'Evaluaciones' }, { id: 'activity', label: 'Actividad' }]"
          :key="tab.id"
          class="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
          :style="activeTab === tab.id
            ? { borderColor: 'var(--accent)', color: 'var(--accent)' }
            : { borderColor: 'transparent', color: 'var(--text-2)' }"
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
              <p class="text-xs mb-0.5" style="color:var(--text-3);">Teléfono</p>
              <p class="text-sm font-medium" style="color:var(--text-1);">{{ candidate.phone }}</p>
            </div>
            <div>
              <p class="text-xs mb-0.5" style="color:var(--text-3);">Fuente</p>
              <p class="text-sm font-medium" style="color:var(--text-1);">{{ application.source ?? '—' }}</p>
            </div>
            <div>
              <p class="text-xs mb-0.5" style="color:var(--text-3);">Aplicado el</p>
              <p class="text-sm font-medium" style="color:var(--text-1);">{{ application.created_at.slice(0,10) }}</p>
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
            <p class="text-xs mb-1" style="color:var(--text-3);">Carta de presentación</p>
            <div
              class="rounded-lg p-3 text-sm leading-relaxed whitespace-pre-line"
              style="background:rgba(255,255,255,0.04);color:var(--text-2);"
            >
              {{ application.cover_letter }}
            </div>
          </div>

          <div v-if="avgScore !== null" class="flex items-center gap-2">
            <p class="text-xs" style="color:var(--text-3);">Puntuación promedio:</p>
            <div class="flex items-center gap-1">
              <svg v-for="i in 5" :key="i" class="w-4 h-4"
                viewBox="0 0 24 24"
                :fill="i <= Math.round(Number(avgScore)) ? '#f59e0b' : 'none'"
                :stroke="i <= Math.round(Number(avgScore)) ? '#f59e0b' : 'rgba(255,255,255,0.15)'"
                stroke-width="2"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span class="text-sm font-semibold" style="color:#f59e0b;">{{ avgScore }}</span>
            </div>
          </div>
        </div>

        <!-- EVALUATION TAB -->
        <div v-else-if="activeTab === 'evaluation'" class="space-y-5">
          <div v-if="(application.evaluations?.length ?? 0) > 0" class="space-y-3">
            <div
              v-for="ev in application.evaluations"
              :key="ev.id"
              class="rounded-xl p-4"
              style="background:rgba(255,255,255,0.04);"
            >
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium" style="color:var(--text-1);">{{ ev.evaluator?.full_name }}</p>
                <div class="flex gap-0.5">
                  <svg v-for="i in 5" :key="i" class="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    :fill="ev.score && i <= ev.score ? '#f59e0b' : 'none'"
                    :stroke="ev.score && i <= ev.score ? '#f59e0b' : 'rgba(255,255,255,0.15)'"
                    stroke-width="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              </div>
              <p class="text-sm leading-relaxed" style="color:var(--text-2);">{{ ev.notes }}</p>
              <p class="text-xs mt-2" style="color:var(--text-3);">{{ ev.created_at.slice(0,10) }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-center py-4" style="color:var(--text-3);">No hay evaluaciones aún.</p>

          <!-- Add evaluation -->
          <div class="pt-4 space-y-3" style="border-top:1px solid var(--border);">
            <p class="text-sm font-medium" style="color:var(--text-1);">Añadir evaluación</p>
            <div>
              <p class="text-xs mb-1.5" style="color:var(--text-3);">Puntuación</p>
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
                    :stroke="evalScore !== null && i <= evalScore ? '#f59e0b' : 'rgba(255,255,255,0.2)'"
                    stroke-width="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </button>
              </div>
            </div>
            <textarea
              v-model="evalNotes"
              rows="3"
              placeholder="Escribe tus observaciones sobre el candidato..."
              class="form-input resize-none"
            />
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
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style="background:var(--accent-m);"
              >
                <div class="w-2 h-2 rounded-full" style="background:var(--accent);" />
              </div>
              <div>
                <p class="text-sm font-medium" style="color:var(--text-1);">{{ activityLabel(act.action) }}</p>
                <p v-if="act.metadata?.from" class="text-xs" style="color:var(--text-2);">
                  {{ act.metadata.from }} → {{ act.metadata.to }}
                </p>
                <p class="text-xs mt-0.5" style="color:var(--text-3);">
                  {{ act.user?.full_name }} · {{ act.created_at.slice(0,10) }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-center py-4" style="color:var(--text-3);">Sin actividad registrada.</p>
        </div>

      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between p-4 flex-shrink-0" style="border-top:1px solid var(--border);">
        <button class="btn btn-danger btn-sm" @click="emit('reject', application.id)">
          Descartar candidato
        </button>
        <button class="btn btn-secondary btn-sm" @click="emit('close')">Cerrar</button>
      </div>

    </div>
  </div>
</template>
