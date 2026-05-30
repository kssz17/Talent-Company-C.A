<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const email    = ref('slainer17@gmail.com')
const password = ref('123456')

type RoleKey = 'admin' | 'recruiter' | 'candidate'
const selectedRole = ref<RoleKey>('recruiter')

const roles: { key: RoleKey; label: string; sub: string }[] = [
  { key: 'admin',     label: 'Admin',      sub: 'Panel completo' },
  { key: 'recruiter', label: 'Reclutador', sub: 'Gestión de talento' },
  { key: 'candidate', label: 'Candidato',  sub: 'Busco empleo' },
]

async function submit() {
  const ok = await auth.login(email.value, password.value)
  if (!ok) return
  // Redirect según el rol real del perfil, no lo que marcó en la UI
  if (auth.profile?.role === 'candidate') {
    router.push({ name: 'portal-jobs' })
  } else {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center overflow-hidden">

    <!-- Foto de fondo difuminada -->
    <div class="absolute inset-0">
      <img src="/login-bg.avif" alt="" class="w-full h-full object-cover scale-110" style="filter: blur(18px);" />
      <div class="absolute inset-0 bg-black/10" />
    </div>

    <!-- Card -->
    <div class="relative z-10 w-full mx-4" style="max-width: 490px;">
      <div
        class="rounded-xl px-10 py-12"
        style="
          background: rgba(160,170,180,0.38);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
        "
      >
        <!-- Logo + nombre -->
        <div class="flex flex-col items-center mb-8">
          <div
            class="w-14 h-14 flex items-center justify-center mb-3"
            style="background: rgba(255,255,255,0.30); border-radius: 50%; border: 2px solid rgba(255,255,255,0.45);"
          >
            <svg class="w-7 h-7 text-white drop-shadow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 class="text-white font-bold text-lg tracking-wide drop-shadow-sm">Talent Company C.A</h1>
        </div>

        <!-- Selector de rol -->
        <div class="grid grid-cols-3 gap-2 mb-7">
          <button
            v-for="r in roles"
            :key="r.key"
            class="flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all text-center"
            :style="selectedRole === r.key
              ? 'background: rgba(255,255,255,0.35); border: 1.5px solid rgba(255,255,255,0.6);'
              : 'background: rgba(255,255,255,0.10); border: 1.5px solid rgba(255,255,255,0.15);'"
            @click="selectedRole = r.key"
          >
            <!-- Icono por rol -->
            <svg class="w-5 h-5 text-white opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <template v-if="r.key === 'admin'">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </template>
              <template v-else-if="r.key === 'recruiter'">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
              </template>
              <template v-else>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </template>
            </svg>
            <span class="text-white text-xs font-semibold leading-tight">{{ r.label }}</span>
            <span class="text-white/60 text-[10px] leading-tight">{{ r.sub }}</span>
          </button>
        </div>

        <!-- Formulario -->
        <form class="space-y-3" @submit.prevent="submit">
          <input
            v-model="email"
            type="email"
            placeholder="Correo electrónico"
            required
            autocomplete="email"
            style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.40);border-radius:6px;color:white;padding:12px 16px;width:100%;font-size:14px;outline:none;"
            class="placeholder-white/55"
          />
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            required
            autocomplete="current-password"
            style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.40);border-radius:6px;color:white;padding:12px 16px;width:100%;font-size:14px;outline:none;"
            class="placeholder-white/55"
          />

          <label class="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
            <input type="checkbox" class="w-4 h-4 rounded cursor-pointer" style="accent-color:#38bdf8;" />
            <span class="text-sm text-white/75">Recordarme</span>
          </label>

          <p
            v-if="auth.error"
            class="text-sm text-red-100 rounded-md px-3 py-2"
            style="background:rgba(220,38,38,0.30);border:1px solid rgba(255,150,150,0.25);"
          >
            {{ auth.error }}
          </p>

          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full font-bold uppercase tracking-widest text-sm text-white disabled:opacity-60"
            style="background:#4db8e8;border-radius:6px;padding:13px;margin-top:4px;border:none;cursor:pointer;transition:background .2s;"
            onmouseover="this.style.background='#38a8d8'"
            onmouseout="this.style.background='#4db8e8'"
          >
            {{ auth.loading ? '…' : 'ENTRAR' }}
          </button>
        </form>

      </div>
    </div>

  </div>
</template>
