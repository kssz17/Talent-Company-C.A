import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id:       string
  type:     ToastType
  title:    string
  message?: string
  duration: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function add(toast: Omit<Toast, 'id' | 'duration'> & { duration?: number }): string {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const t: Toast = { ...toast, id, duration: toast.duration ?? 3500 }
    toasts.value.push(t)
    setTimeout(() => remove(id), t.duration)
    return id
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  // ── Convenience helpers ───────────────────────────────────
  const success = (title: string, message?: string) =>
    add({ type: 'success', title, message })

  const error = (title: string, message?: string) =>
    add({ type: 'error', title, message, duration: 5000 })

  const info = (title: string, message?: string) =>
    add({ type: 'info', title, message })

  const warning = (title: string, message?: string) =>
    add({ type: 'warning', title, message })

  return { toasts, add, remove, success, error, info, warning }
})
