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

    <!-- ── Foto de fondo difuminada ───────────────────────── -->
    <div class="absolute inset-0">
      <img
        src="/login-bg.avif"
        alt=""
        class="w-full h-full object-cover scale-110"
        style="filter: blur(18px);"
      />
      <!-- Velo muy sutil para oscurecer ligeramente -->
      <div class="absolute inset-0 bg-black/15" />
    </div>

    <!-- ── Card ───────────────────────────────────────────── -->
    <div class="relative z-10 w-full mx-4" style="max-width: 490px;">
      <div
        class="rounded-xl px-12 py-14"
        style="
          background: rgba(160, 170, 180, 0.38);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        "
      >

        <!-- Logo + nombre de empresa -->
        <div class="flex flex-col items-center mb-10">
          <div
            class="w-16 h-16 flex items-center justify-center mb-4"
            style="
              background: rgba(255,255,255,0.30);
              border-radius: 50%;
              border: 2px solid rgba(255,255,255,0.45);
            "
          >
            <svg class="w-8 h-8 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 class="text-white font-bold text-xl tracking-wide drop-shadow-sm">
            Talent Company C.A
          </h1>
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
            style="
              background: rgba(255,255,255,0.12);
              border: 1px solid rgba(255,255,255,0.40);
              border-radius: 6px;
              color: white;
              padding: 12px 16px;
              width: 100%;
              font-size: 14px;
              outline: none;
              transition: border-color .2s, background .2s;
            "
            class="placeholder-white/55 focus:!border-white/70 focus:!bg-white/20"
          />

          <!-- Password -->
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            required
            autocomplete="current-password"
            style="
              background: rgba(255,255,255,0.12);
              border: 1px solid rgba(255,255,255,0.40);
              border-radius: 6px;
              color: white;
              padding: 12px 16px;
              width: 100%;
              font-size: 14px;
              outline: none;
              transition: border-color .2s, background .2s;
            "
            class="placeholder-white/55 focus:!border-white/70 focus:!bg-white/20"
          />

          <!-- Remember me -->
          <label class="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              class="w-4 h-4 rounded cursor-pointer"
              style="accent-color: #38bdf8;"
            />
            <span class="text-sm text-white/75">Remember me</span>
          </label>

          <!-- Error -->
          <p
            v-if="auth.error"
            class="text-sm text-red-100 rounded-md px-3 py-2"
            style="background: rgba(220,38,38,0.30); border: 1px solid rgba(255,150,150,0.25);"
          >
            {{ auth.error }}
          </p>

          <!-- Botón LOGIN -->
          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full font-bold uppercase tracking-widest text-sm text-white transition-colors disabled:opacity-60"
            style="
              background: #4db8e8;
              border-radius: 6px;
              padding: 14px;
              margin-top: 8px;
              border: none;
              cursor: pointer;
            "
            onmouseover="this.style.background='#38a8d8'"
            onmouseout="this.style.background='#4db8e8'"
          >
            {{ auth.loading ? '...' : 'LOGIN' }}
          </button>

        </form>
      </div>
    </div>

  </div>
</template>
