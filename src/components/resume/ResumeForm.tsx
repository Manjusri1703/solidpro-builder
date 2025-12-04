import { useState, useRef, useEffect } from "react";
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
import { ArrowLeft, ArrowRight, Briefcase, Download, Eye, EyeOff, FileText, FolderCode, GraduationCap, Loader2, Save, User, Wrench } from "lucide-react";
import html2pdf from "html2pdf.js";

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
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem('resumeData');
    return saved ? JSON.parse(saved) : initialResumeData;
  });
  const [showPreview, setShowPreview] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever resumeData changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      toast.success('Resume saved successfully');
    } catch (error) {
      console.error('Error saving resume:', error);
      toast.error('Failed to save resume');
    } finally {
      setIsSaving(false);
    }
  };

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

const generatePdf = async () => {
  if (!previewRef.current) {
    toast.error("Preview is not ready.");
    return;
  }

  setIsGenerating(true);
  const loadingToast = toast.loading("Generating PDF...");

  try {
    const element = previewRef.current;

    const opt: Html2PdfOptions = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${resumeData.personalInfo.fullName}_Resume.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    await html2pdf().set(opt).from(element).save();

    toast.success("PDF generated successfully!");
  } catch (err) {
    console.error(err);
    toast.error("Failed to generate PDF.");
  } finally {
    toast.dismiss(loadingToast);
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
                onClick={generatePdf}
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
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleSaveResume}
                  disabled={isSaving || isLoading}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="hidden lg:block sticky top-24">
              <div className="bg-muted rounded-2xl p-4 h-fit overflow-hidden">
                <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                  Live Preview
                </h3>
                <div className="flex justify-center">
                  <div className="transform scale-[0.55] origin-top" style={{ width: "595px", height: "auto" }}>
                    <ResumePreview data={resumeData} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden full-size preview for PDF generation - always rendered */}
        <div className="fixed -left-[9999px] top-0" style={{ width: "595px" }}>
          <ResumePreview ref={previewRef} data={resumeData} />
        </div>
      </main>
    </div>
  );
}
