<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

// ── Modo edición ────────────────────────────────────────────
const editing = ref(false)
const saving  = ref(false)
const saved   = ref(false)

// ── Campos del perfil ────────────────────────────────────────
const name     = ref(auth.profile?.full_name ?? '')
const location = ref(localStorage.getItem('cp_location') ?? '')
const about    = ref(localStorage.getItem('cp_about')    ?? '')
const phone    = ref(localStorage.getItem('cp_phone')    ?? '')

// Skills
const skillInput  = ref('')
const skills      = ref<string[]>(
  JSON.parse(localStorage.getItem('cp_skills') ?? '[]'),
)

function addSkill() {
  const s = skillInput.value.trim()
  if (s && !skills.value.includes(s)) {
    skills.value.push(s)
    localStorage.setItem('cp_skills', JSON.stringify(skills.value))
  }
  skillInput.value = ''
}

function removeSkill(s: string) {
  skills.value = skills.value.filter(x => x !== s)
  localStorage.setItem('cp_skills', JSON.stringify(skills.value))
}

function handleSkillKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addSkill()
  }
}

// ── Guardar ─────────────────────────────────────────────────
async function saveProfile() {
  saving.value = true
  await auth.updateProfile({ full_name: name.value })
  localStorage.setItem('cp_location', location.value)
  localStorage.setItem('cp_about',    about.value)
  localStorage.setItem('cp_phone',    phone.value)
  saving.value  = false
  saved.value   = true
  editing.value = false
  setTimeout(() => (saved.value = false), 2500)
}

function cancelEdit() {
  name.value     = auth.profile?.full_name ?? ''
  location.value = localStorage.getItem('cp_location') ?? ''
  about.value    = localStorage.getItem('cp_about')    ?? ''
  phone.value    = localStorage.getItem('cp_phone')    ?? ''
  editing.value  = false
}

const memberSince = computed(() => {
  const d = auth.profile?.created_at
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
})
</script>

<template>
  <div class="max-w-2xl space-y-4">

    <!-- ── Tarjeta principal ────────────────────────────────── -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

      <!-- Banner -->
      <div class="h-32 relative overflow-hidden" style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);">
        <div class="absolute inset-0 opacity-[0.07]"
          style="background-image:radial-gradient(circle at 1px 1px,white 1.5px,transparent 0);background-size:28px 28px;" />
      </div>

      <div class="px-6 pb-6">
        <!-- Avatar + acciones -->
        <div class="flex items-end justify-between -mt-10 mb-5">
          <div
            class="w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
            style="background:linear-gradient(135deg,#334155,#1e293b);"
          >
            {{ auth.initials }}
          </div>

          <div class="flex items-center gap-2 mt-1">
            <Transition name="fade">
              <span v-if="saved" class="flex items-center gap-1 text-sm text-green-600 font-medium">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Guardado
              </span>
            </Transition>

            <template v-if="!editing">
              <button
                class="flex items-center gap-1.5 text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
                @click="editing = true"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Editar perfil
              </button>
            </template>
            <template v-else>
              <button class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors" @click="cancelEdit">
                Cancelar
              </button>
              <button
                class="text-sm bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                :disabled="saving"
                @click="saveProfile"
              >
                {{ saving ? 'Guardando…' : 'Guardar' }}
              </button>
            </template>
          </div>
        </div>

        <!-- Vista normal -->
        <div v-if="!editing">
          <div class="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 class="text-xl font-bold text-slate-900">{{ auth.displayName }}</h1>
              <p class="text-sm text-slate-500 mt-0.5">Candidato · Talent Company C.A</p>
              <div v-if="location" class="flex items-center gap-1.5 text-sm text-slate-400 mt-1.5">
                <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {{ location }}
              </div>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
              🟢 Búsqueda activa
            </span>
          </div>

          <p v-if="about" class="text-sm text-slate-600 leading-relaxed mt-4 border-t border-slate-100 pt-4">
            {{ about }}
          </p>
          <p v-else class="text-sm text-slate-400 italic mt-4 border-t border-slate-100 pt-4">
            Añade una breve descripción sobre ti — aparece en tu perfil público.
          </p>
        </div>

        <!-- Formulario de edición -->
        <div v-else class="space-y-4 mt-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="form-label">Nombre completo</label>
              <input v-model="name" type="text" class="form-input" placeholder="Tu nombre" />
            </div>
            <div>
              <label class="form-label">Teléfono</label>
              <input v-model="phone" type="tel" class="form-input" placeholder="+34 600 000 000" />
            </div>
          </div>
          <div>
            <label class="form-label">Ubicación</label>
            <input v-model="location" type="text" class="form-input" placeholder="Madrid, España" />
          </div>
          <div>
            <label class="form-label">Sobre mí</label>
            <textarea
              v-model="about"
              rows="4"
              class="form-input resize-none"
              placeholder="Cuéntanos sobre tu experiencia, habilidades y qué tipo de oportunidades buscas…"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Stats rápidas ─────────────────────────────────────── -->
    <div class="grid grid-cols-3 gap-3">
      <div class="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-slate-900">3</p>
        <p class="text-xs text-slate-400 mt-0.5">Solicitudes</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-slate-900">{{ skills.length }}</p>
        <p class="text-xs text-slate-400 mt-0.5">Habilidades</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p class="text-xs font-semibold text-slate-700">{{ memberSince || '—' }}</p>
        <p class="text-xs text-slate-400 mt-0.5">Miembro desde</p>
      </div>
    </div>

    <!-- ── Habilidades ───────────────────────────────────────── -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-slate-800">Habilidades</h2>
        <span class="text-xs text-slate-400">{{ skills.length }} añadidas</span>
      </div>

      <!-- Chips -->
      <div class="flex flex-wrap gap-2 mb-3">
        <span
          v-for="s in skills"
          :key="s"
          class="group flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          {{ s }}
          <button
            class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 ml-0.5"
            @click="removeSkill(s)"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </span>
        <span v-if="skills.length === 0" class="text-xs text-slate-400 italic">
          Añade tus habilidades técnicas y blandas…
        </span>
      </div>

      <!-- Input añadir -->
      <div class="flex gap-2">
        <input
          v-model="skillInput"
          type="text"
          placeholder="Vue.js, Python, Photoshop…"
          class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-slate-400"
          @keydown="handleSkillKey"
        />
        <button
          class="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          @click="addSkill"
        >
          Añadir
        </button>
      </div>
      <p class="text-[11px] text-slate-400 mt-2">Pulsa Enter o coma para añadir rápido</p>
    </div>

    <!-- ── Contacto ──────────────────────────────────────────── -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">Información de contacto</h2>
      </div>
      <div class="px-5 py-4 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 leading-none mb-0.5">Email</p>
            <p class="text-sm text-slate-700 font-medium">{{ auth.profile?.email }}</p>
          </div>
        </div>

        <div v-if="phone" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 leading-none mb-0.5">Teléfono</p>
            <p class="text-sm text-slate-700 font-medium">{{ phone }}</p>
          </div>
        </div>

        <div v-if="location" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 leading-none mb-0.5">Ubicación</p>
            <p class="text-sm text-slate-700 font-medium">{{ location }}</p>
          </div>
        </div>

        <p v-if="!phone && !location" class="text-xs text-slate-400 italic">
          Completa tu perfil para añadir información de contacto.
        </p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.form-label { @apply text-xs font-medium text-slate-600 block mb-1.5; }
.form-input  { @apply w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
