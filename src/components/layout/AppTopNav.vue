<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const mobileOpen    = ref(false)
const userMenuOpen  = ref(false)

const navItems = computed(() => [
  { name: 'dashboard',  label: 'Panel',      icon: 'grid' },
  { name: 'jobs',       label: 'Ofertas',     icon: 'briefcase' },
  { name: 'pipeline',   label: 'Pipeline',    icon: 'kanban' },
  { name: 'candidates', label: 'Candidatos',  icon: 'users' },
  { name: 'reports',    label: 'Informes',    icon: 'bar-chart' },
  { name: 'templates',  label: 'Plantillas',  icon: 'file-text' },
  ...(auth.isAdmin ? [{ name: 'settings', label: 'Configuración', icon: 'settings' }] : []),
])

function isActive(name: string) {
  return String(route.name).startsWith(name)
}

function navigate(name: string) {
  router.push({ name })
  mobileOpen.value = false
  userMenuOpen.value = false
}

function closeMenus() {
  userMenuOpen.value = false
}
</script>

<template>
  <!-- Backdrop para cerrar menús en mobile -->
  <div
    v-if="mobileOpen || userMenuOpen"
    class="fixed inset-0 z-20"
    @click="mobileOpen = false; userMenuOpen = false"
  />

  <header class="relative z-30 bg-white border-b border-slate-200 shadow-nav">
    <div class="max-w-screen-xl mx-auto px-6">
      <div class="flex items-center h-14 gap-6">

        <!-- ── Logo ───────────────────────────────────────── -->
        <button
          class="flex items-center gap-2.5 flex-shrink-0 focus:outline-none"
          @click="navigate('dashboard')"
        >
          <div class="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center flex-shrink-0">
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-sm font-semibold text-slate-900 leading-none">Talent Company C.A</p>
            <p class="text-[10px] text-slate-400 mt-0.5 leading-none">KS System</p>
          </div>
        </button>

        <!-- Divisor -->
        <div class="hidden md:block h-6 w-px bg-slate-200" />

        <!-- ── Nav links (desktop) ────────────────────────── -->
        <nav class="hidden md:flex items-center gap-0.5 flex-1">
          <button
            v-for="item in navItems"
            :key="item.name"
            :class="[
              'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors duration-100',
              isActive(item.name)
                ? 'text-slate-900 font-semibold bg-slate-100'
                : 'text-slate-500 font-medium hover:text-slate-800 hover:bg-slate-50',
            ]"
            @click="navigate(item.name)"
          >
            <!-- Indicador activo — línea inferior discreta -->
            <span
              v-if="isActive(item.name)"
              class="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-slate-800"
            />

            <!-- Icono inline SVG -->
            <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <template v-if="item.icon === 'grid'">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </template>
              <template v-else-if="item.icon === 'briefcase'">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <path d="M2 12h20"/>
              </template>
              <template v-else-if="item.icon === 'kanban'">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M7 3v7"/><path d="M12 3v12"/><path d="M17 3v5"/>
              </template>
              <template v-else-if="item.icon === 'users'">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </template>
              <template v-else-if="item.icon === 'bar-chart'">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
                <line x1="2" y1="20" x2="22" y2="20"/>
              </template>
              <template v-else-if="item.icon === 'file-text'">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </template>
              <template v-else-if="item.icon === 'settings'">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </template>
            </svg>

            <span>{{ item.label }}</span>
          </button>
        </nav>

        <!-- ── Right side ─────────────────────────────────── -->
        <div class="flex items-center gap-2 ml-auto">

          <!-- Notificaciones -->
          <button
            class="relative p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notificaciones"
          >
            <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          <!-- Divisor -->
          <div class="h-6 w-px bg-slate-200" />

          <!-- Usuario — dropdown -->
          <div class="relative">
            <button
              class="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors focus:outline-none"
              @click.stop="userMenuOpen = !userMenuOpen"
            >
              <!-- Avatar con inicial -->
              <div class="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {{ auth.initials }}
              </div>
              <div class="hidden sm:block text-left">
                <p class="text-xs font-semibold text-slate-800 leading-none">{{ auth.displayName }}</p>
                <p class="text-[10px] text-slate-400 capitalize mt-0.5 leading-none">{{ auth.profile?.role }}</p>
              </div>
              <svg class="w-3.5 h-3.5 text-slate-400 hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <!-- Dropdown menu -->
            <Transition name="fade-down">
              <div
                v-if="userMenuOpen"
                class="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div class="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p class="text-sm font-semibold text-slate-800">{{ auth.displayName }}</p>
                  <p class="text-xs text-slate-500 mt-0.5">{{ auth.profile?.email }}</p>
                </div>
                <div class="py-1">
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                    @click="navigate('settings'); userMenuOpen = false"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Mi perfil
                  </button>
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors text-left"
                    @click="navigate('settings'); userMenuOpen = false"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Configuración
                  </button>
                </div>
                <div class="py-1 border-t border-slate-100">
                  <button
                    class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    @click="auth.logout(); userMenuOpen = false"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Hamburger mobile -->
          <button
            class="md:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
            @click.stop="mobileOpen = !mobileOpen"
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

    <!-- ── Mobile nav dropdown ─────────────────────────────── -->
    <Transition name="fade-down">
      <div
        v-if="mobileOpen"
        class="md:hidden border-t border-slate-100 bg-white"
      >
        <nav class="max-w-screen-xl mx-auto px-4 py-2 flex flex-col gap-0.5">
          <button
            v-for="item in navItems"
            :key="item.name"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
              isActive(item.name)
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:bg-slate-50',
            ]"
            @click="navigate(item.name)"
          >
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <template v-if="item.icon === 'grid'">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </template>
              <template v-else-if="item.icon === 'briefcase'">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <path d="M2 12h20"/>
              </template>
              <template v-else-if="item.icon === 'kanban'">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M7 3v7"/><path d="M12 3v12"/><path d="M17 3v5"/>
              </template>
              <template v-else-if="item.icon === 'users'">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </template>
              <template v-else-if="item.icon === 'bar-chart'">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
                <line x1="2" y1="20" x2="22" y2="20"/>
              </template>
              <template v-else-if="item.icon === 'file-text'">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
              </template>
              <template v-else-if="item.icon === 'settings'">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/>
              </template>
            </svg>
            {{ item.label }}
          </button>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.fade-down-enter-active { transition: all .15s ease-out; }
.fade-down-leave-active { transition: all .1s ease-in; }
.fade-down-enter-from, .fade-down-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
