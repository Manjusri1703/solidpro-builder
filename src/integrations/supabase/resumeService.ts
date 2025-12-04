
import type { ResumeData, WorkExperience, Project, Education } from '@/types/resume';
import {supabase} from './client';

// Get the current user's resume
export const getResume = async (): Promise<ResumeData | null> => {
  const { data: resumeData, error } = await supabase
    .from('resumes')
    .select(`
      *,
      work_experiences (*),
      projects (*),
      education (*)
    `)
    .single<{
      id: string;
      user_id: string;
      personal_info: ResumeData['personalInfo'];
      summary: string | null;
      skills: string[] | null;
      work_experiences: Array<Omit<WorkExperience, 'id'> & { id: string }> | null;
      projects: Array<Omit<Project, 'id'> & { id: string }> | null;
      education: Array<Omit<Education, 'id'> & { id: string }> | null;
    }>();

  if (error) {
    console.error('Error fetching resume:', error);
    return null;
  }

  if (!resumeData) return null;

  return {
    personalInfo: resumeData.personal_info,
    summary: resumeData.summary || '',
    skills: resumeData.skills || [],
    workExperience: resumeData.work_experiences || [],
    projects: resumeData.projects || [],
    education: resumeData.education?.[0] || { degree: '', institution: '', graduationYear: '' },
  };
};

// Create or update resume
export const saveResume = async (resumeData: ResumeData): Promise<boolean> => {
  console.log('Starting saveResume with data:', JSON.stringify(resumeData, null, 2));
  
  // Check for existing resume
  console.log('Checking for existing resume...');
  const { data: existingResume, error: fetchError } = await supabase
    .from('resumes')
    .select('id')
    .single();
    
  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error checking for existing resume:', fetchError);
    return false;
  }
  
  console.log('Existing resume check result:', existingResume ? `Found resume with ID: ${existingResume.id}` : 'No existing resume found');

  const resumePayload = {
    personal_info: resumeData.personalInfo as any, // Cast to any to handle JSON type
    summary: resumeData.summary,
    skills: resumeData.skills,
  };
  
  console.log('Prepared resume payload:', JSON.stringify(resumePayload, null, 2));

  let resumeId: string;

  if (existingResume) {
    // Update existing resume
    console.log(`Updating existing resume with ID: ${existingResume.id}`);
    const { data: updateData, error: resumeError } = await supabase
      .from('resumes')
      .update(resumePayload)
      .eq('id', existingResume.id)
      .select();

    if (resumeError) {
      console.error('Error updating resume:', {
        error: resumeError,
        details: resumeError.details,
        hint: resumeError.hint,
        code: resumeError.code
      });
      return false;
    }
    console.log('Successfully updated resume:', updateData);
    resumeId = existingResume.id;
  } else {
    // Create new resume
    console.log('Creating new resume...');
    const { data: newResume, error: resumeError } = await supabase
      .from('resumes')
      .insert([resumePayload])
      .select()
      .single();

    if (resumeError) {
      console.error('Error creating resume:', {
        error: resumeError,
        details: resumeError.details,
        hint: resumeError.hint,
        code: resumeError.code
      });
      return false;
    }
    console.log('Successfully created new resume:', newResume);
    resumeId = newResume.id;
  }

  // Update work experiences
  if (resumeData.workExperience) {
    // Delete existing work experiences
    await supabase
      .from('work_experiences')
      .delete()
      .eq('resume_id', resumeId);

    // Insert new work experiences
    if (resumeData.workExperience.length > 0) {
      const workExperiences = resumeData.workExperience.map(exp => ({
        company_name: exp.companyName,
        job_title: exp.jobTitle,
        start_year: exp.startYear,
        end_year: exp.endYear,
        responsibilities: exp.responsibilities,
        resume_id: resumeId,
      }));

      const { error: workExpError } = await supabase
        .from('work_experiences')
        .insert(workExperiences);

      if (workExpError) {
        console.error('Error saving work experiences:', workExpError);
        return false;
      }
    }
  }

  // Update projects
  if (resumeData.projects) {
    // Delete existing projects
    await supabase
      .from('projects')
      .delete()
      .eq('resume_id', resumeId);

    // Insert new projects
    if (resumeData.projects.length > 0) {
      const projects = resumeData.projects.map(project => ({
        name: project.name,
        description: project.description,
        technologies: project.technologies,
        resume_id: resumeId,
      }));

      const { error: projectsError } = await supabase
        .from('projects')
        .insert(projects);

      if (projectsError) {
        console.error('Error saving projects:', projectsError);
        return false;
      }
    }
  }

  // Update education
  if (resumeData.education) {
    // Delete existing education
    await supabase
      .from('education')
      .delete()
      .eq('resume_id', resumeId);

    // Insert new education
    const { error: educationError } = await supabase
      .from('education')
      .insert([{ 
        degree: resumeData.education.degree,
        institution: resumeData.education.institution,
        graduation_year: resumeData.education.graduationYear,
        resume_id: resumeId 
      }]);

    if (educationError) {
      console.error('Error saving education:', educationError);
      return false;
    }
  }

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
