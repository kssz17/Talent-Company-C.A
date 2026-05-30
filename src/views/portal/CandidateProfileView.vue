<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const uid  = computed(() => auth.profile?.id ?? 'anon')

// ── Fotos (por usuario, localStorage) ───────────────────────
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

// ── Datos básicos ────────────────────────────────────────────
const editing  = ref(false)
const saving   = ref(false)
const saved    = ref(false)

const name       = ref('')
const headline   = ref('')
const location   = ref('')
const about      = ref('')
const phone      = ref('')
const linkedin   = ref('')
const portfolio  = ref('')
const github     = ref('')

function loadBasic() {
  const raw = localStorage.getItem(`cp_basic_${uid.value}`)
  const d   = raw ? JSON.parse(raw) : {}
  name.value      = d.name      ?? auth.profile?.full_name ?? ''
  headline.value  = d.headline  ?? ''
  location.value  = d.location  ?? ''
  about.value     = d.about     ?? ''
  phone.value     = d.phone     ?? ''
  linkedin.value  = d.linkedin  ?? ''
  portfolio.value = d.portfolio ?? ''
  github.value    = d.github    ?? ''
}

async function saveBasic() {
  saving.value = true
  await auth.updateProfile({ full_name: name.value })
  localStorage.setItem(`cp_basic_${uid.value}`, JSON.stringify({
    name: name.value, headline: headline.value, location: location.value,
    about: about.value, phone: phone.value, linkedin: linkedin.value,
    portfolio: portfolio.value, github: github.value,
  }))
  saving.value  = false
  saved.value   = true
  editing.value = false
  setTimeout(() => (saved.value = false), 2500)
}

function cancelBasic() {
  loadBasic()
  editing.value = false
}

// ── Preferencias laborales ───────────────────────────────────
const prefSalMin  = ref<number | ''>('')
const prefSalMax  = ref<number | ''>('')
const prefMode    = ref('')
const prefAvail   = ref('')

function loadPrefs() {
  const raw = localStorage.getItem(`cp_prefs_${uid.value}`)
  const d   = raw ? JSON.parse(raw) : {}
  prefSalMin.value = d.salMin ?? ''
  prefSalMax.value = d.salMax ?? ''
  prefMode.value   = d.mode   ?? ''
  prefAvail.value  = d.avail  ?? ''
}

function savePrefs() {
  localStorage.setItem(`cp_prefs_${uid.value}`, JSON.stringify({
    salMin: prefSalMin.value, salMax: prefSalMax.value,
    mode: prefMode.value, avail: prefAvail.value,
  }))
  editingPrefs.value = false
}

const editingPrefs = ref(false)

// ── Habilidades ──────────────────────────────────────────────
const skillInput = ref('')
const skills     = ref<string[]>([])

function loadSkills() {
  skills.value = JSON.parse(localStorage.getItem(`cp_skills_${uid.value}`) ?? '[]')
}

function saveSkills() {
  localStorage.setItem(`cp_skills_${uid.value}`, JSON.stringify(skills.value))
}

function addSkill() {
  const s = skillInput.value.trim()
  if (s && !skills.value.includes(s)) { skills.value.push(s); saveSkills() }
  skillInput.value = ''
}

function removeSkill(s: string) {
  skills.value = skills.value.filter(x => x !== s)
  saveSkills()
}

function handleSkillKey(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSkill() }
}

// ── Idiomas ──────────────────────────────────────────────────
interface LangEntry { name: string; level: string }
const languages  = ref<LangEntry[]>([])
const newLang    = ref('')
const newLevel   = ref('B2')
const LEVELS     = ['A1','A2','B1','B2','C1','C2','Nativo']

const levelBadge: Record<string, string> = {
  A1: 'bg-slate-100 text-slate-500', A2: 'bg-slate-100 text-slate-500',
  B1: 'bg-blue-100 text-blue-600',   B2: 'bg-blue-100 text-blue-700',
  C1: 'bg-violet-100 text-violet-700', C2: 'bg-violet-100 text-violet-800',
  Nativo: 'bg-emerald-100 text-emerald-700',
}

function loadLangs() {
  languages.value = JSON.parse(localStorage.getItem(`cp_langs_${uid.value}`) ?? '[]')
}

