-- Fix RLS policies: Change from RESTRICTIVE to PERMISSIVE
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can insert resumes" ON public.resumes;
DROP POLICY IF EXISTS "Anyone can read resumes" ON public.resumes;
DROP POLICY IF EXISTS "Anyone can update resumes" ON public.resumes;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Anyone can insert resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read resumes"
  ON public.resumes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update resumes"
  ON public.resumes FOR UPDATE
  USING (true);