-- Migración: añadir rol 'candidate' al enum user_role
-- Seguro de ejecutar varias veces (idempotente)

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'candidate';

-- Actualizar el trigger para leer el rol desde los metadatos del usuario.
-- CREATE OR REPLACE es seguro — reemplaza la función si ya existe.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  _role user_role;
BEGIN
  _role := CASE coalesce(new.raw_user_meta_data->>'role', '')
    WHEN 'recruiter' THEN 'recruiter'::user_role
    WHEN 'candidate' THEN 'candidate'::user_role
    ELSE 'candidate'::user_role
  END;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    _role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- DROP antes de CREATE para que sea idempotente
-- (PostgreSQL no tiene CREATE OR REPLACE POLICY)
DROP POLICY IF EXISTS "candidates_own_applications" ON applications;
CREATE POLICY "candidates_own_applications" ON applications
  FOR ALL USING (
    candidate_id = auth.uid()
    OR current_role_ats() IN ('admin', 'recruiter', 'manager')
  );

DROP POLICY IF EXISTS "candidates_read_published_jobs" ON jobs;
CREATE POLICY "candidates_read_published_jobs" ON jobs
  FOR SELECT USING (
    status = 'published'
    OR current_role_ats() IN ('admin', 'recruiter', 'manager')
  );
