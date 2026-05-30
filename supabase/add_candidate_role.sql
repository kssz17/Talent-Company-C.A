-- Migración: añadir rol 'candidate' al enum user_role
-- Ejecutar en Supabase SQL Editor UNA SOLA VEZ
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'candidate';

-- Actualizar el trigger para leer el rol desde los metadatos del usuario.
-- Así signUp({ options: { data: { role: 'recruiter' } } }) crea el perfil
-- con el rol correcto. Admin nunca se puede asignar por registro público.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  _role user_role;
BEGIN
  -- Solo permite recruiter o candidate desde el registro público
  _role := CASE coalesce(new.raw_user_meta_data->>'role', '')
    WHEN 'recruiter' THEN 'recruiter'::user_role
    WHEN 'candidate' THEN 'candidate'::user_role
    ELSE 'candidate'::user_role   -- fallback seguro
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

-- Política RLS para que los candidatos solo vean sus propias aplicaciones
CREATE POLICY "candidates_own_applications" ON applications
  FOR ALL USING (
    candidate_id = auth.uid()
    OR current_role_ats() IN ('admin', 'recruiter', 'manager')
  );

-- Los candidatos pueden ver las ofertas publicadas
CREATE POLICY "candidates_read_published_jobs" ON jobs
  FOR SELECT USING (status = 'published' OR current_role_ats() IN ('admin', 'recruiter', 'manager'));
