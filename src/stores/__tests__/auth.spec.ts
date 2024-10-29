import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts unauthenticated', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.profile).toBeNull()
  })

  it('devLogin sets a profile with the given role', () => {
    const auth = useAuthStore()
    auth.devLogin('recruiter')
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.profile?.role).toBe('recruiter')
    expect(auth.isRecruiter).toBe(true)
    expect(auth.isAdmin).toBe(false)
  })

  it('admin role grants all permissions', () => {
    const auth = useAuthStore()
    auth.devLogin('admin')
    expect(auth.isAdmin).toBe(true)
    expect(auth.isRecruiter).toBe(true)
    expect(auth.isManager).toBe(true)
  })

  it('login succeeds with valid mock email', async () => {
    const auth = useAuthStore()
    const ok = await auth.login('admin@talentflow.dev', 'any')
    expect(ok).toBe(true)
    expect(auth.isAuthenticated).toBe(true)
  })

  it('login fails with unknown email', async () => {
    const auth = useAuthStore()
    const ok = await auth.login('unknown@example.com', 'pass')
    expect(ok).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toBeTruthy()
  })

  it('logout clears profile', async () => {
    const auth = useAuthStore()
    auth.devLogin('admin')
    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.profile).toBeNull()
  })

  it('initials computed from full_name', () => {
    const auth = useAuthStore()
    auth.devLogin('admin')
    expect(auth.initials).toMatch(/^[A-Z]{1,2}$/)
  })
})
