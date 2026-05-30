import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import { mockProfiles } from '@/lib/mock'

// Detecta si el proyecto tiene credenciales reales de Supabase.
// Si no las tiene, usa datos mock para poder desarrollar sin backend.
const useMock = !!import.meta.env.VITEST ||
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('your-project')

export const useAuthStore = defineStore('auth', () => {
  const profile  = ref<Profile | null>(null)
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  // ── Computed ──────────────────────────────────────────────

  const isAuthenticated = computed(() => profile.value !== null)
  const isCandidate = computed(() => profile.value?.role === 'candidate')
  const isStaff     = computed(() => ['admin', 'recruiter', 'manager'].includes(profile.value?.role ?? ''))
  const isAdmin     = computed(() => profile.value?.role === 'admin')
  const isRecruiter = computed(() => ['admin', 'recruiter'].includes(profile.value?.role ?? ''))
  const isManager   = computed(() => ['admin', 'manager'].includes(profile.value?.role ?? ''))
  const displayName = computed(() => profile.value?.full_name ?? profile.value?.email ?? '')
  const initials    = computed(() =>
    (profile.value?.full_name ?? '')
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase() || '?',
  )

  // ── Auth real (Supabase) ──────────────────────────────────

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value   = null

    if (useMock) {
      // TODO: eliminar mock auth cuando el entorno de staging esté listo
      await new Promise(r => setTimeout(r, 500))
      const found = mockProfiles.find(p => p.email === email)
      loading.value = false
      if (found) { profile.value = found; return true }
      error.value = 'Credenciales incorrectas'
      return false
    }

    const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })

    if (authErr || !data.user) {
      error.value   = authErr?.message ?? 'Error de autenticación'
      loading.value = false
      return false
    }

    await _loadProfile(data.user.id)
    loading.value = false
    return true
  }

  async function register(
    fullName: string,
    email: string,
    password: string,
    role: 'recruiter' | 'candidate',
  ): Promise<boolean> {
    loading.value = true
    error.value   = null

    if (useMock) {
      await new Promise(r => setTimeout(r, 600))
      const exists = mockProfiles.find(p => p.email === email)
      if (exists) {
        error.value   = 'Ya existe una cuenta con ese email'
        loading.value = false
        return false
      }
      const newProfile: Profile = {
        id: `u${Date.now()}`,
        email,
        full_name: fullName,
        role,
        avatar_url:   null,
        department_id: null,
        created_at:   new Date().toISOString(),
      }
      mockProfiles.push(newProfile)
      profile.value = newProfile
      loading.value = false
      return true
    }

    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })

    if (authErr || !data.user) {
      error.value   = authErr?.message ?? 'Error al crear la cuenta'
      loading.value = false
      return false
    }

    // Esperar un momento para que el trigger cree el perfil
    await new Promise(r => setTimeout(r, 800))
    await _loadProfile(data.user.id)
    loading.value = false
    return true
  }

  async function logout() {
    if (!useMock) await supabase.auth.signOut()
    profile.value = null
  }

  /**
   * Llama esto en App.vue al montar para restaurar sesiones existentes
   * y escuchar cambios de sesión en tiempo real.
   */
  async function initAuth() {
    if (useMock) {
      // En modo mock, auto-login como admin para ver la app sin login
      devLogin('admin')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await _loadProfile(session.user.id)

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT')              profile.value = null
      if (event === 'SIGNED_IN' && session)    await _loadProfile(session.user.id)
      if (event === 'TOKEN_REFRESHED' && session) await _loadProfile(session.user.id)
    })
  }

  async function _loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*, department:departments(*)')
      .eq('id', userId)
      .single()

    if (data) profile.value = data as unknown as Profile
  }

  // ── Dev helpers ───────────────────────────────────────────

  /** Solo disponible en dev / modo mock */
  function devLogin(role: Profile['role'] = 'admin') {
    profile.value = mockProfiles.find(p => p.role === role) ?? mockProfiles[0]
  }

  return {
    profile, loading, error,
    isAuthenticated, isCandidate, isStaff, isAdmin, isRecruiter, isManager,
    displayName, initials,
    login, register, logout, initAuth, devLogin,
  }
})