function saveLangs() {
  localStorage.setItem(`cp_langs_${uid.value}`, JSON.stringify(languages.value))
}

function addLang() {
  const n = newLang.value.trim()
  if (n && !languages.value.find(l => l.name === n)) {
    languages.value.push({ name: n, level: newLevel.value })
    saveLangs()
  }
  newLang.value = ''
}

function removeLang(name: string) {
  languages.value = languages.value.filter(l => l.name !== name)
  saveLangs()
}

// ── Experiencia ──────────────────────────────────────────────
interface ExpEntry { id: string; company: string; role: string; start: string; end: string; current: boolean; description: string }
const experience = ref<ExpEntry[]>([])
const addingExp  = ref(false)
const editExpId  = ref<string | null>(null)
const expForm    = ref<Omit<ExpEntry,'id'>>({ company:'', role:'', start:'', end:'', current:false, description:'' })

function loadExp() {
  experience.value = JSON.parse(localStorage.getItem(`cp_exp_${uid.value}`) ?? '[]')
}

function saveExpList() {
  localStorage.setItem(`cp_exp_${uid.value}`, JSON.stringify(experience.value))
}

function submitExp() {
  if (editExpId.value) {
    const i = experience.value.findIndex(e => e.id === editExpId.value)
    if (i >= 0) experience.value[i] = { id: editExpId.value, ...expForm.value }
    editExpId.value = null
  } else {
    experience.value.unshift({ id: Date.now().toString(), ...expForm.value })
  }
  saveExpList()
  addingExp.value = false
  expForm.value = { company:'', role:'', start:'', end:'', current:false, description:'' }
}

function editExp(e: ExpEntry) {
  editExpId.value = e.id
  expForm.value = { company: e.company, role: e.role, start: e.start, end: e.end, current: e.current, description: e.description }
  addingExp.value = true
}

function deleteExp(id: string) {
  experience.value = experience.value.filter(e => e.id !== id)
  saveExpList()
}

function cancelExp() {
  addingExp.value = false
  editExpId.value = null
  expForm.value = { company:'', role:'', start:'', end:'', current:false, description:'' }
}

// ── Educación ────────────────────────────────────────────────
interface EduEntry { id: string; institution: string; degree: string; field: string; startYear: string; endYear: string; current: boolean }
const education  = ref<EduEntry[]>([])
const addingEdu  = ref(false)
const editEduId  = ref<string | null>(null)
const eduForm    = ref<Omit<EduEntry,'id'>>({ institution:'', degree:'', field:'', startYear:'', endYear:'', current:false })

function loadEdu() {
  education.value = JSON.parse(localStorage.getItem(`cp_edu_${uid.value}`) ?? '[]')
}

function saveEduList() {
  localStorage.setItem(`cp_edu_${uid.value}`, JSON.stringify(education.value))
}

function submitEdu() {
  if (editEduId.value) {
    const i = education.value.findIndex(e => e.id === editEduId.value)
    if (i >= 0) education.value[i] = { id: editEduId.value, ...eduForm.value }
    editEduId.value = null
  } else {
    education.value.unshift({ id: Date.now().toString(), ...eduForm.value })
  }
  saveEduList()
  addingEdu.value = false
  eduForm.value = { institution:'', degree:'', field:'', startYear:'', endYear:'', current:false }
}

function editEdu(e: EduEntry) {
  editEduId.value = e.id
  eduForm.value = { institution: e.institution, degree: e.degree, field: e.field, startYear: e.startYear, endYear: e.endYear, current: e.current }
  addingEdu.value = true
}

function deleteEdu(id: string) {
  education.value = education.value.filter(e => e.id !== id)
  saveEduList()
}

function cancelEdu() {
  addingEdu.value = false
  editEduId.value = null
  eduForm.value = { institution:'', degree:'', field:'', startYear:'', endYear:'', current:false }
}

// ── Ciclo de vida ────────────────────────────────────────────
onMounted(() => {
  profilePhoto.value = localStorage.getItem(`photo_profile_${uid.value}`)
  bannerPhoto.value  = localStorage.getItem(`photo_banner_${uid.value}`)
  loadBasic()
  loadPrefs()
  loadSkills()
  loadLangs()
  loadExp()
  loadEdu()
})

// ── Helpers ──────────────────────────────────────────────────
const memberSince = computed(() => {
  const d = auth.profile?.created_at
  return d ? new Date(d).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) : '—'
})

