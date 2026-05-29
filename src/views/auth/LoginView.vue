<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const email    = ref('slainer17@gmail.com')
const password = ref('123456')

async function submit() {
  const ok = await auth.login(email.value, password.value)
  if (ok) router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center overflow-hidden">

    <!-- ── Fondo con efecto bokeh/blur ────────────────────── -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-400 via-blue-200 to-slate-300" />

    <!-- Manchas de color que crean el efecto de foto desenfocada -->
    <div class="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-400/50 blur-[100px]" />
    <div class="absolute top-1/3 -right-24 w-[400px] h-[400px] rounded-full bg-slate-500/30 blur-[120px]" />
    <div class="absolute -bottom-24 left-1/4 w-[450px] h-[450px] rounded-full bg-yellow-200/40 blur-[100px]" />
    <div class="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-cyan-300/30 blur-[80px]" />
    <div class="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-green-300/25 blur-[110px]" />

    <!-- ── Card con cristal esmerilado ────────────────────── -->
    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl px-10 py-12 shadow-2xl">

        <!-- Logo + nombre -->
        <div class="flex flex-col items-center mb-10">
          <div class="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-4 shadow-inner">
            <svg class="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 class="text-white text-xl font-bold tracking-wide drop-shadow">Talent Company C.A</h1>
        </div>

        <!-- Formulario -->
        <form class="space-y-4" @submit.prevent="submit">
          <!-- Email -->
          <input
            v-model="email"
            type="email"
            placeholder="Username or email"
            required
            autocomplete="email"
            class="w-full bg-white/15 border border-white/25 rounded-lg px-4 py-3 text-white placeholder-white/55 text-sm focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all"
          />

          <!-- Password -->
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            autocomplete="current-password"
            class="w-full bg-white/15 border border-white/25 rounded-lg px-4 py-3 text-white placeholder-white/55 text-sm focus:outline-none focus:border-white/60 focus:bg-white/20 transition-all"
          />

          <!-- Remember me -->
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-white/40 bg-white/20 text-sky-400 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span class="text-sm text-white/75">Remember me</span>
          </label>

          <!-- Error -->
          <p v-if="auth.error" class="text-sm text-red-200 bg-red-500/20 border border-red-300/20 rounded-lg px-3 py-2">
            {{ auth.error }}
          </p>

          <!-- Botón login -->
          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full bg-sky-400 hover:bg-sky-500 disabled:opacity-60 text-white font-bold py-3 rounded-lg uppercase tracking-[0.2em] text-sm transition-colors shadow-lg mt-2"
          >
            {{ auth.loading ? '...' : 'LOGIN' }}
          </button>
        </form>

      </div>
    </div>
  </div>
</template>
