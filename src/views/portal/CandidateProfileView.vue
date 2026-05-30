<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth    = useAuthStore()
const editing = ref(false)
const saving  = ref(false)
const saved   = ref(false)

const name     = ref(auth.profile?.full_name ?? '')
const phone    = ref('')
const location = ref('')
const about    = ref('')

async function saveProfile() {
  saving.value = true
  await new Promise(r => setTimeout(r, 400))
  if (auth.profile) auth.profile.full_name = name.value
  saving.value  = false
  saved.value   = true
  editing.value = false
  setTimeout(() => (saved.value = false), 2500)
}
</script>

<template>
  <div class="max-w-2xl space-y-5">

    <!-- Tarjeta de perfil -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div class="h-28 bg-gradient-to-br from-slate-700 to-slate-900 relative">
        <div class="absolute inset-0 opacity-10"
          style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 24px 24px;" />
      </div>
      <div class="px-6 pb-6">
        <div class="flex items-end justify-between -mt-8 mb-4">
          <div class="w-16 h-16 rounded-full bg-slate-700 border-4 border-white shadow-md flex items-center justify-center text-xl font-bold text-white">
            {{ auth.initials }}
          </div>
          <div class="flex items-center gap-2">
            <Transition name="fade">
              <span v-if="saved" class="text-sm text-green-600 font-medium">✓ Guardado</span>
            </Transition>
            <button v-if="!editing" class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors" @click="editing = true">
              Editar
            </button>
            <template v-else>
              <button class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50" @click="editing = false">Cancelar</button>
              <button class="text-sm bg-slate-800 text-white rounded-lg px-3 py-1.5 hover:bg-slate-900" :disabled="saving" @click="saveProfile">
                {{ saving ? 'Guardando…' : 'Guardar' }}
              </button>
            </template>
          </div>
        </div>

        <div v-if="!editing">
          <h1 class="text-lg font-bold text-slate-900">{{ auth.displayName }}</h1>
          <p class="text-sm text-slate-500">{{ auth.profile?.email }}</p>
          <p v-if="location" class="text-sm text-slate-500 mt-1">📍 {{ location }}</p>
          <p v-if="about" class="text-sm text-slate-600 mt-3 leading-relaxed">{{ about }}</p>
        </div>

        <div v-else class="space-y-3 mt-1">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-medium text-slate-600 block mb-1">Nombre</label>
              <input v-model="name" type="text" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400" />
            </div>
            <div>
              <label class="text-xs font-medium text-slate-600 block mb-1">Teléfono</label>
              <input v-model="phone" type="tel" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400" placeholder="+34 600 000 000" />
            </div>
          </div>
          <div>
            <label class="text-xs font-medium text-slate-600 block mb-1">Ubicación</label>
            <input v-model="location" type="text" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400" placeholder="Madrid, España" />
          </div>
          <div>
            <label class="text-xs font-medium text-slate-600 block mb-1">Sobre mí</label>
            <textarea v-model="about" rows="3" class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400 resize-none" placeholder="Cuéntanos sobre tu experiencia…" />
          </div>
        </div>
      </div>
    </div>

    <!-- Info de contacto -->
    <div class="bg-white border border-slate-200 rounded-xl p-5">
      <h2 class="text-sm font-semibold text-slate-800 mb-3">Información de contacto</h2>
      <div class="space-y-2.5">
        <div class="flex items-center gap-3 text-sm">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <span class="text-slate-700">{{ auth.profile?.email }}</span>
        </div>
        <div v-if="phone" class="flex items-center gap-3 text-sm">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span class="text-slate-700">{{ phone }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
