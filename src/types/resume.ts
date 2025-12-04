export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  location?: string;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  jobTitle: string;
  startYear: string;
  endYear: string;
  responsibilities: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
}

export interface Education {
  degree: string;
  institution: string;
  graduationYear: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  skills: string[];
  workExperience: WorkExperience[];
  projects: Project[];
  education: Education;
}

export const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
  },
  summary: '',
  skills: [],
  workExperience: [],
  projects: [],
  education: {
    degree: '',
    institution: '',
    graduationYear: '',
  },
};
