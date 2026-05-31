<script setup lang="ts">
import { ref } from 'vue'
import type { PipelineStage, Application } from '@/types'
import KanbanCard from './KanbanCard.vue'

const props = defineProps<{
  stage: PipelineStage
  applications: Application[]
}>()

const emit = defineEmits<{
  cardClick: [app: Application]
  drop: [applicationId: string, stageId: string]
}>()

const isDragOver = ref(false)

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}
function onDragLeave(e: DragEvent) {
  if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const id = e.dataTransfer?.getData('application-id')
  if (id) emit('drop', id, props.stage.id)
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<template>
  <div
    class="flex flex-col w-64 flex-shrink-0"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <!-- Column header -->
    <div class="rounded-xl mb-3 overflow-hidden">
      <div
        class="px-3 py-2.5 flex items-center justify-between"
        :style="{ backgroundColor: stage.color }"
      >
        <span class="text-xs font-bold text-white uppercase tracking-wider">{{ stage.name }}</span>
        <span class="text-xs font-bold bg-white/25 text-white px-2 py-0.5 rounded-full leading-none">
          {{ applications.length }}
        </span>
      </div>
    </div>

    <!-- Cards area -->
    <div
      :class="['flex-1 min-h-24 space-y-2.5 rounded-xl p-2 transition-all duration-150']"
      :style="isDragOver
        ? { backgroundColor: hexToRgba(stage.color, 0.08), outline: `2px dashed ${stage.color}`, outlineOffset: '-2px' }
        : { background: 'rgba(255,255,255,0.03)' }"
    >
      <KanbanCard
        v-for="app in applications"
        :key="app.id"
        :application="app"
        :stage-color="stage.color"
        @click="emit('cardClick', app)"
      />

      <!-- Empty drop hint -->
      <div
        v-if="applications.length === 0 && !isDragOver"
        class="flex flex-col items-center justify-center h-20 gap-1.5"
        style="color:var(--text-3);"
      >
        <svg class="w-4 h-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
        <span class="text-xs">Arrastra aquí</span>
      </div>

      <!-- Drop active hint -->
      <div
        v-if="isDragOver"
        class="flex items-center justify-center h-12 rounded-lg border-2 border-dashed text-xs font-medium"
        :style="{ borderColor: stage.color, color: stage.color }"
      >
        Soltar en {{ stage.name }}
      </div>
    </div>
  </div>
</template>
