import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { SummaryForm } from "./SummaryForm";
import { SkillsForm } from "./SkillsForm";
import { WorkExperienceForm } from "./WorkExperienceForm";
import { ProjectsForm } from "./ProjectsForm";
import { EducationForm } from "./EducationForm";
import { ResumePreview } from "./ResumePreview";
import { StepIndicator } from "./StepIndicator";
import { ResumeData, initialResumeData } from "@/types/resume";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  User,
  FileText,
  Wrench,
  Briefcase,
  FolderCode,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Download,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

const steps = [
  { id: 1, title: "Personal", icon: <User className="w-5 h-5" /> },
  { id: 2, title: "Summary", icon: <FileText className="w-5 h-5" /> },
  { id: 3, title: "Skills", icon: <Wrench className="w-5 h-5" /> },
  { id: 4, title: "Experience", icon: <Briefcase className="w-5 h-5" /> },
  { id: 5, title: "Projects", icon: <FolderCode className="w-5 h-5" /> },
  { id: 6, title: "Education", icon: <GraduationCap className="w-5 h-5" /> },
];

export function ResumeForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [showPreview, setShowPreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateForm = (): boolean => {
    const { personalInfo, summary, skills, education } = resumeData;
    
    if (!personalInfo.fullName.trim()) {
      toast.error("Please enter your full name");
      setCurrentStep(0);
      return false;
    }
    if (!personalInfo.email.trim()) {
      toast.error("Please enter your email");
      setCurrentStep(0);
      return false;
    }
    if (!personalInfo.phone.trim()) {
      toast.error("Please enter your phone number");
      setCurrentStep(0);
      return false;
    }
    if (!summary.trim()) {
      toast.error("Please add a professional summary");
      setCurrentStep(1);
      return false;
    }
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      setCurrentStep(2);
      return false;
    }
    if (!education.degree.trim()) {
      toast.error("Please add your education details");
      setCurrentStep(5);
      return false;
    }
    return true;
  };

  const generatePDF = async () => {
    if (!validateForm()) return;
    if (!previewRef.current) return;

    setIsGenerating(true);
    toast.loading("Generating your resume...");

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`);

      toast.dismiss();
      toast.success("Resume generated successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to generate PDF. Please try again.");
      console.error("PDF generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoForm
            data={resumeData.personalInfo}
            onChange={(data) =>
              setResumeData({ ...resumeData, personalInfo: data })
            }
          />
        );
      case 1:
        return (
          <SummaryForm
            value={resumeData.summary}
            onChange={(summary) => setResumeData({ ...resumeData, summary })}
          />
        );
      case 2:
        return (
          <SkillsForm
            skills={resumeData.skills}
            onChange={(skills) => setResumeData({ ...resumeData, skills })}
          />
        );
      case 3:
        return (
          <WorkExperienceForm
            experiences={resumeData.workExperience}
            onChange={(workExperience) =>
              setResumeData({ ...resumeData, workExperience })
            }
          />
        );
      case 4:
        return (
          <ProjectsForm
            projects={resumeData.projects}
            onChange={(projects) => setResumeData({ ...resumeData, projects })}
          />
        );
      case 5:
        return (
          <EducationForm
            data={resumeData.education}
            onChange={(education) => setResumeData({ ...resumeData, education })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-display bg-gradient-to-r from-solidpro-red to-solidpro-blue bg-clip-text text-transparent">
              SolidPro Resume Builder
            </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="hidden lg:flex"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
              <Button
                variant="gradient"
                size="lg"
                onClick={generatePDF}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
        />

        <div className={`grid gap-8 ${showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1 max-w-2xl mx-auto"}`}>
          {/* Form Section */}
          <div className="bg-card rounded-2xl shadow-card p-6 lg:p-8">
            {renderCurrentStep()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button variant="secondary" onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={generatePDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Resume
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="hidden lg:block sticky top-24">
              <div className="bg-muted rounded-2xl p-4 h-fit">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                  Live Preview
                </h3>
                <div className="transform scale-[0.6] origin-top">
                  <ResumePreview ref={previewRef} data={resumeData} />
                </div>
              </div>
            </div>
          )}

          {/* Hidden full-size preview for PDF generation */}
          {!showPreview && (
            <div className="fixed -left-[9999px] top-0">
              <ResumePreview ref={previewRef} data={resumeData} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
