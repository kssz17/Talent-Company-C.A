<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const email    = ref('admin@talentflow.dev')
const password = ref('demo1234')

async function submit() {
  const ok = await auth.login(email.value, password.value)
  if (ok) router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <span class="text-white font-semibold">TalentFlow</span>
      </div>

      <div>
        <h1 class="text-4xl font-bold text-white leading-tight mb-4">
          Gestiona tu pipeline de talento
        </h1>
        <p class="text-slate-400 text-lg leading-relaxed">
          Publica ofertas, evalúa candidatos y contrata a los mejores, todo en un solo lugar.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="bg-slate-800 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-white">36</p>
          <p class="text-xs text-slate-400 mt-1">Candidaturas</p>
        </div>
        <div class="bg-slate-800 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-white">4</p>
          <p class="text-xs text-slate-400 mt-1">Ofertas activas</p>
        </div>
        <div class="bg-slate-800 rounded-xl p-4 text-center">
          <p class="text-2xl font-bold text-white">28d</p>
          <p class="text-xs text-slate-400 mt-1">Tiempo medio</p>
        </div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-sm">
        <div class="mb-8">
          <div class="flex items-center gap-2 mb-6 lg:hidden">
            <div class="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
            </div>
            <span class="font-semibold text-slate-800">TalentFlow</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-900">Bienvenido</h2>
          <p class="text-slate-500 mt-1 text-sm">Accede a tu panel de reclutamiento</p>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div>
            <label class="form-label">Email</label>
            <input v-model="email" type="email" class="form-input" required autocomplete="email" />
          </div>
          <div>
            <label class="form-label">Contraseña</label>
            <input v-model="password" type="password" class="form-input" required autocomplete="current-password" />
          </div>

          <p v-if="auth.error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {{ auth.error }}
          </p>

          <button type="submit" class="btn btn-primary w-full" :disabled="auth.loading">
            {{ auth.loading ? 'Accediendo...' : 'Iniciar sesión' }}
          </button>
        </form>

        <!-- Demo credentials hint -->
        <div class="mt-6 bg-slate-100 rounded-xl p-4 text-xs text-slate-500 space-y-1">
          <p class="font-semibold text-slate-600 mb-2">Usuarios de demo:</p>
          <p>admin@talentflow.dev</p>
          <p>recruiter@talentflow.dev</p>
          <p>manager@talentflow.dev</p>
          <p class="mt-1 text-slate-400">Contraseña: cualquier valor</p>
        </div>
      </div>
    </div>
  </div>
</template>
