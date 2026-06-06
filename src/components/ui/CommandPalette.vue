<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { usePipelineStore } from '@/stores/pipeline'
import { usePalette } from '@/composables/usePalette'

const router   = useRouter()
const jobs     = useJobsStore()
const pipeline = usePipelineStore()

// ── State ─────────────────────────────────────────────────────
const palette = usePalette()
const open    = palette.isOpen        // shared singleton ref
const query   = ref('')
const cursor  = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

// ── Open / close ──────────────────────────────────────────────
function show() { palette.open(); query.value = ''; cursor.value = 0; nextTick(() => inputEl.value?.focus()) }
function hide() { palette.close() }

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open.value ? hide() : show() }
  if (e.key === 'Escape') hide()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// ── Results ───────────────────────────────────────────────────
interface Result {
  id:       string
  label:    string
  sub?:     string
  icon:     string
  action:   () => void
  group:    string
  color?:   string
}

const navItems: Result[] = [
  { id: 'nav-dashboard',  label: 'Panel',          sub: 'Vista general y métricas', icon: 'grid',      action: () => router.push({ name: 'dashboard' }),  group: 'Navegación' },
  { id: 'nav-jobs',       label: 'Ofertas',         sub: 'Gestiona tus vacantes',    icon: 'briefcase', action: () => router.push({ name: 'jobs' }),        group: 'Navegación' },
  { id: 'nav-pipeline',   label: 'Pipeline',        sub: 'Kanban de candidatos',     icon: 'layers',    action: () => router.push({ name: 'pipeline' }),    group: 'Navegación' },
  { id: 'nav-candidates', label: 'Candidatos',      sub: 'Base de datos',            icon: 'users',     action: () => router.push({ name: 'candidates' }),  group: 'Navegación' },
  { id: 'nav-reports',    label: 'Informes',        sub: 'Análisis y estadísticas',  icon: 'bar-chart', action: () => router.push({ name: 'reports' }),     group: 'Navegación' },
  { id: 'nav-templates',  label: 'Plantillas',      sub: 'Plantillas de ofertas',    icon: 'file-text', action: () => router.push({ name: 'templates' }),   group: 'Navegación' },
  { id: 'nav-settings',   label: 'Configuración',   sub: 'Ajustes del sistema',      icon: 'settings',  action: () => router.push({ name: 'settings' }),    group: 'Navegación' },
]

const actionItems: Result[] = [
  { id: 'act-new-job', label: 'Nueva oferta',  sub: 'Crear vacante',      icon: 'plus',  action: () => router.push({ name: 'jobs-new' }),    group: 'Acciones' },
]

const results = computed<Result[]>(() => {
  const q = query.value.trim().toLowerCase()

  // Matching helper — score by how early the match appears
  const matches = (text: string) => !q || text.toLowerCase().includes(q)

  const nav  = navItems.filter(r => matches(r.label) || matches(r.sub ?? ''))
  const acts = actionItems.filter(r => matches(r.label))

  const jobResults: Result[] = q
    ? jobs.jobs
        .filter(j => j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q))
        .slice(0, 5)
        .map(j => ({
          id:     `job-${j.id}`,
          label:  j.title,
          sub:    `${j.location} · ${j.status}`,
          icon:   'briefcase',
          action: () => router.push({ name: 'jobs-detail', params: { id: j.id } }),
          group:  'Ofertas',
        }))
    : []

  const candidateResults: Result[] = q
    ? pipeline.allApplications
        .filter(a => {
          const full = `${a.candidate?.first_name ?? ''} ${a.candidate?.last_name ?? ''}`.toLowerCase()
          return full.includes(q) || a.candidate?.email?.toLowerCase().includes(q)
        })
        .slice(0, 5)
        .map(a => ({
          id:     `cand-${a.candidate_id}`,
          label:  `${a.candidate?.first_name ?? ''} ${a.candidate?.last_name ?? ''}`.trim(),
          sub:    a.candidate?.email,
          icon:   'user',
          action: () => router.push({ name: 'candidates-detail', params: { id: a.candidate_id } }),
          group:  'Candidatos',
        }))
        // deduplicate by candidate_id
        .filter((r, i, arr) => arr.findIndex(x => x.id === r.id) === i)
    : []

  return [...acts, ...nav, ...jobResults, ...candidateResults]
})

// ── Grouped results ───────────────────────────────────────────
const grouped = computed(() => {
  const map = new Map<string, Result[]>()
  for (const r of results.value) {
    if (!map.has(r.group)) map.set(r.group, [])
    map.get(r.group)!.push(r)
  }
  return [...map.entries()]
})

// Flat ordered list for keyboard navigation
const flat = computed(() => results.value)

// Reset cursor when results change
watch(results, () => { cursor.value = 0 })

function select(r: Result) {
  r.action()
  hide()
}

function onArrow(dir: 1 | -1) {
  cursor.value = (cursor.value + dir + flat.value.length) % flat.value.length
}

function onEnter() {
  const r = flat.value[cursor.value]
  if (r) select(r)
}

function cursorFor(r: Result) {
  return flat.value.indexOf(r)
}
</script>

