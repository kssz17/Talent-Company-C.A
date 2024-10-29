import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'jobs',
          name: 'jobs',
          component: () => import('@/views/jobs/JobsView.vue'),
        },
        {
          path: 'jobs/new',
          name: 'jobs-new',
          component: () => import('@/views/jobs/JobFormView.vue'),
        },
        {
          path: 'jobs/:id',
          name: 'jobs-detail',
          component: () => import('@/views/jobs/JobDetailView.vue'),
        },
        {
          path: 'jobs/:id/edit',
          name: 'jobs-edit',
          component: () => import('@/views/jobs/JobFormView.vue'),
        },
        {
          path: 'pipeline/:jobId?',
          name: 'pipeline',
          component: () => import('@/views/pipeline/PipelineView.vue'),
        },
        {
          path: 'candidates',
          name: 'candidates',
          component: () => import('@/views/candidates/CandidatesView.vue'),
        },
        {
          path: 'candidates/:id',
          name: 'candidates-detail',
          component: () => import('@/views/candidates/CandidateDetailView.vue'),
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('@/views/ReportsView.vue'),
        },
        {
          path: 'templates',
          name: 'templates',
          component: () => import('@/views/TemplatesView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
