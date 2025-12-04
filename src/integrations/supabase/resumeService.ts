import type { ResumeData, WorkExperience, Project, Education } from '@/types/resume';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from './types';

// Get the most recent resume
export const getResume = async (): Promise<ResumeData | null> => {
  const { data: resumeData, error } = await supabase
    .from('resumes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching resume:', error);
    return null;
  }

  if (!resumeData) return null;
  
  console.log('Fetched resume data:', JSON.stringify(resumeData, null, 2));

  return {
    personalInfo: {
      fullName: resumeData.full_name,
      email: resumeData.email,
      phone: resumeData.phone || '',
      linkedin: resumeData.linkedin || '',
      location: resumeData.location || '',
    },
    summary: resumeData.summary || '',
    skills: resumeData.skills || [],
    workExperience: (resumeData.work_experience as unknown as WorkExperience[]) || [],
    projects: (resumeData.projects as unknown as Project[]) || [],
    education: (resumeData.education as unknown as Education) || { degree: '', institution: '', graduationYear: '' },
    selectedSvg: 'solidpro',
  };
};

// Save resume to Supabase
export const saveResume = async (resumeData: ResumeData): Promise<boolean> => {
  console.log('Starting saveResume with data:', JSON.stringify(resumeData, null, 2));
  
  const resumePayload = {
    full_name: resumeData.personalInfo.fullName,
    email: resumeData.personalInfo.email,
    phone: resumeData.personalInfo.phone || null,
    linkedin: resumeData.personalInfo.linkedin || null,
    location: resumeData.personalInfo.location || null,
    summary: resumeData.summary,
    skills: resumeData.skills,
    work_experience: resumeData.workExperience as unknown as Json,
    projects: resumeData.projects as unknown as Json,
    education: resumeData.education as unknown as Json,
  };
  
  console.log('Prepared resume payload:', JSON.stringify(resumePayload, null, 2));

  const { data, error } = await supabase
    .from('resumes')
    .insert([resumePayload])
    .select();

  if (error) {
    console.error('Error saving resume:', {
      error,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    return false;
  }
  
  console.log('Successfully saved resume:', data);
  return true;
};

// Subscribe to resume changes
export const subscribeToResumeChanges = (
  callback: (resume: ResumeData | null) => void
) => {
  const subscription = supabase
    .channel('resume_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'resumes',
      },
      async () => {
        const resume = await getResume();
        callback(resume);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
