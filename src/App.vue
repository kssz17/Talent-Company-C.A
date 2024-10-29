<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'

const auth  = useAuthStore()
const jobs  = useJobsStore()

onMounted(async () => {
  // Restaurar sesión (Supabase) o iniciar modo mock
  await auth.initAuth()

  // Pre-cargar lista de ofertas si el usuario ya está autenticado
  if (auth.isAuthenticated) {
    await jobs.fetchJobs()
  }
})
</script>

<template>
  <RouterView />
</template>
