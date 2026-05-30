<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const mobileOpen = ref(false)

const navItems = [
  { name: 'portal-jobs',         label: 'Ofertas de trabajo' },
  { name: 'portal-applications', label: 'Mis solicitudes' },
  { name: 'portal-profile',      label: 'Mi perfil' },
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

    <!-- ── Top nav candidato ─────────────────────────────────── -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div class="max-w-screen-lg mx-auto px-6">
        <div class="flex items-center h-14 gap-6">

          <!-- Logo -->
          <button
            class="flex items-center gap-2.5 flex-shrink-0 focus:outline-none"
            @click="router.push({ name: 'portal-jobs' })"
          >
            <div class="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-semibold text-slate-900 leading-none">Talent Company C.A</p>
              <p class="text-[10px] text-slate-400 mt-0.5 leading-none">Portal de Empleo</p>
            </div>
          </button>

          <div class="hidden md:block h-6 w-px bg-slate-200" />

          <!-- Nav links -->
          <nav class="hidden md:flex items-center gap-0.5 flex-1">
            <button
              v-for="item in navItems"
              :key="item.name"
              :class="[
                'relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-100',
                isActive(item.name)
                  ? 'text-slate-900 bg-slate-100 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50',
              ]"
              @click="router.push({ name: item.name })"
            >
              <span v-if="isActive(item.name)" class="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-slate-800" />
              {{ item.label }}
            </button>
          </nav>

          <!-- Usuario -->
          <div class="flex items-center gap-3 ml-auto">
            <div class="hidden sm:block text-right">
              <p class="text-xs font-semibold text-slate-800 leading-none">{{ auth.displayName }}</p>
              <p class="text-[10px] text-slate-400 mt-0.5">Candidato</p>
            </div>
            <div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              {{ auth.initials }}
            </div>
            <button
              class="text-xs text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
              @click="handleLogout"
            >
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
              'w-full text-left px-3 py-2.5 rounded-lg text-sm mb-0.5',
              isActive(item.name) ? 'bg-slate-100 font-semibold' : 'text-slate-600 hover:bg-slate-50',
            ]"
            @click="router.push({ name: item.name }); mobileOpen = false"
          >
            {{ item.label }}
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