const availLabel: Record<string, string> = {
  immediate: '🟢 Disponible inmediatamente',
  '1month':  '🟡 Disponible en 1 mes',
  '3months': '🟠 Disponible en 3 meses',
  passive:   '⚪ Abierto a oportunidades',
}

const modeLabel: Record<string, string> = {
  remote: 'Remoto', hybrid: 'Híbrido', 'on-site': 'Presencial',
}

function formatSal(v: number | '') {
  if (!v) return ''
  return `${(Number(v) / 1000).toFixed(0)}k €`
}
</script>

<template>
  <div class="max-w-2xl space-y-4">

    <!-- ═══════════════ HERO ══════════════════════════════════ -->
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

      <!-- Banner -->
      <div
        class="h-36 relative overflow-hidden group cursor-pointer"
        :style="bannerPhoto
          ? `background:url('${bannerPhoto}') center/cover`
          : 'background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);'"
        @click="pickPhoto('banner')"
      >
        <div class="absolute inset-0 opacity-[0.06]"
          style="background-image:radial-gradient(circle at 1px 1px,white 1.5px,transparent 0);background-size:28px 28px;" />
        <!-- Overlay editar banner -->
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

      <div class="px-6 pb-6">
        <!-- Avatar + edit button row -->
        <div class="flex items-end justify-between -mt-10 mb-5">

          <!-- Avatar -->
          <div class="relative group cursor-pointer flex-shrink-0" @click="pickPhoto('profile')">
            <div class="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0">
              <img v-if="profilePhoto" :src="profilePhoto" alt="Foto" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                style="background:linear-gradient(135deg,#334155,#1e293b);">
                {{ auth.initials }}
              </div>
            </div>
            <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <svg class="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center gap-2 mt-2">
            <Transition name="fade">
              <span v-if="saved" class="flex items-center gap-1 text-sm text-green-600 font-medium">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Guardado
              </span>
            </Transition>
            <template v-if="!editing">
              <button class="flex items-center gap-1.5 text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors" @click="editing = true">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar perfil
              </button>
            </template>
            <template v-else>
              <button class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors" @click="cancelBasic">Cancelar</button>
              <button class="text-sm bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50" :disabled="saving" @click="saveBasic">
                {{ saving ? 'Guardando…' : 'Guardar' }}
              </button>
            </template>
          </div>
        </div>

        <!-- Modo visualización -->
        <div v-if="!editing">
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 class="text-xl font-bold text-slate-900">{{ auth.displayName }}</h1>
              <p v-if="headline" class="text-sm text-slate-600 mt-0.5 font-medium">{{ headline }}</p>
              <p v-else class="text-sm text-slate-400 italic mt-0.5">Sin titular — añade uno editando tu perfil</p>
              <div v-if="location" class="flex items-center gap-1.5 text-sm text-slate-400 mt-1.5">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {{ location }}
              </div>
            </div>
            <span v-if="prefAvail" class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
              {{ availLabel[prefAvail] ?? prefAvail }}
            </span>
            <span v-else class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 whitespace-nowrap">
              ⚪ Sin estado de disponibilidad
            </span>
          </div>
          <p v-if="about" class="text-sm text-slate-600 leading-relaxed mt-4 border-t border-slate-100 pt-4">{{ about }}</p>
          <p v-else class="text-sm text-slate-400 italic mt-4 border-t border-slate-100 pt-4">Describe tu experiencia y qué tipo de oportunidades buscas…</p>
        </div>

        <!-- Modo edición -->
        <div v-else class="space-y-3 mt-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="lbl">Nombre completo</label>
              <input v-model="name" type="text" class="inp" placeholder="Tu nombre" />
            </div>
            <div>
              <label class="lbl">Titular profesional</label>
              <input v-model="headline" type="text" class="inp" placeholder="Ej: Frontend Developer · Vue 3 + TS" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="lbl">Teléfono</label>
              <input v-model="phone" type="tel" class="inp" placeholder="+34 600 000 000" />
            </div>
            <div>
              <label class="lbl">Ubicación</label>
              <input v-model="location" type="text" class="inp" placeholder="Madrid, España" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="lbl">LinkedIn</label>
              <input v-model="linkedin" type="url" class="inp" placeholder="linkedin.com/in/…" />
            </div>
            <div>
              <label class="lbl">Portfolio / Web</label>
              <input v-model="portfolio" type="url" class="inp" placeholder="miportfolio.dev" />
            </div>
            <div>
              <label class="lbl">GitHub</label>
              <input v-model="github" type="url" class="inp" placeholder="github.com/…" />
            </div>
          </div>
          <div>
            <label class="lbl">Sobre mí</label>
            <textarea v-model="about" rows="4" class="inp resize-none" placeholder="Cuéntanos sobre tu experiencia, logros y qué buscas en tu próxima oportunidad…" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ STATS ════════════════════════════════ -->
    <div class="grid grid-cols-4 gap-3">
      <div class="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-slate-900">3</p>
        <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Solicitudes</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-slate-900">{{ skills.length }}</p>
        <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Habilidades</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-slate-900">{{ languages.length }}</p>
        <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Idiomas</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-4 text-center">
        <p class="text-xs font-bold text-slate-700 leading-tight">{{ memberSince }}</p>
        <p class="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Miembro</p>
      </div>
    </div>

    <!-- ═══════════════ PREFERENCIAS ════════════════════════ -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-800">Preferencias laborales</h2>
        <button v-if="!editingPrefs" class="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors" @click="editingPrefs = true">Editar</button>
        <div v-else class="flex gap-2">
          <button class="text-xs border border-slate-200 rounded-lg px-2.5 py-1 text-slate-500 hover:bg-slate-50" @click="editingPrefs = false">Cancelar</button>
          <button class="text-xs bg-slate-800 text-white rounded-lg px-2.5 py-1 hover:bg-slate-900" @click="savePrefs">Guardar</button>
        </div>
      </div>
      <div class="px-5 py-4">
        <div v-if="!editingPrefs" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p class="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Salario esperado</p>
            <p class="text-sm font-semibold text-slate-800">
              <template v-if="prefSalMin || prefSalMax">
                {{ prefSalMin ? formatSal(prefSalMin) : '' }} {{ prefSalMin && prefSalMax ? '–' : '' }} {{ prefSalMax ? formatSal(prefSalMax) : '' }}
              </template>
              <span v-else class="text-slate-400 font-normal italic">Sin especificar</span>
            </p>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Modalidad</p>
            <p class="text-sm font-semibold text-slate-800">
              <template v-if="modeLabel[prefMode]">{{ modeLabel[prefMode] }}</template>
              <span v-else class="text-slate-400 font-normal italic">Sin especificar</span>
            </p>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Disponibilidad</p>
            <p class="text-sm font-semibold text-slate-800">
              {{ prefAvail ? availLabel[prefAvail] : '' }}
              <span v-if="!prefAvail" class="text-slate-400 font-normal italic">Sin especificar</span>
            </p>
          </div>
        </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="lbl">Salario mín. (€/año)</label>
            <input v-model.number="prefSalMin" type="number" step="1000" class="inp" placeholder="30000" />
          </div>
          <div>
            <label class="lbl">Salario máx. (€/año)</label>
            <input v-model.number="prefSalMax" type="number" step="1000" class="inp" placeholder="50000" />
          </div>
          <div>
            <label class="lbl">Modalidad preferida</label>
            <select v-model="prefMode" class="inp">
              <option value="">Indiferente</option>
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
              <option value="on-site">Presencial</option>
            </select>
          </div>
          <div class="sm:col-span-3">
            <label class="lbl">Disponibilidad</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="opt in [
                  { val:'immediate', label:'Inmediata' },
                  { val:'1month',    label:'1 mes' },
                  { val:'3months',   label:'3 meses' },
                  { val:'passive',   label:'Abierto a ofertas' },
                ]"
                :key="opt.val"
                type="button"
                class="text-xs py-2 rounded-lg border transition-all font-medium"
                :class="prefAvail === opt.val
                  ? 'border-slate-700 bg-slate-800 text-white'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'"
                @click="prefAvail = opt.val"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ EXPERIENCIA ══════════════════════════ -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-800">Experiencia laboral</h2>
        <button class="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1" @click="addingExp = true; editExpId = null; expForm = { company:'', role:'', start:'', end:'', current:false, description:'' }">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Añadir
        </button>
      </div>

      <!-- Formulario inline -->
      <div v-if="addingExp" class="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
        <h3 class="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">{{ editExpId ? 'Editar entrada' : 'Nueva entrada' }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div><label class="lbl">Empresa</label><input v-model="expForm.company" type="text" class="inp" placeholder="Google, Freelance…" /></div>
          <div><label class="lbl">Cargo</label><input v-model="expForm.role" type="text" class="inp" placeholder="Frontend Developer" /></div>
          <div><label class="lbl">Desde</label><input v-model="expForm.start" type="month" class="inp" /></div>
          <div>
            <label class="lbl">Hasta</label>
            <input v-model="expForm.end" type="month" class="inp" :disabled="expForm.current" />
            <label class="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 cursor-pointer">
              <input v-model="expForm.current" type="checkbox" class="rounded" />
              Trabajo actual
            </label>
          </div>
        </div>
        <div class="mb-3">
          <label class="lbl">Descripción (opcional)</label>
          <textarea v-model="expForm.description" rows="2" class="inp resize-none" placeholder="Principales logros y responsabilidades…" />
        </div>
        <div class="flex gap-2">
          <button class="text-sm bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-3 py-1.5 transition-colors" @click="submitExp">Guardar</button>
          <button class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors" @click="cancelExp">Cancelar</button>
        </div>
      </div>

      <div v-if="experience.length === 0 && !addingExp" class="px-5 py-8 text-center">
        <svg class="w-10 h-10 text-slate-200 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
        <p class="text-sm text-slate-400">Añade tu experiencia laboral</p>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div v-for="e in experience" :key="e.id" class="px-5 py-4 flex items-start gap-4 group">
          <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900">{{ e.role }}</p>
            <p class="text-sm text-slate-600">{{ e.company }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ e.start }} · {{ e.current ? 'Presente' : e.end }}</p>
            <p v-if="e.description" class="text-sm text-slate-500 mt-1.5 leading-relaxed">{{ e.description }}</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button class="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100" @click="editExp(e)">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50" @click="deleteExp(e.id)">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ EDUCACIÓN ════════════════════════════ -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-800">Educación</h2>
        <button class="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1" @click="addingEdu = true; editEduId = null; eduForm = { institution:'', degree:'', field:'', startYear:'', endYear:'', current:false }">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Añadir
        </button>
      </div>

      <div v-if="addingEdu" class="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
        <h3 class="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">{{ editEduId ? 'Editar entrada' : 'Nueva entrada' }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div><label class="lbl">Institución</label><input v-model="eduForm.institution" type="text" class="inp" placeholder="Universidad de Madrid" /></div>
          <div><label class="lbl">Titulación</label><input v-model="eduForm.degree" type="text" class="inp" placeholder="Grado, Máster…" /></div>
          <div><label class="lbl">Área de estudio</label><input v-model="eduForm.field" type="text" class="inp" placeholder="Informática, Diseño…" /></div>
          <div class="grid grid-cols-2 gap-2">
            <div><label class="lbl">Año inicio</label><input v-model="eduForm.startYear" type="number" class="inp" placeholder="2018" /></div>
            <div>
              <label class="lbl">Año fin</label>
              <input v-model="eduForm.endYear" type="number" class="inp" placeholder="2022" :disabled="eduForm.current" />
            </div>
          </div>
        </div>
        <label class="flex items-center gap-1.5 text-xs text-slate-500 mb-3 cursor-pointer">
          <input v-model="eduForm.current" type="checkbox" class="rounded" /> En curso
        </label>
        <div class="flex gap-2">
          <button class="text-sm bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-3 py-1.5 transition-colors" @click="submitEdu">Guardar</button>
          <button class="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 transition-colors" @click="cancelEdu">Cancelar</button>
        </div>
      </div>

      <div v-if="education.length === 0 && !addingEdu" class="px-5 py-8 text-center">
        <svg class="w-10 h-10 text-slate-200 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
        <p class="text-sm text-slate-400">Añade tu formación académica</p>
      </div>

      <div v-else class="divide-y divide-slate-100">
        <div v-for="e in education" :key="e.id" class="px-5 py-4 flex items-start gap-4 group">
          <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-900">{{ e.degree }} <span v-if="e.field" class="font-normal text-slate-500">· {{ e.field }}</span></p>
            <p class="text-sm text-slate-600">{{ e.institution }}</p>
            <p class="text-xs text-slate-400 mt-0.5">{{ e.startYear }} · {{ e.current ? 'En curso' : e.endYear }}</p>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button class="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100" @click="editEdu(e)">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50" @click="deleteEdu(e.id)">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ HABILIDADES ══════════════════════════ -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-slate-800">Habilidades</h2>
        <span class="text-xs text-slate-400">{{ skills.length }} añadidas</span>
      </div>
      <div class="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
        <span v-for="s in skills" :key="s"
          class="group flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-default">
          {{ s }}
          <button class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500" @click="removeSkill(s)">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </span>
        <span v-if="skills.length === 0" class="text-xs text-slate-400 italic">Añade tus habilidades técnicas y blandas…</span>
      </div>
      <div class="flex gap-2">
        <input v-model="skillInput" type="text" placeholder="Vue.js, Python, Figma…" class="inp flex-1" @keydown="handleSkillKey" />
        <button class="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors" @click="addSkill">Añadir</button>
      </div>
      <p class="text-[11px] text-slate-400 mt-1.5">Pulsa Enter o coma para añadir · Pasa el cursor sobre un chip para eliminarlo</p>
    </div>

    <!-- ═══════════════ IDIOMAS ═══════════════════════════════ -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h2 class="text-sm font-semibold text-slate-800 mb-4">Idiomas</h2>
      <div class="space-y-2 mb-3">
        <div v-for="l in languages" :key="l.name" class="flex items-center justify-between group">
          <div class="flex items-center gap-3">
            <span class="text-sm text-slate-700 font-medium">{{ l.name }}</span>
            <span :class="['text-xs font-semibold px-2 py-0.5 rounded-full', levelBadge[l.level] ?? 'bg-slate-100 text-slate-500']">{{ l.level }}</span>
          </div>
          <button class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-400 p-1" @click="removeLang(l.name)">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p v-if="languages.length === 0" class="text-xs text-slate-400 italic">Añade los idiomas que dominas…</p>
      </div>
      <div class="flex gap-2">
        <input v-model="newLang" type="text" placeholder="Español, Inglés…" class="inp flex-1" @keydown.enter.prevent="addLang" />
        <select v-model="newLevel" class="inp w-24 flex-shrink-0">
          <option v-for="lv in LEVELS" :key="lv" :value="lv">{{ lv }}</option>
        </select>
        <button class="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors" @click="addLang">+</button>
      </div>
    </div>

    <!-- ═══════════════ CONTACTO Y LINKS ═════════════════════ -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div class="px-5 py-4 border-b border-slate-100">
        <h2 class="text-sm font-semibold text-slate-800">Contacto y enlaces</h2>
      </div>
      <div class="px-5 py-4 space-y-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 mb-0.5">Email</p>
            <p class="text-sm text-slate-700 font-medium">{{ auth.profile?.email }}</p>
          </div>
        </div>
        <div v-if="phone" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.4 2 2 0 0 1 3.62 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 mb-0.5">Teléfono</p>
            <p class="text-sm text-slate-700 font-medium">{{ phone }}</p>
          </div>
        </div>
        <div v-if="linkedin" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#0077b5]/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-[#0077b5]" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 mb-0.5">LinkedIn</p>
            <a :href="linkedin" target="_blank" class="text-sm text-blue-600 hover:underline font-medium">{{ linkedin.replace('https://','') }}</a>
          </div>
        </div>
        <div v-if="portfolio" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 mb-0.5">Portfolio</p>
            <a :href="portfolio" target="_blank" class="text-sm text-violet-600 hover:underline font-medium">{{ portfolio.replace('https://','') }}</a>
          </div>
        </div>
        <div v-if="github" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 mb-0.5">GitHub</p>
            <a :href="github" target="_blank" class="text-sm text-slate-700 hover:underline font-medium">{{ github.replace('https://','') }}</a>
          </div>
        </div>
        <p v-if="!phone && !linkedin && !portfolio && !github" class="text-xs text-slate-400 italic">
          Edita tu perfil para añadir contacto y enlaces.
        </p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.lbl { @apply text-xs font-medium text-slate-600 block mb-1.5; }
.inp { @apply w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition-colors bg-white; }

.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
