-- Migración: añadir rol 'candidate' al enum user_role
-- Ejecutar en Supabase SQL Editor UNA SOLA VEZ
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'candidate';

-- Política RLS para que los candidatos solo vean sus propias aplicaciones
CREATE POLICY "candidates_own_applications" ON applications
  FOR ALL USING (
    candidate_id = auth.uid()
    OR current_role_ats() IN ('admin', 'recruiter', 'manager')
  );

-- Los candidatos pueden ver las ofertas publicadas
CREATE POLICY "candidates_read_published_jobs" ON jobs
  FOR SELECT USING (status = 'published' OR current_role_ats() IN ('admin', 'recruiter', 'manager'));
