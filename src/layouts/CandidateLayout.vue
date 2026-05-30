<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const mobileOpen = ref(false)

const navItems = [
  {
    name: 'portal-jobs',
    label: 'Ofertas',
    icon: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>`,
  },
  {
    name: 'portal-applications',
    label: 'Mis solicitudes',
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>`,
  },
  {
    name: 'portal-profile',
    label: 'Mi perfil',
    icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  },
]

function isActive(name: string) {
  return route.name === name
}

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">

    <!-- ── Navbar ─────────────────────────────────────────────── -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div class="max-w-screen-lg mx-auto px-6">
        <div class="flex items-center h-14 gap-6">

          <!-- Logo -->
          <button
            class="flex items-center gap-2.5 flex-shrink-0 focus:outline-none"
            @click="router.push({ name: 'portal-jobs' })"
          >
            <div class="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style="background:#2563eb;">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-bold text-slate-900 leading-none">Talent Company</p>
              <p class="text-[10px] text-slate-400 mt-0.5 leading-none">Portal de Empleo</p>
            </div>
          </button>

          <div class="hidden md:block h-5 w-px bg-slate-200" />

          <!-- Nav links -->
          <nav class="hidden md:flex items-center gap-1 flex-1">
            <button
              v-for="item in navItems"
              :key="item.name"
              :class="[
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.name)
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
              ]"
              @click="router.push({ name: item.name })"
            >
              <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="item.icon" />
              {{ item.label }}
            </button>
          </nav>

          <!-- Derecha: usuario + salir -->
          <div class="flex items-center gap-3 ml-auto">
            <div class="hidden sm:block text-right">
              <p class="text-xs font-semibold text-slate-800 leading-none">{{ auth.displayName }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">Candidato</p>
            </div>
            <!-- Avatar -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style="background:#2563eb;"
            >
              {{ auth.initials }}
            </div>
            <button
              class="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              @click="handleLogout"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Salir
            </button>

            <!-- Mobile hamburger -->
            <button
              class="md:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
              @click="mobileOpen = !mobileOpen"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile nav -->
      <Transition name="fade-down">
        <div v-if="mobileOpen" class="md:hidden border-t border-slate-100 bg-white px-4 py-2">
          <button
            v-for="item in navItems"
            :key="item.name"
            :class="[
              'w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm mb-0.5',
              isActive(item.name)
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50',
            ]"
            @click="router.push({ name: item.name }); mobileOpen = false"
          >
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="item.icon" />
            {{ item.label }}
          </button>
          <button
            class="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 mt-1"
            @click="handleLogout"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      </Transition>
    </header>

    <!-- ── Contenido ─────────────────────────────────────────── -->
    <main class="max-w-screen-lg mx-auto px-6 py-8">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.fade-down-enter-active { transition: all .15s ease-out; }
.fade-down-leave-active { transition: all .1s ease-in; }
.fade-down-enter-from, .fade-down-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
