import { forwardRef } from "react";
import { ResumeData } from "@/types/resume";
import { Check } from "lucide-react";

interface ResumePreviewProps {
  data: ResumeData;
}

export const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ data }, ref) => {
    const { personalInfo, summary, skills, workExperience, projects, education } = data;

    return (
      <div
        ref={ref}
        className="resume-document w-full bg-white shadow-elevated rounded-xl overflow-hidden"
        style={{ minHeight: "842px" }}
      >
        {/* Header with curved design */}
        <div className="relative h-16 overflow-hidden">
          <svg
            viewBox="0 0 595 60"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 L595,0 L595,30 Q500,60 350,45 Q200,30 100,50 Q50,60 0,50 Z"
              fill="#E53935"
            />
            <path
              d="M595,0 L595,25 Q550,40 500,35 Q450,30 400,40 L400,0 Z"
              fill="#1565C0"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="px-10 py-6 relative">
          {/* Watermark */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
            <svg viewBox="0 0 200 100" className="w-64 h-32">
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" 
                    className="fill-gray-400 font-display font-bold text-3xl tracking-wider">
                SOLiDPRO
              </text>
            </svg>
          </div>

          {/* Personal Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              {personalInfo.fullName || "Your Name"}
            </h1>
            {personalInfo.email && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Email Id:</span> {personalInfo.email}
              </p>
            )}
            {education.degree && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Education:</span> {education.degree}
                {education.institution && ` from ${education.institution}`}
              </p>
            )}
            {personalInfo.phone && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Phone:</span> {personalInfo.phone}
              </p>
            )}
            {personalInfo.linkedin && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">LinkedIn:</span> {personalInfo.linkedin}
              </p>
            )}
            {personalInfo.location && (
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Location:</span> {personalInfo.location}
              </p>
            )}
          </div>

          {/* Summary */}
          {summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2 font-display tracking-wide">
                SUMMARY
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed text-justify indent-8">
                {summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-display tracking-wide">
                SKILLS
              </h2>
              <div className="space-y-1.5">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-4 h-4 border border-gray-400 rounded-sm flex items-center justify-center">
                      <Check className="w-3 h-3 text-gray-600" />
                    </div>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-display tracking-wide">
                WORK EXPERIENCE
              </h2>
              <div className="space-y-4">
                {workExperience.map((exp) => (
                  <div key={exp.id}>
                    <h3 className="font-bold text-sm text-gray-900">
                      {exp.companyName.toUpperCase()} — {exp.jobTitle} | {exp.startYear}–{exp.endYear}
                    </h3>
                    {exp.responsibilities.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {exp.responsibilities.map((resp, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex">
                            <span className="mr-2">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 font-display tracking-wide">
                PROJECTS
              </h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-bold text-sm text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Description:</span> {project.description}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Tech Stack:</span> {project.technologies}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto px-10 pb-4">
          <div className="flex items-center gap-2 border-t-4 border-[#E53935] pt-4">
            <svg viewBox="0 0 150 30" className="h-8">
              <text x="0" y="22" className="font-display font-extrabold text-2xl">
                <tspan fill="#E53935">SOLiD</tspan>
                <tspan fill="#1565C0">PRO</tspan>
              </text>
            </svg>
          </div>
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
