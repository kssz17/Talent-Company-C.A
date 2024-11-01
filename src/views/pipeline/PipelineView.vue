<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePipelineStore } from '@/stores/pipeline'
import { useJobsStore } from '@/stores/jobs'
import KanbanColumn from '@/components/pipeline/KanbanColumn.vue'
import CandidateModal from '@/components/pipeline/CandidateModal.vue'
import type { Application } from '@/types'

const route    = useRoute()
const router   = useRouter()
const pipeline = usePipelineStore()
const jobsStore = useJobsStore()

const selectedApp = ref<Application | null>(null)
const showModal   = ref(false)

const activeJobId = computed({
  get: () => pipeline.activeJobId ?? jobsStore.jobs[0]?.id ?? null,
  set: (val) => pipeline.setActiveJob(val ?? ''),
})

onMounted(() => {
  const jobId = route.params.jobId as string | undefined
  if (jobId) pipeline.setActiveJob(jobId)
  else if (!pipeline.activeJobId && jobsStore.jobs[0]) pipeline.setActiveJob(jobsStore.jobs[0].id)
})

watch(() => route.params.jobId, (id) => {
  if (id) pipeline.setActiveJob(String(id))
})

function openCandidate(app: Application) {
  selectedApp.value = app
  showModal.value = true
}

async function handleDrop(applicationId: string, newStageId: string) {
  await pipeline.moveApplication(applicationId, newStageId)
}

const totalActive = computed(() =>
  pipeline.applications.filter(a => a.job_id === pipeline.activeJobId && a.status === 'active').length,
)
</script>

<template>
  <div class="flex flex-col h-full -m-6 overflow-hidden">
    <!-- Pipeline toolbar -->
    <div class="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600 font-medium">Oferta:</label>
        <select
          v-model="activeJobId"
          class="form-input w-64 text-sm"
        >
          <option v-for="job in jobsStore.jobs" :key="job.id" :value="job.id">
            {{ job.title }}
          </option>
        </select>
      </div>
      <span class="badge badge-blue text-xs">{{ totalActive }} candidatos activos</span>
      <div class="ml-auto flex gap-2">
        <button
          class="btn btn-secondary btn-sm"
          @click="router.push({ name: 'jobs-detail', params: { id: activeJobId } })"
        >
          Ver oferta
        </button>
      </div>
    </div>

    <!-- Kanban board -->
    <div class="flex-1 overflow-x-auto">
      <div class="flex gap-4 h-full p-6 min-w-max">
        <KanbanColumn
          v-for="stage in pipeline.stagesForJob"
          :key="stage.id"
          :stage="stage"
          :applications="pipeline.applicationsByStage.get(stage.id) ?? []"
          @card-click="openCandidate"
          @drop="handleDrop"
        />
      </div>
    </div>

    <!-- Candidate detail modal -->
    <CandidateModal
      v-if="showModal && selectedApp"
      :application="selectedApp"
      :stages="pipeline.stagesForJob"
      @close="showModal = false"
      @stage-change="(appId, stageId) => pipeline.moveApplication(appId, stageId)"
      @evaluation-add="(appId, score, notes) => pipeline.addEvaluation(appId, score, notes)"
      @reject="(appId) => { pipeline.rejectApplication(appId); showModal = false }"
    />
  </div>
</template>
