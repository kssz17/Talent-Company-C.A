<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

const auth = useAuthStore()
const saving = ref(false)
const name  = ref(auth.profile?.full_name ?? '')
const email = ref(auth.profile?.email ?? '')
const saved = ref(false)

async function saveProfile() {
  saving.value = true
  await new Promise(r => setTimeout(r, 400))
  if (auth.profile) {
    auth.profile.full_name = name.value
  }
  saving.value = false
  saved.value  = true
  setTimeout(() => (saved.value = false), 2000)
}

// Dev role switcher
function switchRole(role: UserRole) {
  auth.devLogin(role)
  name.value  = auth.profile?.full_name ?? ''
  email.value = auth.profile?.email ?? ''
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Profile -->
    <div class="card">
      <div class="card-header">
        <h3 class="text-sm font-semibold">Perfil de usuario</h3>
      </div>
      <div class="card-body space-y-4">
        <div class="flex items-center gap-4 mb-2">
          <div class="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-xl font-bold text-white">
            {{ auth.initials }}
          </div>
          <div>
            <p class="font-semibold text-slate-800">{{ auth.displayName }}</p>
            <span class="badge badge-blue capitalize">{{ auth.profile?.role }}</span>
          </div>
        </div>

        <div>
          <label class="form-label">Nombre completo</label>
          <input v-model="name" type="text" class="form-input" />
        </div>
        <div>
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-input" disabled />
          <p class="form-hint">El email no se puede cambiar desde aquí.</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn-primary" :disabled="saving" @click="saveProfile">
            {{ saving ? 'Guardando...' : 'Guardar cambios' }}
          </button>
          <Transition name="fade">
            <span v-if="saved" class="text-sm text-green-600 font-medium">✓ Guardado</span>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Dev tools -->
    <div class="card border-amber-200 bg-amber-50">
      <div class="card-header border-amber-200">
        <h3 class="text-sm font-semibold text-amber-800">Herramientas de desarrollo</h3>
        <p class="text-xs text-amber-600 mt-0.5">Solo visible en modo desarrollo</p>
      </div>
      <div class="card-body space-y-3">
        <p class="text-sm text-amber-700">Cambiar rol activo para probar permisos:</p>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="role in ['admin', 'recruiter', 'manager'] as UserRole[]"
            :key="role"
            :class="['btn btn-sm', auth.profile?.role === role ? 'btn-primary' : 'btn-secondary']"
            @click="switchRole(role)"
          >
            {{ role }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
