/**
 * Vitest global setup.
 * Mockea el cliente de Supabase para que los tests de stores no necesiten
 * WebSocket ni conexión real — los stores usan datos mock cuando
 * VITE_SUPABASE_URL no está configurado.
 */
import { vi } from 'vitest'

// El cliente Supabase intenta inicializar Realtime (WebSocket) al importarse.
// En el entorno de test (Node.js) eso falla, así que mockeamos el módulo entero.
vi.mock('@/lib/supabase', () => {
  const chainable = {
    select:  () => chainable,
    insert:  () => chainable,
    update:  () => chainable,
    delete:  () => chainable,
    eq:      () => chainable,
    single:  () => Promise.resolve({ data: null, error: null }),
    order:   () => Promise.resolve({ data: [], error: null }),
  }

  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signOut:            vi.fn().mockResolvedValue({ error: null }),
        getSession:         vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange:  vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        }),
      },
      from: vi.fn().mockReturnValue(chainable),
    },
  }
})
