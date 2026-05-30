<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

// ── Modo: login o registro ──────────────────────────────
const mode = ref<'login' | 'register'>('login')

// ── Login ───────────────────────────────────────────────
const loginEmail    = ref('slainer17@gmail.com')
const loginPassword = ref('123456')

async function submitLogin() {
  const ok = await auth.login(loginEmail.value, loginPassword.value)
  if (!ok) return
  router.push(auth.isCandidate ? { name: 'portal-jobs' } : { name: 'dashboard' })
}

// ── Registro ────────────────────────────────────────────
const regName     = ref('')
const regEmail    = ref('')
const regPassword = ref('')
const regRole     = ref<'recruiter' | 'candidate'>('candidate')
const regDone     = ref(false)

async function submitRegister() {
  const ok = await auth.register(regName.value, regEmail.value, regPassword.value, regRole.value)
  if (!ok) return
  // Si Supabase requiere confirmación de email no habrá sesión aún
  if (auth.isAuthenticated) {
    router.push(auth.isCandidate ? { name: 'portal-jobs' } : { name: 'dashboard' })
  } else {
    regDone.value = true
  }
}

function switchMode(m: 'login' | 'register') {
  mode.value  = m
  auth.error  = null as unknown as never
  regDone.value = false
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center overflow-hidden py-8">

    <!-- Fondo difuminado -->
    <div class="absolute inset-0">
      <img src="/login-bg.avif" alt="" class="w-full h-full object-cover scale-110" style="filter:blur(18px);" />
      <div class="absolute inset-0 bg-black/15" />
    </div>

    <!-- Card -->
    <div class="relative z-10 w-full mx-4" style="max-width:460px;">
      <div
        class="rounded-2xl overflow-hidden"
        style="background:rgba(20,25,35,0.72);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.10);box-shadow:0 24px 60px rgba(0,0,0,0.40);"
      >
        <!-- Logo -->
        <div class="flex flex-col items-center pt-9 pb-6 px-8">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);">
            <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h1 class="text-white font-bold text-base tracking-wide">Talent Company C.A</h1>
          <p class="text-white/40 text-xs mt-0.5">
            {{ mode === 'login' ? 'Accede a tu cuenta' : 'Crea una cuenta nueva' }}
          </p>
        </div>

        <!-- Toggle login / registro -->
        <div class="mx-8 mb-6 grid grid-cols-2 gap-1 p-1 rounded-xl" style="background:rgba(255,255,255,0.06);">
          <button
            :class="['py-2 rounded-lg text-sm font-semibold transition-all', mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white/80']"
            @click="switchMode('login')"
          >Iniciar sesión</button>
          <button
            :class="['py-2 rounded-lg text-sm font-semibold transition-all', mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/50 hover:text-white/80']"
            @click="switchMode('register')"
          >Crear cuenta</button>
        </div>

        <!-- ── FORMULARIO LOGIN ─────────────────────────────── -->
        <Transition name="slide" mode="out-in">
          <form v-if="mode === 'login'" key="login" class="px-8 pb-9 space-y-3" @submit.prevent="submitLogin">
            <div>
              <label class="text-xs font-medium text-white/50 block mb-1.5">Correo electrónico</label>
              <input
                v-model="loginEmail"
                type="email"
                required
                autocomplete="email"
                placeholder="tu@email.com"
                class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-white/50 block mb-1.5">Contraseña</label>
              <input
                v-model="loginPassword"
                type="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all"
                style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);"
              />
            </div>

            <p v-if="auth.error" class="text-xs text-red-300 rounded-lg px-3 py-2" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.25);">
              {{ auth.error }}
            </p>

            <button
              type="submit"
              :disabled="auth.loading"
              class="w-full py-3 rounded-xl text-sm font-bold text-slate-900 transition-opacity disabled:opacity-50 mt-1"
              style="background:linear-gradient(135deg,#e2e8f0,#cbd5e1);"
            >
              {{ auth.loading ? 'Entrando…' : 'Iniciar sesión' }}
            </button>

            <p class="text-center text-xs text-white/35 pt-1">
              ¿No tienes cuenta?
              <button type="button" class="text-white/70 underline hover:text-white" @click="switchMode('register')">Regístrate gratis</button>
            </p>
          </form>

          <!-- ── FORMULARIO REGISTRO ───────────────────────────── -->
          <form v-else-if="!regDone" key="register" class="px-8 pb-9 space-y-3" @submit.prevent="submitRegister">
            <div>
              <label class="text-xs font-medium text-white/50 block mb-1.5">Nombre completo</label>
              <input
                v-model="regName"
                type="text"
                required
                placeholder="Tu nombre"
                class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none"
                style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-white/50 block mb-1.5">Correo electrónico</label>
              <input
                v-model="regEmail"
                type="email"
                required
                placeholder="tu@email.com"
                class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none"
                style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);"
              />
            </div>
            <div>
              <label class="text-xs font-medium text-white/50 block mb-1.5">Contraseña</label>
              <input
                v-model="regPassword"
                type="password"
                required
                minlength="6"
                placeholder="Mínimo 6 caracteres"
                class="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none"
                style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);"
              />
            </div>

            <!-- Selector de rol — solo 2 opciones, sin admin -->
            <div>
              <label class="text-xs font-medium text-white/50 block mb-2">Soy…</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  v-for="opt in [
                    { key: 'recruiter', label: 'Reclutador',  sub: 'Ofrezco trabajo' },
                    { key: 'candidate', label: 'Candidato',   sub: 'Busco empleo' },
                  ]"
                  :key="opt.key"
                  class="flex flex-col items-center gap-0.5 py-3.5 px-2 rounded-xl transition-all"
                  :style="regRole === opt.key
                    ? 'background:rgba(255,255,255,0.18);border:1.5px solid rgba(255,255,255,0.45);'
                    : 'background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.08);'"
                  @click="regRole = opt.key as 'recruiter' | 'candidate'"
                >
                  <svg class="w-5 h-5 text-white mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <template v-if="opt.key === 'recruiter'">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    </template>
                    <template v-else>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </template>
                  </svg>
                  <span class="text-white text-xs font-semibold">{{ opt.label }}</span>
                  <span class="text-white/45 text-[10px]">{{ opt.sub }}</span>
                </button>
              </div>
            </div>

            <p v-if="auth.error" class="text-xs text-red-300 rounded-lg px-3 py-2" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.25);">
              {{ auth.error }}
            </p>

            <button
              type="submit"
              :disabled="auth.loading"
              class="w-full py-3 rounded-xl text-sm font-bold text-slate-900 transition-opacity disabled:opacity-50 mt-1"
              style="background:linear-gradient(135deg,#e2e8f0,#cbd5e1);"
            >
              {{ auth.loading ? 'Creando cuenta…' : 'Crear cuenta' }}
            </button>

            <p class="text-center text-xs text-white/35 pt-1">
              ¿Ya tienes cuenta?
              <button type="button" class="text-white/70 underline hover:text-white" @click="switchMode('login')">Inicia sesión</button>
            </p>
          </form>

          <!-- ── CONFIRMACIÓN EMAIL ─────────────────────────────── -->
          <div v-else key="done" class="px-8 pb-9 text-center">
            <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style="background:rgba(255,255,255,0.10);">
              <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <p class="text-white font-semibold text-base">¡Revisa tu correo!</p>
            <p class="text-white/50 text-sm mt-2 leading-relaxed">
              Te hemos enviado un enlace de confirmación a <span class="text-white/80">{{ regEmail }}</span>.
              Haz clic en él para activar tu cuenta.
            </p>
            <button
              class="mt-5 text-sm text-white/50 underline hover:text-white/80"
              @click="switchMode('login')"
            >
              Volver al login
            </button>
          </div>
        </Transition>
      </div>
    </div>

  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all .2s ease; }
.slide-enter-from { opacity: 0; transform: translateY(8px); }
.slide-leave-to   { opacity: 0; transform: translateY(-8px); }
</style>
