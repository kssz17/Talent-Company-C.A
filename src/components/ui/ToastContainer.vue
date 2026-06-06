<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const icons: Record<string, string> = {
  success: '<polyline points="20 6 9 17 4 12"/>',
  error:   '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
}

const colors: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  success: { bg: 'rgba(76,183,130,0.12)',  border: 'rgba(76,183,130,0.3)',  icon: '#4CB782', text: 'var(--text-1)' },
  error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   icon: '#f87171', text: 'var(--text-1)' },
  info:    { bg: 'rgba(94,106,210,0.12)',  border: 'rgba(94,106,210,0.3)',  icon: 'var(--accent)', text: 'var(--text-1)' },
  warning: { bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.3)', icon: '#F5A623', text: 'var(--text-1)' },
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="t in toast.toasts"
          :key="t.id"
          class="toast"
          :style="{
            background: colors[t.type].bg,
            border: `1px solid ${colors[t.type].border}`,
          }"
          @click="toast.remove(t.id)"
        >
          <!-- Icon -->
          <div
            class="toast-icon"
            :style="{ background: colors[t.type].border }"
          >
            <svg class="w-3.5 h-3.5" :style="{ color: colors[t.type].icon }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" v-html="icons[t.type]" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold leading-snug" style="color:var(--text-1);">{{ t.title }}</p>
            <p v-if="t.message" class="text-xs mt-0.5 leading-snug" style="color:var(--text-2);">{{ t.message }}</p>
          </div>

          <!-- Close -->
          <button class="toast-close" @click.stop="toast.remove(t.id)" aria-label="Cerrar">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
  max-width: 360px;
  width: calc(100vw - 2rem);
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 0.75rem;
  pointer-events: all;
  cursor: pointer;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2);
  transition: box-shadow 0.15s;
}
.toast:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.5); }

.toast-icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.85;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-3);
  flex-shrink: 0;
  padding: 0.125rem;
  border-radius: 0.25rem;
  transition: color 0.1s;
  display: flex;
  align-items: center;
}
.toast-close:hover { color: var(--text-1); }

/* ── Transitions ─────────────────────────────────────────── */
.toast-enter-active { transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.18s ease-in; }
.toast-enter-from   { opacity: 0; transform: translateX(100%) scale(0.9); }
.toast-leave-to     { opacity: 0; transform: translateX(100%); }
.toast-move         { transition: transform 0.2s ease; }
</style>
