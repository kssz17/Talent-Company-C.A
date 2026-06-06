import { ref } from 'vue'

// Singleton ref shared between CommandPalette and any trigger (e.g. AppTopNav search button)
const isOpen = ref(false)

export function usePalette() {
  return {
    isOpen,
    open:   () => { isOpen.value = true },
    close:  () => { isOpen.value = false },
    toggle: () => { isOpen.value = !isOpen.value },
  }
}
