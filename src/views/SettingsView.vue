<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

const auth    = useAuthStore()
const editing = ref(false)
const saving  = ref(false)
const saved   = ref(false)

const name     = ref(auth.profile?.full_name ?? '')
const location = ref('Madrid, España')
const about    = ref('')

const roleLabel = computed(() => {
  const map: Record<UserRole, string> = {
    admin:     'Administrador',
    recruiter: 'Reclutador',
    manager:   'Manager',
    candidate: 'Candidato',
  }
  return map[auth.profile?.role ?? 'recruiter'] ?? auth.profile?.role ?? ''
})

const roleBadgeClass = computed(() => {
  const map: Record<UserRole, string> = {
    admin:     'bg-slate-800 text-white',
    recruiter: 'bg-blue-100 text-blue-800',
    manager:   'bg-violet-100 text-violet-800',
    candidate: 'bg-emerald-100 text-emerald-800',
  }
  return map[auth.profile?.role ?? 'recruiter'] ?? 'bg-slate-100 text-slate-700'
})

async function saveProfile() {
  saving.value = true
  await auth.updateProfile({ full_name: name.value })
  saving.value  = false
  saved.value   = true
  editing.value = false
  setTimeout(() => (saved.value = false), 2500)
}

function cancelEdit() {
  name.value    = auth.profile?.full_name ?? ''
  editing.value = false
}

function switchRole(role: UserRole) {
  auth.devLogin(role)
  name.value = auth.profile?.full_name ?? ''
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-5">

    <!-- ── Tarjeta principal ────────────────────────────────── -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

      <!-- Banner con foto de fondo -->
      <div class="h-36 relative overflow-hidden">
        <img
          src="/programador1.jpg"
          alt=""
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-slate-900/30" />
      </div>

      <!-- Contenido bajo el banner -->
      <div class="px-6 pb-6">

        <!-- Fila: avatar + botón editar -->
        <div class="flex items-end justify-between -mt-10 mb-4">

          <!-- Avatar -->
          <div class="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden flex-shrink-0 bg-slate-200">
            <img
              src="/IMG_20230606_043315.jpg"
              alt="Avatar"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Botón editar / guardar -->
          <div class="flex items-center gap-2">
            <Transition name="fade">
              <span v-if="saved" class="text-sm text-green-600 font-medium flex items-center gap-1">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardado
              </span>
            </Transition>
            <template v-if="!editing">
              <button class="btn btn-secondary btn-sm" @click="editing = true">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar perfil
              </button>
            </template>
            <template v-else>
              <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancelar</button>
              <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveProfile">
                {{ saving ? 'Guardando…' : 'Guardar' }}
              </button>
            </template>
          </div>
        </div>

        <!-- Nombre, título y ubicación (modo visualización) -->
        <div v-if="!editing" class="space-y-1">
          <h1 class="text-xl font-bold text-slate-900">{{ auth.displayName }}</h1>
          <p class="text-sm text-slate-600 font-medium">
            {{ roleLabel }} · Talent Company C.A
          </p>
          <div class="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {{ location }}
          </div>
          <p v-if="about" class="text-sm text-slate-600 mt-3 leading-relaxed">{{ about }}</p>
        </div>

        <!-- Formulario inline de edición -->
        <div v-else class="space-y-4 mt-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Nombre completo</label>
              <input v-model="name" type="text" class="form-input" placeholder="Tu nombre" />
            </div>
            <div>
              <label class="form-label">Ubicación</label>
              <input v-model="location" type="text" class="form-input" placeholder="Ciudad, País" />
            </div>
          </div>
          <div>
            <label class="form-label">Sobre mí</label>
            <textarea
              v-model="about"
              rows="3"
              class="form-input resize-none"
              placeholder="Una breve descripción sobre tu experiencia y área de especialización…"
            />
          </div>
        </div>

      </div>
    </div>

    <!-- ── Información de contacto ──────────────────────────── -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div class="px-6 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">Información de contacto</h2>
      </div>
      <div class="px-6 py-4 space-y-3">

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-slate-400 leading-none mb-0.5">Email</p>
            <p class="text-sm text-slate-700 font-medium">{{ auth.profile?.email }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-slate-400 leading-none mb-1">Rol</p>
            <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full capitalize', roleBadgeClass]">
              {{ roleLabel }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <p class="text-xs text-slate-400 leading-none mb-0.5">Ubicación</p>
            <p class="text-sm text-slate-700 font-medium">{{ location }}</p>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Dev tools (solo mock) ──────────────────────────────── -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
      <div class="px-6 py-4 border-b border-amber-200 flex items-center gap-2">
        <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <div>
          <h2 class="text-sm font-semibold text-amber-800">Herramientas de desarrollo</h2>
          <p class="text-xs text-amber-600">Solo visible en modo mock</p>
        </div>
      </div>
      <div class="px-6 py-4 space-y-3">
        <p class="text-sm text-amber-700">Simular rol para probar permisos:</p>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="role in ['admin', 'recruiter', 'manager', 'candidate'] as UserRole[]"
            :key="role"
            :class="['btn btn-sm capitalize', auth.profile?.role === role ? 'btn-primary' : 'btn-secondary']"
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
.form-label { @apply text-xs font-medium text-slate-600 block mb-1.5; }
.form-input  { @apply w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
