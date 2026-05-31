<script setup lang="ts">
import { ref } from 'vue'
import type { TemplateType } from '@/types'

interface Template { id: string; name: string; type: TemplateType; content: string; created_at: string }

const templates = ref<Template[]>([
  {
    id: 't1',
    name: 'Oferta estándar IT',
    type: 'job',
    content: `**[Título del puesto]** en [Empresa]

Buscamos un/a [rol] con experiencia en [tecnología] para unirse a nuestro equipo de [departamento].

**Responsabilidades:**
- [Responsabilidad 1]
- [Responsabilidad 2]

**Requisitos:**
- [Requisito 1]
- [Requisito 2]

**Ofrecemos:**
- Salario competitivo
- Trabajo híbrido
- Formación continua`,
    created_at: '2024-10-01',
  },
  {
    id: 't2',
    name: 'Evaluación técnica',
    type: 'evaluation',
    content: `## Evaluación técnica

**Candidato:** [Nombre]
**Oferta:** [Puesto]
**Fecha:** [Fecha]

### Habilidades técnicas (1-5)
- Conocimiento del stack: __/5
- Calidad del código: __/5
- Problem solving: __/5

### Habilidades blandas (1-5)
- Comunicación: __/5
- Trabajo en equipo: __/5

### Comentarios generales
[Escribe aquí tus observaciones]

### Recomendación
[ ] Avanzar   [ ] En espera   [ ] Descartar`,
    created_at: '2024-10-05',
  },
  {
    id: 't3',
    name: 'Oferta remoto',
    type: 'job',
    content: `**[Título]** — Posición 100% remota

Estamos buscando a [perfil] para trabajar en remoto con nuestro equipo distribuido.

**Lo que harás:**
- [Tarea principal]

**Lo que necesitamos:**
- Experiencia mínima de [N] años
- Buenas habilidades de comunicación escrita
- Disponibilidad para reuniones en [zona horaria]

**Lo que ofrecemos:**
- Salario: [rango]€/año
- Horario flexible
- Equipo subvencionado`,
    created_at: '2024-10-12',
  },
])

const showForm  = ref(false)
const editId    = ref<string | null>(null)
const form = ref({ name: '', type: 'job' as TemplateType, content: '' })

function startNew() {
  form.value = { name: '', type: 'job', content: '' }
  editId.value = null
  showForm.value = true
}

function startEdit(t: Template) {
  form.value = { name: t.name, type: t.type, content: t.content }
  editId.value = t.id
  showForm.value = true
}

function save() {
  if (!form.value.name.trim()) return
  if (editId.value) {
    const idx = templates.value.findIndex(t => t.id === editId.value)
    if (idx !== -1) Object.assign(templates.value[idx], form.value)
  } else {
    templates.value.unshift({
      ...form.value,
      id: `t${Date.now()}`,
      created_at: new Date().toISOString().slice(0, 10),
    })
  }
  showForm.value = false
}

function remove(id: string) {
  templates.value = templates.value.filter(t => t.id !== id)
}
</script>

<template>
  <div class="space-y-5 max-w-4xl mx-auto">

    <div class="flex justify-end">
      <button class="btn btn-primary" @click="startNew">+ Nueva plantilla</button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="card">
      <div class="card-header flex items-center justify-between">
        <h3 class="text-sm font-semibold" style="color:var(--text-1);">
          {{ editId ? 'Editar plantilla' : 'Nueva plantilla' }}
        </h3>
        <button class="btn btn-ghost btn-sm" @click="showForm = false">Cancelar</button>
      </div>
      <div class="card-body space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Nombre</label>
            <input v-model="form.name" type="text" class="form-input" placeholder="Nombre de la plantilla" />
          </div>
          <div>
            <label class="form-label">Tipo</label>
            <select v-model="form.type" class="form-input">
              <option value="job">Oferta de empleo</option>
              <option value="evaluation">Evaluación</option>
            </select>
          </div>
        </div>
        <div>
          <label class="form-label">Contenido (Markdown)</label>
          <textarea v-model="form.content" rows="12" class="form-input font-mono text-xs resize-none" />
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn btn-secondary" @click="showForm = false">Cancelar</button>
          <button class="btn btn-primary" @click="save">Guardar</button>
        </div>
      </div>
    </div>

    <!-- Template list -->
    <div class="grid sm:grid-cols-2 gap-4">
      <div
        v-for="t in templates"
        :key="t.id"
        class="card group"
        style="transition:border-color .15s;"
        @mouseenter="($el as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'"
        @mouseleave="($el as HTMLElement).style.borderColor = ''"
      >
        <div class="p-5">
          <div class="flex items-start justify-between mb-3">
            <div>
              <span :class="['badge', t.type === 'job' ? 'badge-blue' : 'badge-violet']">
                {{ t.type === 'job' ? 'Oferta' : 'Evaluación' }}
              </span>
              <h4 class="font-semibold mt-2 text-sm" style="color:var(--text-1);">{{ t.name }}</h4>
              <p class="text-xs mt-0.5" style="color:var(--text-3);">Creada el {{ t.created_at }}</p>
            </div>
          </div>
          <pre
            class="text-xs rounded-lg p-2 line-clamp-3 overflow-hidden font-mono whitespace-pre-wrap"
            style="background:rgba(255,255,255,0.04);color:var(--text-2);"
          >{{ t.content.slice(0, 120) }}...</pre>
          <div class="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="btn btn-secondary btn-sm" @click="startEdit(t)">Editar</button>
            <button class="btn btn-ghost btn-sm" style="color:#f87171;" @click="remove(t.id)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
