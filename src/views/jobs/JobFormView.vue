<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { mockDepartments } from '@/lib/mock'
import type { JobType, WorkMode, JobStatus } from '@/types'

const route  = useRoute()
const router = useRouter()
const store  = useJobsStore()
const auth   = useAuthStore()

const isEdit = computed(() => Boolean(route.params.id))

const form = ref({
  title:         '',
  department_id: '',
  description:   '',
  requirements:  '',
  status:        'draft' as JobStatus,
  type:          'full-time' as JobType,
  work_mode:     'hybrid' as WorkMode,
  location:      '',
  salary_min:    null as number | null,
  salary_max:    null as number | null,
})

const errors = ref<Partial<Record<keyof typeof form.value, string>>>({})
const saving = ref(false)

onMounted(() => {
  if (isEdit.value) {
    const job = store.getById(String(route.params.id))
    if (job) {
      Object.assign(form.value, {
        title:         job.title,
        department_id: job.department_id ?? '',
        description:   job.description,
        requirements:  job.requirements,
        status:        job.status,
        type:          job.type,
        work_mode:     job.work_mode,
        location:      job.location,
        salary_min:    job.salary_min,
        salary_max:    job.salary_max,
      })
    }
  }
})

function validate() {
  errors.value = {}
  if (!form.value.title.trim())       errors.value.title       = 'El título es obligatorio'
  if (!form.value.description.trim()) errors.value.description = 'La descripción es obligatoria'
  if (!form.value.location.trim())    errors.value.location    = 'La ubicación es obligatoria'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return
  saving.value = true
  if (isEdit.value) {
    await store.update(String(route.params.id), { ...form.value })
    router.push({ name: 'jobs-detail', params: { id: route.params.id } })
  } else {
    const job = await store.create({
      ...form.value,
      template_id:  null,
      created_by:   auth.profile?.id ?? '',
      published_at: form.value.status === 'published' ? new Date().toISOString() : null,
      closed_at:    null,
    })
    router.push({ name: 'jobs-detail', params: { id: job.id } })
  }
  saving.value = false
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6 flex items-center gap-3">
      <button class="btn btn-ghost btn-sm" @click="router.back()">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Volver
      </button>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="text-base font-semibold">{{ isEdit ? 'Editar oferta' : 'Nueva oferta de empleo' }}</h2>
      </div>

      <form class="card-body space-y-5" @submit.prevent="submit">
        <!-- Title -->
        <div>
          <label class="form-label">Título del puesto *</label>
          <input v-model="form.title" type="text" class="form-input" placeholder="ej. Frontend Developer Vue.js" />
          <p v-if="errors.title" class="form-error">{{ errors.title }}</p>
        </div>

        <!-- Department + Type row -->
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Departamento</label>
            <select v-model="form.department_id" class="form-input">
              <option value="">Sin departamento</option>
              <option v-for="d in mockDepartments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">Tipo de contrato</label>
            <select v-model="form.type" class="form-input">
              <option value="full-time">Jornada completa</option>
              <option value="part-time">Media jornada</option>
              <option value="contract">Contrato temporal</option>
              <option value="internship">Prácticas</option>
            </select>
          </div>
        </div>

        <!-- Location + Work mode -->
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Ubicación *</label>
            <input v-model="form.location" type="text" class="form-input" placeholder="ej. Madrid, España" />
            <p v-if="errors.location" class="form-error">{{ errors.location }}</p>
          </div>
          <div>
            <label class="form-label">Modalidad</label>
            <select v-model="form.work_mode" class="form-input">
              <option value="on-site">Presencial</option>
              <option value="remote">Remoto</option>
              <option value="hybrid">Híbrido</option>
            </select>
          </div>
        </div>

        <!-- Salary range -->
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="form-label">Salario mínimo (€/año)</label>
            <input v-model.number="form.salary_min" type="number" class="form-input" placeholder="30000" />
          </div>
          <div>
            <label class="form-label">Salario máximo (€/año)</label>
            <input v-model.number="form.salary_max" type="number" class="form-input" placeholder="50000" />
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="form-label">Descripción del puesto *</label>
          <textarea
            v-model="form.description"
            rows="6"
            class="form-input resize-none"
            placeholder="Describe el rol, responsabilidades, equipo..."
          />
          <p v-if="errors.description" class="form-error">{{ errors.description }}</p>
        </div>

        <!-- Requirements -->
        <div>
          <label class="form-label">Requisitos</label>
          <textarea
            v-model="form.requirements"
            rows="4"
            class="form-input resize-none"
            placeholder="Lista los requisitos, uno por línea..."
          />
          <p class="form-hint">Puedes usar - para listas. Ej: - Vue 3 + TypeScript</p>
        </div>

        <!-- Status -->
        <div>
          <label class="form-label">Estado de publicación</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.status" type="radio" value="draft" class="text-primary-600" />
              <span class="text-sm text-slate-700">Guardar como borrador</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="form.status" type="radio" value="published" class="text-primary-600" />
              <span class="text-sm text-slate-700">Publicar inmediatamente</span>
            </label>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" class="btn btn-secondary" @click="router.back()">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="saving">Guardando...</span>
            <span v-else>{{ isEdit ? 'Guardar cambios' : 'Crear oferta' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
