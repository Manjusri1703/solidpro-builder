-- Migration to consolidate all resume data into a single resumes table

-- Add new columns to the resumes table
ALTER TABLE public.resumes 
  ADD COLUMN IF NOT EXISTS work_experiences JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Migrate data from separate tables to the consolidated table
WITH work_exp_agg AS (
  SELECT 
    resume_id,
    jsonb_agg(jsonb_build_object(
      'id', id,
      'company_name', company_name,
      'job_title', job_title,
      'start_year', start_year,
      'end_year', end_year,
      'responsibilities', responsibilities
    )) as experiences
  FROM public.work_experiences
  GROUP BY resume_id
),
education_agg AS (
  SELECT 
    resume_id,
    jsonb_agg(jsonb_build_object(
      'id', id,
      'degree', degree,
      'institution', institution,
      'graduation_year', graduation_year
    ))->0 as edu_data
  FROM public.education
  GROUP BY resume_id
),
projects_agg AS (
  SELECT 
    resume_id,
    jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'description', description,
      'technologies', technologies
    )) as projects_data
  FROM public.projects
  GROUP BY resume_id
)

-- Update the resumes table with the consolidated data
UPDATE public.resumes r SET
  work_experiences = COALESCE(we.experiences, '[]'::jsonb),
  education = COALESCE(ed.edu_data, '{}'::jsonb),
  projects = COALESCE(p.projects_data, '[]'::jsonb),
  full_name = r.personal_info->>'fullName',
  email = r.personal_info->>'email',
  phone = r.personal_info->>'phone',
  linkedin = r.personal_info->>'linkedin',
  location = r.personal_info->>'location'
FROM 
  work_exp_agg we
  LEFT JOIN education_agg ed ON r.id = ed.resume_id
  LEFT JOIN projects_agg p ON r.id = p.resume_id
WHERE 
  r.id = we.resume_id;

-- Drop the now-unnecessary tables
DROP TABLE IF EXISTS public.work_experiences CASCADE;
DROP TABLE IF EXISTS public.education CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- Drop the old personal_info column since we've moved its data to separate columns
ALTER TABLE public.resumes DROP COLUMN IF EXISTS personal_info;

-- Update RLS policies to work with the new schema
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;

-- Recreate RLS policies
CREATE POLICY "Users can view their own resumes"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Update the handle_new_user function to include the new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'user');
  
  -- Create an empty resume for the new user
  INSERT INTO public.resumes (user_id, full_name, email, work_experiences, projects, education, certifications)
  VALUES (new.id, '', new.email, '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, '[]'::jsonb);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
