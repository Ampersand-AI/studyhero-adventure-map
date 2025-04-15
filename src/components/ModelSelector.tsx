
import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AIModel } from './ProgressCard';
import { Badge } from "@/components/ui/badge";

interface ModelSelectorProps {
  models: AIModel[];
  onSelectionChange: (selectedModels: AIModel[]) => void;
  maxSelections: number;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  models, 
  onSelectionChange,
  maxSelections
}) => {
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);
  
  // Load previously selected models from localStorage
  useEffect(() => {
    const savedModelIds = localStorage.getItem('selected_models');
    if (savedModelIds) {
      try {
        const ids = JSON.parse(savedModelIds) as string[];
        const savedModels = ids
          .map(id => models.find(model => model.id === id))
          .filter(model => model !== undefined) as AIModel[];
        
        if (savedModels.length > 0) {
          setSelectedModels(savedModels);
          onSelectionChange(savedModels);
        }
      } catch (e) {
        console.error("Error loading saved models:", e);
      }
    }
  }, [models, onSelectionChange]);

  const handleModelSelect = (modelId: string) => {
    if (selectedModels.length >= maxSelections) {
      return;
    }
    
    const selectedModel = models.find(model => model.id === modelId);
    if (selectedModel && !selectedModels.some(m => m.id === modelId)) {
      const updatedSelection = [...selectedModels, selectedModel];
      setSelectedModels(updatedSelection);
      onSelectionChange(updatedSelection);
      
      // Save to localStorage
      localStorage.setItem('selected_models', JSON.stringify(updatedSelection.map(m => m.id)));
    }
  };

  const removeModel = (index: number) => {
    const updatedSelection = selectedModels.filter((_, i) => i !== index);
    setSelectedModels(updatedSelection);
    onSelectionChange(updatedSelection);
    
    // Update localStorage
    localStorage.setItem('selected_models', JSON.stringify(updatedSelection.map(m => m.id)));
  };

  // Filter out already selected models
  const availableModels = models.filter(
    model => !selectedModels.some(selected => selected.id === model.id)
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Select up to {maxSelections} AI models as fallback</h3>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedModels.map((model, index) => (
          <Badge key={model.id} variant="secondary" className="flex items-center gap-1">
            {model.name || model.id}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => removeModel(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      {selectedModels.length < maxSelections && (
        <Select onValueChange={handleModelSelect} disabled={selectedModels.length >= maxSelections}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {availableModels.map(model => (
              <SelectItem key={model.id} value={model.id}>
                {model.name || model.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <div className="text-xs text-muted-foreground">
        {selectedModels.length > 0 
          ? `Primary: ${selectedModels[0]?.name || selectedModels[0]?.id}`
          : "Select a primary model first"
        }
        <br />
        {selectedModels.length >= 2 && (
          <>Fallbacks: {selectedModels.slice(1).map(m => m.name || m.id).join(', ')}</>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;
