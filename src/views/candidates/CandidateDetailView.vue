<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePipelineStore } from '@/stores/pipeline'

const route    = useRoute()
const router   = useRouter()
const pipeline = usePipelineStore()

const candidateId = computed(() => String(route.params.id))

const applications = computed(() =>
  pipeline.applications.filter(a => a.candidate_id === candidateId.value),
)

const candidate = computed(() => applications.value[0]?.candidate ?? null)

function stageColor(stageId: string) {
  return pipeline.stages.find(s => s.id === stageId)?.color ?? '#64748b'
}
function stageName(stageId: string) {
  return pipeline.stages.find(s => s.id === stageId)?.name ?? '—'
}

const avgScore = computed(() => {
  const evals = applications.value.flatMap(a => a.evaluations ?? []).filter(e => e.score != null)
  if (!evals.length) return null
  return (evals.reduce((s, e) => s + (e.score ?? 0), 0) / evals.length).toFixed(1)
})
</script>

<template>
  <div v-if="!candidate" class="text-center py-20">
    <p style="color:var(--text-2);">Candidato no encontrado.</p>
    <button class="btn btn-secondary mt-4" @click="router.push({ name: 'candidates' })">Volver</button>
  </div>

  <div v-else class="max-w-4xl mx-auto space-y-5">

    <button class="btn btn-ghost btn-sm" @click="router.push({ name: 'candidates' })">
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Candidatos
    </button>

    <div class="grid lg:grid-cols-3 gap-5">

      <!-- Profile card -->
      <div class="card p-6 space-y-4">
        <div class="flex flex-col items-center text-center">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mb-3"
            style="background:var(--accent-m);color:var(--accent);"
          >
            {{ (candidate.first_name?.[0] ?? '') + (candidate.last_name?.[0] ?? '') }}
          </div>
          <h2 class="font-semibold text-lg" style="color:var(--text-1);">
            {{ candidate.first_name }} {{ candidate.last_name }}
          </h2>
          <p class="text-sm mt-0.5" style="color:var(--text-2);">{{ candidate.email }}</p>
          <p v-if="candidate.phone" class="text-sm" style="color:var(--text-2);">{{ candidate.phone }}</p>
        </div>

        <!-- Rating -->
        <div v-if="avgScore" class="flex items-center justify-center gap-1.5">
          <div class="flex gap-0.5">
            <svg v-for="i in 5" :key="i" class="w-4 h-4"
              viewBox="0 0 24 24"
              :fill="i <= Math.round(Number(avgScore)) ? '#f59e0b' : 'none'"
              :stroke="i <= Math.round(Number(avgScore)) ? '#f59e0b' : 'rgba(255,255,255,0.15)'"
              stroke-width="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <span class="text-sm font-semibold" style="color:#f59e0b;">{{ avgScore }}</span>
        </div>

        <div class="flex flex-col gap-2">
          <a
            v-if="candidate.linkedin_url"
            :href="candidate.linkedin_url"
            target="_blank"
            class="btn btn-secondary btn-sm w-full justify-center"
          >
            LinkedIn ↗
          </a>
          <a
            v-if="candidate.portfolio_url"
            :href="candidate.portfolio_url"
            target="_blank"
            class="btn btn-secondary btn-sm w-full justify-center"
          >
            Portfolio ↗
          </a>
        </div>

        <p class="text-xs text-center" style="color:var(--text-3);">
          Registrado el {{ candidate.created_at.slice(0, 10) }}
        </p>
      </div>

      <!-- Applications + evaluations -->
      <div class="lg:col-span-2 space-y-4">
        <div class="card">
          <div class="card-header">
            <h3 class="text-sm font-semibold" style="color:var(--text-1);">
              Candidaturas ({{ applications.length }})
            </h3>
          </div>
          <div>
            <div
              v-for="app in applications"
              :key="app.id"
              class="px-6 py-4"
              style="border-bottom:1px solid var(--border-2);"
            >
              <div class="flex items-center justify-between mb-2">
                <div>
                  <p class="font-medium text-sm" style="color:var(--text-1);">{{ app.job?.title }}</p>
                  <p class="text-xs" style="color:var(--text-2);">
                    {{ app.job?.department?.name }} · {{ app.created_at.slice(0,10) }}
                  </p>
                </div>
                <span
                  class="badge"
                  :style="{ backgroundColor: stageColor(app.stage_id) + '20', color: stageColor(app.stage_id) }"
                >
                  {{ stageName(app.stage_id) }}
                </span>
              </div>

              <!-- Evaluations -->
              <div v-if="(app.evaluations?.length ?? 0) > 0" class="mt-3 space-y-2">
                <p class="text-xs font-medium" style="color:var(--text-3);">Evaluaciones:</p>
                <div
                  v-for="ev in app.evaluations"
                  :key="ev.id"
                  class="rounded-lg px-3 py-2"
                  style="background:rgba(255,255,255,0.04);"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium" style="color:var(--text-1);">{{ ev.evaluator?.full_name }}</span>
                    <div class="flex gap-0.5">
                      <svg v-for="i in 5" :key="i" class="w-3 h-3"
                        viewBox="0 0 24 24"
                        :fill="ev.score && i <= ev.score ? '#f59e0b' : 'none'"
                        :stroke="ev.score && i <= ev.score ? '#f59e0b' : 'rgba(255,255,255,0.15)'"
                        stroke-width="2"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </div>
                  </div>
                  <p class="text-xs" style="color:var(--text-2);">{{ ev.notes }}</p>
                </div>
              </div>

              <button
                class="btn btn-secondary btn-sm mt-3"
                @click="router.push({ name: 'pipeline', params: { jobId: app.job_id } })"
              >
                Ver en pipeline
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
