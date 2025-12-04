import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { Project } from "@/types/resume";
import { Plus, Trash2, FolderCode, ChevronDown, ChevronUp } from "lucide-react";

interface ProjectsFormProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

export function ProjectsForm({ projects, onChange }: ProjectsFormProps) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: [],
    };
    const updatedProjects = [...projects, newProject];
    onChange(updatedProjects);
    setExpandedIds([...expandedIds, newProject.id]);
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    onChange(
      projects.map((proj) =>
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    );
  };

  const updateTechnologies = (id: string, techString: string) => {
    const technologies = techString.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    updateProject(id, 'technologies', technologies);
  };

  const removeProject = (id: string) => {
    onChange(projects.filter((proj) => proj.id !== id));
    setExpandedIds(expandedIds.filter((eid) => eid !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(
      expandedIds.includes(id)
        ? expandedIds.filter((eid) => eid !== id)
        : [...expandedIds, id]
    );
  };

  return (
    <FormSection
      title="Projects"
      description="Showcase your notable projects and achievements"
    >
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="border-2 border-border rounded-xl p-4 bg-card transition-all hover:border-primary/30"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(project.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold font-display">
                    {project.name || `Project ${index + 1}`}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {project.technologies ? project.technologies.join(', ') : "Technologies used"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProject(project.id);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {expandedIds.includes(project.id) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedIds.includes(project.id) && (
              <div className="mt-4 space-y-4 pt-4 border-t border-border">
                <FormField label="Project Name" required>
                  <Input
                    placeholder="E-commerce Platform"
                    value={project.name}
                    onChange={(e) =>
                      updateProject(project.id, "name", e.target.value)
                    }
                  />
                </FormField>
                <FormField label="Description" required>
                  <Textarea
                    placeholder="Brief description of the project, its purpose, and your role..."
                    value={project.description}
                    onChange={(e) =>
                      updateProject(project.id, "description", e.target.value)
                    }
                    className="min-h-[100px]"
                  />
                </FormField>
                <FormField label="Technologies Used" required>
                  <Input
                    id={`technologies-${project.id}`}
                    placeholder="e.g., React, Node.js, MongoDB (comma separated)"
                    value={project.technologies.join(', ')}
                    onChange={(e) => updateTechnologies(project.id, e.target.value)}
                    className="bg-background"
                  />
                </FormField>
              </div>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline-primary"
          onClick={addProject}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>
    </FormSection>
  );
}
