import { useState } from "react";

export function useTemplateSelection(initialGenerator?: string, initialTemplate?: string) {
  const [selectedQuickGenerator, setSelectedQuickGenerator] = useState<string | null>(initialGenerator || null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(initialTemplate || null);

  const handleQuickGeneratorSelect = (generator: any) => {
    // Handle both string and object inputs
    const generatorId = typeof generator === "string" ? generator : generator?.id;

    // Toggle selection - if already selected, deselect
    if (selectedQuickGenerator === generatorId) {
      setSelectedQuickGenerator(null);
      setSelectedTemplate(null); // Clear template selection when generator changes
    } else {
      setSelectedQuickGenerator(generatorId);
      setSelectedTemplate(null); // Clear template selection when generator changes
    }
  };

  const handleTemplateSelect = (template: any) => {
    // Handle both string and object inputs
    const templateId = typeof template === "string" ? template : template?.id;

    // Toggle selection - if already selected, deselect
    if (selectedTemplate === templateId) {
      setSelectedTemplate(null);
      setSelectedQuickGenerator(null); // Clear generator selection when template changes
    } else {
      setSelectedTemplate(templateId);
      setSelectedQuickGenerator(null); // Clear generator selection when template changes
    }
  };

  const clearSelections = () => {
    setSelectedQuickGenerator(null);
    setSelectedTemplate(null);
  };

  return {
    selectedQuickGenerator,
    selectedTemplate,
    handleQuickGeneratorSelect,
    handleTemplateSelect,
    clearSelections,
  };
}
