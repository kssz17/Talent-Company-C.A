<script setup lang="ts">
import type { Application } from '@/types'

const props = defineProps<{
  application: Application
  stageColor?: string
}>()

defineEmits<{ click: [] }>()

function startDrag(e: DragEvent, applicationId: string) {
  e.dataTransfer?.setData('application-id', applicationId)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

function avgScore(app: Application): number | null {
  const evals = app.evaluations?.filter(e => e.score != null) ?? []
  if (!evals.length) return null
  return Math.round(evals.reduce((s, e) => s + (e.score ?? 0), 0) / evals.length)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function initials(app: Application): string {
  return (
    (app.candidate?.first_name?.[0] ?? '') +
    (app.candidate?.last_name?.[0] ?? '')
  ).toUpperCase()
}
</script>

<template>
  <div
    class="group card-kanban rounded-lg cursor-pointer select-none
           hover:-translate-y-0.5 active:scale-[0.98]
           transition-all duration-150"
    :style="{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
    }"
    draggable="true"
    @dragstart="startDrag($event, application.id)"
    @click="$emit('click')"
  >
    <!-- Left accent bar -->
    <div
      class="h-full rounded-lg overflow-hidden"
      :style="stageColor ? { borderLeft: `3px solid ${stageColor}` } : {}"
    >
      <div class="p-3">

        <!-- Top row: avatar + name + drag handle -->
        <div class="flex items-start gap-2">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
            :style="{ background: stageColor ?? '#64748b' }"
          >
            {{ initials(application) }}
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate leading-snug" style="color:var(--text-1);">
              {{ application.candidate?.first_name }} {{ application.candidate?.last_name }}
            </p>
            <p class="text-xs truncate mt-0.5" style="color:var(--text-3);">
              {{ application.candidate?.email }}
            </p>
          </div>

          <!-- Drag handle -->
          <div class="opacity-0 group-hover:opacity-30 transition-opacity flex-shrink-0 mt-1 cursor-grab active:cursor-grabbing">
            <svg class="w-3.5 h-3.5" style="color:var(--text-2);" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
              <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
              <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
            </svg>
          </div>
        </div>

        <!-- Divider -->
        <div class="my-2.5" style="height:1px;background:var(--border);" />

        <!-- Bottom row: source · date · score -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <span
              v-if="application.source"
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium truncate max-w-[80px]"
              style="background:rgba(255,255,255,0.08);color:var(--text-2);"
            >
              {{ application.source }}
            </span>
            <span class="text-[10px] flex items-center gap-0.5 flex-shrink-0" style="color:var(--text-3);">
              <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {{ formatDate(application.created_at) }}
            </span>
          </div>

          <!-- Stars -->
          <div v-if="avgScore(application) !== null" class="flex items-center gap-0.5 flex-shrink-0">
            <svg
              v-for="i in 5"
              :key="i"
              class="w-2.5 h-2.5"
              viewBox="0 0 24 24"
              :fill="i <= (avgScore(application) ?? 0) ? '#f59e0b' : 'none'"
              :stroke="i <= (avgScore(application) ?? 0) ? '#f59e0b' : 'rgba(255,255,255,0.15)'"
              stroke-width="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>

          <div
            v-else-if="(application.evaluations?.length ?? 0) > 0"
            class="text-[10px] flex items-center gap-0.5 flex-shrink-0"
            style="color:var(--text-3);"
          >
            <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {{ application.evaluations?.length }}
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.card-kanban:hover {
  border-color: rgba(255,255,255,0.12) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.35);
}
</style>
