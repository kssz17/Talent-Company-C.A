<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

const mode = ref<'login' | 'register'>('login')

// ── Login ──────────────────────────────────────────────────────
const loginEmail    = ref('slainer17@gmail.com')
const loginPassword = ref('123456')

async function submitLogin() {
  const ok = await auth.login(loginEmail.value, loginPassword.value)
  if (!ok) return
  router.push(auth.isCandidate ? { name: 'portal-jobs' } : { name: 'dashboard' })
}

// ── Registro ───────────────────────────────────────────────────
const regName     = ref('')
const regEmail    = ref('')
const regPassword = ref('')
const regRole     = ref<'recruiter' | 'candidate'>('candidate')
const regDone     = ref(false)

async function submitRegister() {
  const ok = await auth.register(regName.value, regEmail.value, regPassword.value, regRole.value)
  if (!ok) return
  if (auth.isAuthenticated) {
    router.push(auth.isCandidate ? { name: 'portal-jobs' } : { name: 'dashboard' })
  } else {
    regDone.value = true
  }
}

function switchMode(m: 'login' | 'register') {
  mode.value    = m
  auth.error    = null as unknown as never
  regDone.value = false
}
</script>

<template>
  <div class="min-h-screen flex">

    <!-- ═══════════════════════════════════════════════════════
         PANEL IZQUIERDO — formulario
    ════════════════════════════════════════════════════════ -->
    <div
      class="w-full lg:w-5/12 flex flex-col justify-between px-10 py-10 min-h-screen"
      style="background:#0c0d12;"
    >

      <!-- Logo -->
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:#2563eb;">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <span class="text-white font-bold text-sm tracking-wide">Talent Company C.A</span>
      </div>

      <!-- Formulario central -->
      <Transition name="slide" mode="out-in">

        <!-- ── LOGIN ─────────────────────────────────────────── -->
        <div v-if="mode === 'login'" key="login" class="flex flex-col gap-8 w-full max-w-sm">
          <div>
            <h1 class="font-bold text-white mb-1.5" style="font-size:2.6rem;line-height:1.1;letter-spacing:-0.02em;">
              Iniciar Sesión
            </h1>
            <p class="text-white/35 text-sm">Bienvenido</p>
          </div>

          <form class="flex flex-col gap-5" @submit.prevent="submitLogin">
            <!-- Email -->
            <div class="flex flex-col gap-2">
              <label class="text-white/45 text-xs font-semibold uppercase tracking-widest">
                Correo electrónico
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  v-model="loginEmail"
                  type="email"
                  required
                  autocomplete="email"
                  placeholder="Introduce tu email"
                  class="input-dark w-full pl-11 pr-4 py-3.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-2">
              <label class="text-white/45 text-xs font-semibold uppercase tracking-widest">
                Contraseña
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  v-model="loginPassword"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="Introduce tu contraseña"
                  class="input-dark w-full pl-11 pr-4 py-3.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                />
              </div>
              <button type="button" class="text-xs font-bold tracking-widest text-left transition-colors forgot-btn">
                ¿OLVIDASTE TU CONTRASEÑA?
              </button>
            </div>

            <!-- Error -->
            <p
              v-if="auth.error"
              class="text-xs text-red-400 rounded-lg px-3 py-2.5"
              style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);"
            >
              {{ auth.error }}
            </p>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="auth.loading"
              class="btn-primary-blue w-full py-3.5 rounded-lg text-sm font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {{ auth.loading ? 'Entrando…' : 'Iniciar sesión' }}
            </button>
          </form>
        </div>

        <!-- ── REGISTRO ──────────────────────────────────────── -->
        <div v-else-if="!regDone" key="register" class="flex flex-col gap-7 w-full max-w-sm">
          <div>
            <h1 class="font-bold text-white mb-1.5" style="font-size:2.6rem;line-height:1.1;letter-spacing:-0.02em;">
              Sign Up
            </h1>
            <p class="text-white/35 text-sm">Crea tu cuenta gratis</p>
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="submitRegister">
            <!-- Nombre -->
            <div class="flex flex-col gap-2">
              <label class="text-white/45 text-xs font-semibold uppercase tracking-widest">Nombre completo</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  v-model="regName"
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  class="input-dark w-full pl-11 pr-4 py-3.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-2">
              <label class="text-white/45 text-xs font-semibold uppercase tracking-widest">Correo electrónico</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  v-model="regEmail"
                  type="email"
                  required
                  placeholder="tu@email.com"
                  class="input-dark w-full pl-11 pr-4 py-3.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-2">
              <label class="text-white/45 text-xs font-semibold uppercase tracking-widest">Contraseña</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg class="w-4 h-4 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  v-model="regPassword"
                  type="password"
                  required
                  minlength="6"
                  placeholder="Mínimo 6 caracteres"
                  class="input-dark w-full pl-11 pr-4 py-3.5 rounded-lg text-sm text-white placeholder-white/20 outline-none"
                />
              </div>
            </div>

            <!-- Rol -->
            <div class="flex flex-col gap-2">
              <label class="text-white/45 text-xs font-semibold uppercase tracking-widest">Soy…</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  v-for="opt in [
                    { key: 'recruiter', label: 'Reclutador', sub: 'Ofrezco trabajo' },
                    { key: 'candidate', label: 'Candidato',  sub: 'Busco empleo'   },
                  ]"
                  :key="opt.key"
                  class="flex flex-col items-center py-3.5 px-2 rounded-lg transition-all"
                  :style="regRole === opt.key
                    ? 'background:rgba(37,99,235,0.15);border:1.5px solid rgba(37,99,235,0.7);'
                    : 'background:#1a1c26;border:1.5px solid rgba(255,255,255,0.07);'"
                  @click="regRole = opt.key as 'recruiter' | 'candidate'"
                >
                  <span class="text-white text-xs font-bold">{{ opt.label }}</span>
                  <span class="text-white/35 text-[10px] mt-0.5">{{ opt.sub }}</span>
                </button>
              </div>
            </div>

            <!-- Error -->
            <p
              v-if="auth.error"
              class="text-xs text-red-400 rounded-lg px-3 py-2.5"
              style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);"
            >
              {{ auth.error }}
            </p>

            <button
              type="submit"
              :disabled="auth.loading"
              class="btn-primary-blue w-full py-3.5 rounded-lg text-sm font-bold text-white uppercase tracking-widest transition-all disabled:opacity-50"
            >
              {{ auth.loading ? 'Creando cuenta…' : 'Crear cuenta' }}
            </button>
          </form>
        </div>

        <!-- ── CONFIRMACIÓN EMAIL ─────────────────────────────── -->
        <div v-else key="done" class="flex flex-col gap-6 w-full max-w-sm">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center" style="background:rgba(37,99,235,0.15);border:1px solid rgba(37,99,235,0.35);">
            <svg class="w-7 h-7" style="color:#2563eb;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <h1 class="font-bold text-white text-3xl mb-2" style="letter-spacing:-0.02em;">¡Revisa tu correo!</h1>
            <p class="text-white/40 text-sm leading-relaxed">
              Enviamos un enlace de activación a<br>
              <span class="text-white/75 font-medium">{{ regEmail }}</span>.<br>
              Haz clic en él para activar tu cuenta.
            </p>
          </div>
          <button
            class="text-sm font-semibold transition-colors forgot-btn"
            @click="switchMode('login')"
          >
            ← Volver al inicio de sesión
          </button>
        </div>

      </Transition>

      <!-- Footer switch -->
      <p class="text-white/30 text-sm">
        <template v-if="mode === 'login'">
          ¿No tienes cuenta?
          <button class="font-semibold link-blue transition-colors" @click="switchMode('register')">
            Regístrate gratis
          </button>
        </template>
        <template v-else-if="!regDone">
          ¿Ya tienes cuenta?
          <button class="font-semibold link-blue transition-colors" @click="switchMode('login')">
            Inicia sesión
          </button>
        </template>
      </p>

    </div>

    <!--PANEL DERECHO — foto-->
    <div class="hidden lg:flex lg:w-7/12 relative overflow-hidden flex-col justify-end">
      <img src="/login-bg.avif" alt="" class="absolute inset-0 w-full h-full object-cover" />
      <!-- Degradado oscuro izquierda para separar del panel form -->
      <div
        class="absolute inset-0"
        style="background:linear-gradient(to right, rgba(12,13,18,0.6) 0%, transparent 35%), linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%);"
      />
      <!-- Texto inferior -->
      <div class="relative z-10 px-14 pb-14">
        <p class="text-white font-semibold text-2xl leading-snug mb-3" style="letter-spacing:-0.01em;">
          El único modo de hacer un gran trabajo<br>es amar lo que haces.
        </p>
        <p class="text-white/40 text-xs uppercase tracking-[0.2em] font-medium">Talent Company C.A</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Inputs */
.input-dark {
  background: #1a1c26;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-dark:focus {
  border-color: rgba(37, 99, 235, 0.55);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

/* Botón azul */
.btn-primary-blue {
  background: #2563eb;
}
.btn-primary-blue:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn-primary-blue:active:not(:disabled) {
  background: #1e40af;
}

/* Links */
.link-blue    { color: #3b82f6; }
.link-blue:hover { color: #93c5fd; }

.forgot-btn   { color: #3b82f6; }
.forgot-btn:hover { color: #93c5fd; }

/* Transición entre paneles */
.slide-enter-active, .slide-leave-active { transition: all .22s ease; }
.slide-enter-from { opacity: 0; transform: translateY(10px); }
.slide-leave-to   { opacity: 0; transform: translateY(-10px); }
</style>
