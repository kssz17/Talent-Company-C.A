import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // ── Pública ──────────────────────────────────────────────
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true },
    },

    // ── ATS (admin / recruiter / manager) ────────────────────
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true, staffOnly: true },
      children: [
        { path: '',           name: 'dashboard',        component: () => import('@/views/DashboardView.vue') },
        { path: 'jobs',       name: 'jobs',             component: () => import('@/views/jobs/JobsView.vue') },
        { path: 'jobs/new',   name: 'jobs-new',         component: () => import('@/views/jobs/JobFormView.vue') },
        { path: 'jobs/:id',   name: 'jobs-detail',      component: () => import('@/views/jobs/JobDetailView.vue') },
        { path: 'jobs/:id/edit', name: 'jobs-edit',     component: () => import('@/views/jobs/JobFormView.vue') },
        { path: 'pipeline/:jobId?', name: 'pipeline',   component: () => import('@/views/pipeline/PipelineView.vue') },
        { path: 'candidates', name: 'candidates',       component: () => import('@/views/candidates/CandidatesView.vue') },
        { path: 'candidates/:id', name: 'candidates-detail', component: () => import('@/views/candidates/CandidateDetailView.vue') },
        { path: 'reports',    name: 'reports',          component: () => import('@/views/ReportsView.vue') },
        { path: 'templates',  name: 'templates',        component: () => import('@/views/TemplatesView.vue') },
        { path: 'settings',   name: 'settings',         component: () => import('@/views/SettingsView.vue') },
      ],
    },

    // ── Portal candidato ─────────────────────────────────────
    {
      path: '/portal',
      component: () => import('@/layouts/CandidateLayout.vue'),
      meta: { requiresAuth: true, candidateOnly: true },
      children: [
        { path: '',         name: 'portal-jobs',      component: () => import('@/views/portal/JobBoardView.vue') },
        { path: 'jobs/:id', name: 'portal-job-detail',component: () => import('@/views/portal/JobDetailPublicView.vue') },
        { path: 'mis-solicitudes', name: 'portal-applications', component: () => import('@/views/portal/MyApplicationsView.vue') },
        { path: 'perfil',   name: 'portal-profile',   component: () => import('@/views/portal/CandidateProfileView.vue') },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Sin sesión → login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  // Ya autenticado en /login → redirigir al panel correcto
  if (to.name === 'login' && auth.isAuthenticated) {
    return auth.isCandidate ? { name: 'portal-jobs' } : { name: 'dashboard' }
  }

  // Candidato intentando acceder al ATS → portal
  if (to.meta.staffOnly && auth.isCandidate) {
    return { name: 'portal-jobs' }
  }

  // Staff intentando acceder al portal → dashboard
  if (to.meta.candidateOnly && auth.isStaff) {
    return { name: 'dashboard' }
  }
})

export default router
