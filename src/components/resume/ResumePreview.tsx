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
        className="resume-document bg-white shadow-elevated rounded-xl overflow-hidden relative"
        style={{
          width: "595px",
          minHeight: "842px",
          fontFamily: "'Open Sans', sans-serif"
        }}
      >
        {/* Watermark - Centered within resume container, appears on all pages */}
        <div
          className="watermark-container"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        >
          <img
            src="/solidpro.svg"
            alt="SOLiDPRO Watermark"
            style={{
              width: '200px',
              objectFit: 'contain',
              opacity: 0.05
            }}
          />
        </div>

        {/* SVG Header - Fixed position to appear on all pages */}
        <div
          className="svg-header-container"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <svg width="227" height="183" viewBox="0 0 227 183" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M167.459 0H0V141.347C6.2389 41.2263 114.168 4.67516 167.459 0Z" fill="#16469D"></path>
            <path d="M227 0C58.8136 7.81475 6.44886 124.095 0 181.259V157.38V132.417C18.0568 33.6469 113.5 3.25615 159.932 0H227Z" fill="#ED1B2F"></path>
          </svg>
        </div>

        {/* Content */}
        <div className="px-10 pt-2 pb-6 relative" style={{ wordWrap: "break-word", overflowWrap: "break-word", zIndex: 2 }}>
          {/* Personal Info */}
          <div className="mb-6" style={{ maxWidth: "100%", paddingTop: "40px" }}>
            <h1 className="text-2xl font-bold text-gray-900 break-words" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              {personalInfo.fullName || ""}
            </h1>
            <div className="space-y-0.5 mt-1">
              {personalInfo.email && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">Email Id:</span> {personalInfo.email}
                </p>
              )}
              {education.degree && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">Education:</span> {education.degree}
                  {education.institution && ` from ${education.institution}`}
                </p>
              )}
              {personalInfo.phone && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">Phone:</span> {personalInfo.phone}
                </p>
              )}
              {personalInfo.linkedin && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">LinkedIn:</span> {personalInfo.linkedin}
                </p>
              )}
              {personalInfo.location && (
                <p className="text-sm text-gray-700 break-words">
                  <span className="font-semibold">Location:</span> {personalInfo.location}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2 tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                SUMMARY
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed text-justify break-words" style={{ textIndent: "2rem" }}>
                {summary}
              </p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                SKILLS
              </h2>
              <div className="space-y-1.5">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-4 h-4 border border-gray-400 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-gray-600" />
                    </div>
                    <span className="break-words">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {workExperience.length > 0 && (
            <div className="mb-6 break-inside-avoid">
              <h2 className="text-lg font-bold text-gray-900 mb-3 tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                WORK EXPERIENCE
              </h2>
              <div className="space-y-4">
                {workExperience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid-page">
                    <h3 className="font-bold text-sm text-gray-900 break-words">
                      {exp.companyName.toUpperCase()} — {exp.jobTitle} | {exp.startYear}–{exp.endYear}
                    </h3>
                    {exp.responsibilities.length > 0 && (
                      <ul className="mt-1 space-y-1">
                        {exp.responsibilities
                          .filter(resp => resp.trim() !== '') // Filter out empty responsibilities
                          .map((resp, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex break-inside-avoid">
                              <span className="mr-2 flex-shrink-0">•</span>
                              <span className="break-words">{resp}</span>
                            </li>
                          ))
                        }
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
              <h2 className="text-lg font-bold text-gray-900 mb-3 tracking-wide" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                PROJECTS
              </h2>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="break-inside-avoid">
                    <h3 className="font-bold text-sm text-gray-900 break-words">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1 break-words">
                      <span className="font-medium">Description:</span> {project.description}
                    </p>
                    <p className="text-sm text-gray-700 break-words">
                      <span className="font-medium">Tech Stack:</span> {project.technologies}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <style>
          {`
            @media print {
              .break-inside-avoid {
                break-inside: avoid;
              }
              .break-inside-avoid-page {
                break-inside: avoid-page;
              }
              
              /* Ensure SVG header appears on all pages */
              .svg-header-container {
                position: fixed !important;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              
              /* Ensure content has proper z-index */
              .resume-document > div {
                position: relative;
                z-index: 2;
              }
            }
          `}
        </style>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";
