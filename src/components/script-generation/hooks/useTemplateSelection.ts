import { useState } from "react";

export function useTemplateSelection() {
  const [selectedQuickGenerator, setSelectedQuickGenerator] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleQuickGeneratorSelect = (generator: any) => {
    // Toggle selection - if already selected, deselect
    if (selectedQuickGenerator === generator.id) {
      setSelectedQuickGenerator(null);
      setSelectedTemplate(null); // Clear template selection when generator changes
    } else {
      setSelectedQuickGenerator(generator.id);
      setSelectedTemplate(null); // Clear template selection when generator changes
    }
  };

  const handleTemplateSelect = (template: any) => {
    // Toggle selection - if already selected, deselect
    if (selectedTemplate === template.id) {
      setSelectedTemplate(null);
      setSelectedQuickGenerator(null); // Clear generator selection when template changes
    } else {
      setSelectedTemplate(template.id);
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
