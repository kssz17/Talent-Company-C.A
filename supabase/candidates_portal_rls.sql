-- Políticas RLS para que los candidatos del portal puedan
-- crearse un registro en la tabla `candidates` y leerlo.
-- Ejecutar en Supabase SQL Editor.

-- Los candidatos pueden buscar su propio registro (para el lookup por email)
DROP POLICY IF EXISTS "candidates_self_lookup" ON candidates;
CREATE POLICY "candidates_self_lookup" ON candidates
  FOR SELECT
  TO authenticated
  USING (
    email = auth.email()
    OR current_role_ats() IN ('admin', 'recruiter', 'manager')
  );

-- Los candidatos pueden crear su propio registro al aplicar por primera vez
DROP POLICY IF EXISTS "candidates_self_register" ON candidates;
CREATE POLICY "candidates_self_register" ON candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (email = auth.email());

-- Los candidatos pueden actualizar su propio registro (teléfono, etc.)
DROP POLICY IF EXISTS "candidates_self_update" ON candidates;
CREATE POLICY "candidates_self_update" ON candidates
  FOR UPDATE
  TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());

-- El staff puede insertar candidatos manualmente (sourcing)
DROP POLICY IF EXISTS "staff_insert_candidates" ON candidates;
CREATE POLICY "staff_insert_candidates" ON candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (current_role_ats() IN ('admin', 'recruiter', 'manager'));

-- El staff puede actualizar cualquier candidato
DROP POLICY IF EXISTS "staff_update_candidates" ON candidates;
CREATE POLICY "staff_update_candidates" ON candidates
  FOR UPDATE
  TO authenticated
  USING (current_role_ats() IN ('admin', 'recruiter', 'manager'));
