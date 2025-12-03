import { Input } from "@/components/ui/input";
import { FormSection } from "./FormSection";
import { FormField } from "./FormField";
import { PersonalInfo } from "@/types/resume";
import { User, Mail, Phone, Linkedin, MapPin } from "lucide-react";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <FormSection
      title="Personal Information"
      description="Enter your contact details for the resume header"
    >
      <FormField label="Full Name" required>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="John Doe"
            value={data.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="pl-10"
          />
        </div>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Email" required>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="john@example.com"
              value={data.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField label="Phone" required>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="+1 234 567 8900"
              value={data.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="pl-10"
            />
          </div>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="LinkedIn">
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="linkedin.com/in/johndoe"
              value={data.linkedin || ""}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              className="pl-10"
            />
          </div>
        </FormField>

        <FormField label="Location">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="New York, NY"
              value={data.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              className="pl-10"
            />
          </div>
        </FormField>
      </div>
    </FormSection>
  );
}
