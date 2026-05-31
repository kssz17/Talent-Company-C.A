<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const userMenuOpen  = ref(false)
const mobileOpen    = ref(false)

// ── Nav ──────────────────────────────────────────────────────
const navMain = computed(() => [
  { name: 'dashboard',  label: 'Panel',      icon: 'grid' },
  { name: 'jobs',       label: 'Ofertas',     icon: 'briefcase' },
  { name: 'pipeline',   label: 'Pipeline',    icon: 'layers' },
  { name: 'candidates', label: 'Candidatos',  icon: 'users' },
  { name: 'reports',    label: 'Informes',    icon: 'bar-chart' },
])

const navSecondary = computed(() => [
  { name: 'templates', label: 'Plantillas',    icon: 'file-text' },
  ...(auth.isAdmin ? [{ name: 'settings', label: 'Configuración', icon: 'settings' }] : []),
])

function isActive(name: string) {
  return String(route.name).startsWith(name)
}

function navigate(name: string) {
  router.push({ name })
  userMenuOpen.value = false
  mobileOpen.value   = false
}

async function handleLogout() {
  userMenuOpen.value = false
  await auth.logout()
  router.push({ name: 'login' })
}

// ── Role badge ───────────────────────────────────────────────
const roleBadge = computed(() => {
  const map: Record<string, string> = {
    admin:     '#5E6AD2',
    recruiter: '#4CB782',
    manager:   '#F5A623',
    candidate: '#64748b',
  }
  return map[auth.profile?.role ?? 'recruiter'] ?? '#64748b'
})
</script>

<template>
  <!-- ═══════════════════════════════════════════════════════
       MOBILE — overlay + hamburger
  ════════════════════════════════════════════════════════ -->
  <div
    v-if="mobileOpen"
    class="fixed inset-0 z-40 bg-black/60 lg:hidden"
    @click="mobileOpen = false"
  />

  <!-- Mobile toggle button (visible < lg) -->
  <button
    class="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-lg"
    style="background:var(--surface);border:1px solid var(--border);"
    @click="mobileOpen = !mobileOpen"
  >
    <svg class="w-4 h-4" style="color:var(--text-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  </button>

  <!-- ═══════════════════════════════════════════════════════
       SIDEBAR
  ════════════════════════════════════════════════════════ -->
  <aside
    :class="[
      'flex flex-col h-screen flex-shrink-0 transition-transform duration-200 z-40',
      'fixed lg:relative',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
    style="
      width: 220px;
      background: var(--surface);
      border-right: 1px solid var(--border);
    "
  >

    <!-- ── Workspace header ───────────────────────────────── -->
    <div
      class="flex items-center gap-2.5 px-4 h-12 flex-shrink-0 cursor-pointer group"
      style="border-bottom:1px solid var(--border);"
      @click="navigate('dashboard')"
    >
      <div
        class="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
        style="background:var(--accent);"
      >
        <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <span
        class="text-sm font-semibold truncate group-hover:opacity-80 transition-opacity"
        style="color:var(--text-1);"
      >
        Talent Company C.A
      </span>
      <svg
        class="w-3 h-3 ml-auto flex-shrink-0 opacity-30"
        style="color:var(--text-1);"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>

    <!-- ── Nav principal ──────────────────────────────────── -->
    <nav class="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">

      <!-- Main items -->
      <button
        v-for="item in navMain"
        :key="item.name"
        class="nav-item w-full"
        :class="{ 'nav-item--active': isActive(item.name) }"
        @click="navigate(item.name)"
      >
        <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <template v-if="item.icon === 'grid'">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
          </template>
          <template v-else-if="item.icon === 'briefcase'">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
          </template>
          <template v-else-if="item.icon === 'layers'">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </template>
          <template v-else-if="item.icon === 'users'">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </template>
          <template v-else-if="item.icon === 'bar-chart'">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
            <line x1="2" y1="20" x2="22" y2="20"/>
          </template>
        </svg>
        <span>{{ item.label }}</span>
      </button>

      <!-- Separador -->
      <div class="my-2" style="height:1px;background:var(--border);margin:8px 4px;"/>

      <!-- Secondary items -->
      <button
        v-for="item in navSecondary"
        :key="item.name"
        class="nav-item w-full"
        :class="{ 'nav-item--active': isActive(item.name) }"
        @click="navigate(item.name)"
      >
        <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <template v-if="item.icon === 'file-text'">
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

    <!-- ── User section ───────────────────────────────────── -->
    <div style="border-top:1px solid var(--border);" class="flex-shrink-0">

      <!-- User button -->
      <div class="relative">
        <button
          class="w-full flex items-center gap-2.5 px-4 py-3 transition-colors"
          style="color:var(--text-1);"
          @click.stop="userMenuOpen = !userMenuOpen"
        >
          <!-- Avatar -->
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            :style="{ background: roleBadge }"
          >
            {{ auth.initials }}
          </div>
          <div class="flex-1 text-left min-w-0">
            <p class="text-xs font-semibold truncate" style="color:var(--text-1);">{{ auth.displayName }}</p>
            <p class="text-[10px] capitalize truncate" style="color:var(--text-3);">{{ auth.profile?.role }}</p>
          </div>
          <svg class="w-3.5 h-3.5 flex-shrink-0" style="color:var(--text-3);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>

        <!-- User menu backdrop -->
        <div
          v-if="userMenuOpen"
          class="fixed inset-0 z-40"
          @click="userMenuOpen = false"
        />

        <!-- User menu popup -->
        <Transition name="fade-up">
          <div
            v-if="userMenuOpen"
            class="absolute bottom-full left-3 right-3 mb-1 rounded-xl overflow-hidden z-50"
            style="background:var(--surface-3);border:1px solid rgba(255,255,255,0.12);box-shadow:0 8px 32px rgba(0,0,0,0.5);"
          >
            <!-- User info header -->
            <div class="px-3.5 py-3" style="border-bottom:1px solid var(--border);">
              <p class="text-xs font-semibold" style="color:var(--text-1);">{{ auth.displayName }}</p>
              <p class="text-[11px] mt-0.5" style="color:var(--text-3);">{{ auth.profile?.email }}</p>
            </div>
            <!-- Menu items -->
            <div class="py-1">
              <button
                class="menu-item w-full"
                @click="navigate('settings'); userMenuOpen = false"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Mi perfil
              </button>
            </div>
            <div class="py-1" style="border-top:1px solid var(--border);">
              <button
                class="menu-item menu-item--danger w-full"
                @click="handleLogout"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    </div>
  </aside>
</template>

<style scoped>
/* ── Nav items ────────────────────────────────────────────── */
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-2);
  transition: background 0.1s, color 0.1s;
  text-align: left;
  position: relative;
  border: none;
  background: transparent;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--text-1);
}

.nav-item--active {
  background: rgba(255,255,255,0.07);
  color: var(--text-1);
  font-weight: 600;
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 2px;
  border-radius: 9999px;
  background: var(--accent);
}

/* ── Menu items (user dropdown) ───────────────────────────── */
.menu-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.8125rem;
  color: var(--text-1);
  transition: background 0.1s;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
}
.menu-item:hover          { background: rgba(255,255,255,0.06); }
.menu-item--danger        { color: #f87171; }
.menu-item--danger:hover  { background: rgba(239,68,68,0.1); }

/* ── Transitions ──────────────────────────────────────────── */
.fade-up-enter-active  { transition: all .15s ease-out; }
.fade-up-leave-active  { transition: all .1s ease-in; }
.fade-up-enter-from, .fade-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