<template>
  <!-- Trigger is Ctrl/Cmd+K — no button needed (keyboard only) -->

  <Teleport to="body">
    <Transition name="palette">
      <div
        v-if="open"
        class="palette-backdrop"
        @click.self="hide"
      >
        <div class="palette-box" role="dialog" aria-modal="true" aria-label="Búsqueda rápida">

          <!-- Search input -->
          <div class="palette-search">
            <svg class="w-4 h-4 flex-shrink-0" style="color:var(--text-3);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref="inputEl"
              v-model="query"
              class="palette-input"
              placeholder="Buscar páginas, ofertas, candidatos…"
              autocomplete="off"
              spellcheck="false"
              @keydown.down.prevent="onArrow(1)"
              @keydown.up.prevent="onArrow(-1)"
              @keydown.enter.prevent="onEnter"
              @keydown.esc="hide"
            />
            <kbd class="palette-esc" @click="hide">Esc</kbd>
          </div>

          <!-- Results -->
          <div class="palette-results" v-if="flat.length">
            <div v-for="[group, items] in grouped" :key="group">
              <p class="palette-group-label">{{ group }}</p>
              <button
                v-for="r in items"
                :key="r.id"
                class="palette-item"
                :class="{ 'palette-item--active': cursorFor(r) === cursor }"
                @mouseenter="cursor = cursorFor(r)"
                @click="select(r)"
              >
                <!-- Icon -->
                <div class="palette-icon">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <template v-if="r.icon === 'grid'">
                      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                      <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                    </template>
                    <template v-else-if="r.icon === 'briefcase'">
                      <rect x="2" y="7" width="20" height="14" rx="2"/>
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    </template>
                    <template v-else-if="r.icon === 'layers'">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                      <polyline points="2 17 12 22 22 17"/>
                      <polyline points="2 12 12 17 22 12"/>
                    </template>
                    <template v-else-if="r.icon === 'users'">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </template>
                    <template v-else-if="r.icon === 'user'">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </template>
                    <template v-else-if="r.icon === 'bar-chart'">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
                    </template>
                    <template v-else-if="r.icon === 'file-text'">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </template>
                    <template v-else-if="r.icon === 'settings'">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </template>
                    <template v-else-if="r.icon === 'plus'">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </template>
                  </svg>
                </div>

                <!-- Text -->
                <div class="flex-1 min-w-0 text-left">
                  <p class="text-sm font-medium truncate" style="color:var(--text-1);">{{ r.label }}</p>
                  <p v-if="r.sub" class="text-xs truncate" style="color:var(--text-3);">{{ r.sub }}</p>
                </div>

                <!-- Enter indicator (only for active item) -->
                <kbd v-if="cursorFor(r) === cursor" class="palette-kbd">↵</kbd>
              </button>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="query" class="px-4 py-10 text-center text-sm" style="color:var(--text-3);">
            Sin resultados para "<span style="color:var(--text-2);">{{ query }}</span>"
          </div>

          <!-- Footer hint -->
          <div class="palette-footer">
            <span><kbd>↑↓</kbd> Navegar</span>
            <span><kbd>↵</kbd> Seleccionar</span>
            <span><kbd>Esc</kbd> Cerrar</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────── */
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

/* ── Box ───────────────────────────────────────────────────── */
.palette-box {
  width: 100%;
  max-width: 560px;
  margin: 0 1rem;
  background: var(--surface-3);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 1rem;
  box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

/* ── Search bar ────────────────────────────────────────────── */
.palette-search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.palette-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  color: var(--text-1);
  caret-color: var(--accent);
}
.palette-input::placeholder { color: var(--text-3); }

.palette-esc {
  font-size: 0.6875rem;
  color: var(--text-3);
  background: rgba(255,255,255,0.07);
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  padding: 0.1875rem 0.375rem;
  cursor: pointer;
  transition: color 0.1s;
  flex-shrink: 0;
}
.palette-esc:hover { color: var(--text-2); }

/* ── Results ───────────────────────────────────────────────── */
.palette-results {
  overflow-y: auto;
  flex: 1;
  padding: 0.5rem;
}

.palette-group-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text-3);
  text-transform: uppercase;
  padding: 0.5rem 0.5rem 0.25rem;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.1s;
  text-align: left;
}
.palette-item--active { background: rgba(255,255,255,0.07); }
.palette-item:hover   { background: rgba(255,255,255,0.06); }

.palette-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: rgba(255,255,255,0.07);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-2);
}
.palette-item--active .palette-icon {
  background: var(--accent-m);
  color: var(--accent);
}

.palette-kbd {
  font-size: 0.6875rem;
  color: var(--text-3);
  background: rgba(255,255,255,0.07);
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  padding: 0.1875rem 0.375rem;
  flex-shrink: 0;
}

/* ── Footer ────────────────────────────────────────────────── */
.palette-footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem 1rem;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  background: rgba(255,255,255,0.02);
}
.palette-footer span {
  font-size: 0.6875rem;
  color: var(--text-3);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.palette-footer kbd {
  font-size: 0.6875rem;
  color: var(--text-3);
  background: rgba(255,255,255,0.07);
  border: 1px solid var(--border);
  border-radius: 0.25rem;
  padding: 0.125rem 0.3125rem;
}

/* ── Transitions ───────────────────────────────────────────── */
.palette-enter-active { transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.34,1.56,0.64,1); }
.palette-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.palette-enter-from   { opacity: 0; transform: scale(0.95) translateY(-8px); }
.palette-leave-to     { opacity: 0; transform: scale(0.97) translateY(-4px); }
</style>
