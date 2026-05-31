<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

const auth = useAuthStore()
const uid  = computed(() => auth.profile?.id ?? 'anon')

// ── Fotos por usuario ────────────────────────────────────────
const profilePhoto = ref<string | null>(null)
const bannerPhoto  = ref<string | null>(null)

function pickPhoto(type: 'profile' | 'banner') {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target?.result as string
      if (type === 'profile') {
        profilePhoto.value = data
        localStorage.setItem(`photo_profile_${uid.value}`, data)
      } else {
        bannerPhoto.value = data
        localStorage.setItem(`photo_banner_${uid.value}`, data)
      }
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

// ── Campos del perfil ────────────────────────────────────────
const editing  = ref(false)
const saving   = ref(false)
const saved    = ref(false)

const name      = ref('')
const headline  = ref('')
const location  = ref('')
const about     = ref('')
const phone     = ref('')
const linkedin  = ref('')

function loadData() {
  const raw = localStorage.getItem(`sp_basic_${uid.value}`)
  const d   = raw ? JSON.parse(raw) : {}
  name.value     = d.name     ?? auth.profile?.full_name ?? ''
  headline.value = d.headline ?? ''
  location.value = d.location ?? ''
  about.value    = d.about    ?? ''
  phone.value    = d.phone    ?? ''
  linkedin.value = d.linkedin ?? ''
}

async function saveProfile() {
  saving.value = true
  await auth.updateProfile({ full_name: name.value })
  localStorage.setItem(`sp_basic_${uid.value}`, JSON.stringify({
    name: name.value, headline: headline.value, location: location.value,
    about: about.value, phone: phone.value, linkedin: linkedin.value,
  }))
  saving.value  = false
  saved.value   = true
  editing.value = false
  setTimeout(() => (saved.value = false), 2500)
}

function cancelEdit() {
  loadData()
  editing.value = false
}

onMounted(() => {
  profilePhoto.value = localStorage.getItem(`photo_profile_${uid.value}`)
  bannerPhoto.value  = localStorage.getItem(`photo_banner_${uid.value}`)
  loadData()
})

// ── Role helpers ─────────────────────────────────────────────
const roleLabel = computed(() => {
  const map: Record<UserRole, string> = {
    admin:     'Administrador',
    recruiter: 'Reclutador',
    manager:   'Manager',
    candidate: 'Candidato',
  }
  return map[auth.profile?.role ?? 'recruiter'] ?? ''
})

const roleBadgeStyle = computed(() => {
  const map: Record<UserRole, string> = {
    admin:     'background:rgba(94,106,210,0.2);color:#a5b4fc;',
    recruiter: 'background:rgba(59,130,246,0.15);color:#93c5fd;',
    manager:   'background:rgba(139,92,246,0.15);color:#c4b5fd;',
    candidate: 'background:rgba(76,183,130,0.15);color:#6ee7b7;',
  }
  return map[auth.profile?.role ?? 'recruiter'] ?? 'background:rgba(255,255,255,0.08);color:var(--text-2);'
})

const memberSince = computed(() => {
  const d = auth.profile?.created_at
  return d ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
})
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-5">

    <!-- ── Tarjeta principal ────────────────────────────────── -->
    <div class="card overflow-hidden">

      <!-- Banner -->
      <div
        class="h-36 relative overflow-hidden group cursor-pointer"
        :style="bannerPhoto ? `background:url('${bannerPhoto}') center/cover` : ''"
        @click="pickPhoto('banner')"
      >
        <img
          v-if="!bannerPhoto"
          src="/programador1.jpg"
          alt=""
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0" style="background:rgba(0,0,0,0.2);" />
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
            Cambiar portada
          </div>
        </div>
      </div>

      <!-- Contenido bajo el banner -->
      <div class="px-6 pb-6">

        <!-- Avatar + botones -->
        <div class="flex items-end justify-between -mt-10 mb-4">

          <!-- Avatar -->
          <div class="relative group cursor-pointer flex-shrink-0" @click="pickPhoto('profile')">
            <div
              class="w-20 h-20 rounded-full border-4 overflow-hidden shadow-lg"
              style="border-color:var(--surface);"
            >
              <img
                v-if="profilePhoto"
                :src="profilePhoto"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <img
                v-else
                src="/IMG_20230606_043315.jpg"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <svg class="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex items-center gap-2 mt-1">
            <Transition name="fade">
              <span v-if="saved" class="text-sm font-medium flex items-center gap-1" style="color:#4CB782;">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardado
              </span>
            </Transition>
            <template v-if="!editing">
              <button class="btn btn-secondary btn-sm" @click="editing = true">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar perfil
              </button>
            </template>
            <template v-else>
              <button class="btn btn-secondary btn-sm" @click="cancelEdit">Cancelar</button>
              <button class="btn btn-primary btn-sm" :disabled="saving" @click="saveProfile">
                {{ saving ? 'Guardando…' : 'Guardar' }}
              </button>
            </template>
          </div>
        </div>

        <!-- Visualización -->
        <div v-if="!editing" class="space-y-1">
          <div class="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h1 class="text-xl font-bold" style="color:var(--text-1);">{{ auth.displayName }}</h1>
              <p v-if="headline" class="text-sm font-medium mt-0.5" style="color:var(--text-1);">{{ headline }}</p>
              <p v-else class="text-sm mt-0.5" style="color:var(--text-2);">{{ roleLabel }} · Talent Company C.A</p>
              <div v-if="location" class="flex items-center gap-1.5 text-sm mt-1" style="color:var(--text-2);">
                <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ location }}
              </div>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :style="roleBadgeStyle">
              {{ roleLabel }}
            </span>
          </div>
          <p
            v-if="about"
            class="text-sm mt-3 leading-relaxed pt-3"
            style="color:var(--text-2);border-top:1px solid var(--border);"
          >
            {{ about }}
          </p>
        </div>

        <!-- Edición -->
        <div v-else class="space-y-4 mt-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Nombre completo</label>
              <input v-model="name" type="text" class="form-input" placeholder="Tu nombre" />
            </div>
            <div>
              <label class="form-label">Titular</label>
              <input v-model="headline" type="text" class="form-input" placeholder="Ej: Recruiter IT en Talent Company" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Teléfono</label>
              <input v-model="phone" type="tel" class="form-input" placeholder="+34 600 000 000" />
            </div>
            <div>
              <label class="form-label">Ubicación</label>
              <input v-model="location" type="text" class="form-input" placeholder="Madrid, España" />
            </div>
          </div>
          <div>
            <label class="form-label">LinkedIn</label>
            <input v-model="linkedin" type="url" class="form-input" placeholder="linkedin.com/in/…" />
          </div>
          <div>
            <label class="form-label">Sobre mí</label>
            <textarea v-model="about" rows="3" class="form-input resize-none" placeholder="Una breve descripción…" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Información de contacto ──────────────────────────── -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold" style="color:var(--text-1);">Información de contacto</h2>
      </div>
      <div class="px-6 py-4 space-y-3">

        <!-- Email -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(255,255,255,0.07);">
            <svg class="w-4 h-4" style="color:var(--text-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <p class="text-xs leading-none mb-0.5" style="color:var(--text-3);">Email</p>
            <p class="text-sm font-medium" style="color:var(--text-1);">{{ auth.profile?.email }}</p>
          </div>
        </div>

        <!-- Teléfono -->
        <div v-if="phone" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(255,255,255,0.07);">
            <svg class="w-4 h-4" style="color:var(--text-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs leading-none mb-0.5" style="color:var(--text-3);">Teléfono</p>
            <p class="text-sm font-medium" style="color:var(--text-1);">{{ phone }}</p>
          </div>
        </div>

        <!-- Rol -->
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(255,255,255,0.07);">
            <svg class="w-4 h-4" style="color:var(--text-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <p class="text-xs leading-none mb-1" style="color:var(--text-3);">Rol</p>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :style="roleBadgeStyle">
              {{ roleLabel }}
            </span>
          </div>
        </div>

        <!-- Ubicación -->
        <div v-if="location" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(255,255,255,0.07);">
            <svg class="w-4 h-4" style="color:var(--text-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <p class="text-xs leading-none mb-0.5" style="color:var(--text-3);">Ubicación</p>
            <p class="text-sm font-medium" style="color:var(--text-1);">{{ location }}</p>
          </div>
        </div>

        <!-- LinkedIn -->
        <div v-if="linkedin" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(0,119,181,0.15);">
            <svg class="w-4 h-4" style="color:#0077b5;" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </div>
          <div>
            <p class="text-xs leading-none mb-0.5" style="color:var(--text-3);">LinkedIn</p>
            <a :href="linkedin" target="_blank" class="text-sm font-medium hover:underline" style="color:var(--accent);">
              {{ linkedin.replace('https://','') }}
            </a>
          </div>
        </div>

        <!-- Miembro desde -->
        <div class="flex items-center gap-3 pt-1 mt-1" style="border-top:1px solid var(--border);">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background:rgba(255,255,255,0.07);">
            <svg class="w-4 h-4" style="color:var(--text-2);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <p class="text-xs leading-none mb-0.5" style="color:var(--text-3);">Miembro desde</p>
            <p class="text-sm font-medium" style="color:var(--text-1);">{{ memberSince }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Seguridad ─────────────────────────────────────────── -->
    <div class="card">
      <div class="card-header">
        <h2 class="text-sm font-semibold" style="color:var(--text-1);">Seguridad</h2>
      </div>
      <div class="px-6 py-4 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium" style="color:var(--text-1);">Contraseña</p>
          <p class="text-xs mt-0.5" style="color:var(--text-3);">
            Gestiona tu contraseña desde el panel de Supabase o mediante el enlace de recuperación en el login.
          </p>
        </div>
        <span class="text-xs rounded-full px-2.5 py-1" style="background:rgba(255,255,255,0.07);color:var(--text-2);">
          ••••••••
        </span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
