
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchOpenRouterModels } from "@/services/openaiService";
import ModelSelector from "@/components/ModelSelector";
import { toast } from "@/hooks/use-toast";

export interface ProgressCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  total?: string; // Make the total prop optional
}

// Define a model interface
export interface AIModel {
  id: string;
  name: string;
  description?: string;
  provider?: string;
}

const ProgressCard = ({ title, value, description, icon, total }: ProgressCardProps) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<AIModel[]>([]);
  const [showApiInput, setShowApiInput] = useState<boolean>(false);

  // Load models when API key is entered
  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      loadModels(savedKey);
    }
  }, []);

  const loadModels = async (key: string) => {
    if (!key || key.trim() === "") return;
    
    setIsLoading(true);
    try {
      const fetchedModels = await fetchOpenRouterModels(key);
      setModels(fetchedModels);
      setShowApiInput(false);
      localStorage.setItem('openrouter_api_key', key);
      toast({
        title: "Success",
        description: `Loaded ${fetchedModels.length} models from OpenRouter`,
      });
    } catch (error) {
      console.error("Error loading models:", error);
      toast({
        title: "Error",
        description: "Failed to load models. Please check your API key.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleApiKeySubmit = () => {
    loadModels(apiKey);
  };

  // Auto-submit API key when pasted
  const handleApiKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.trim()) {
      setTimeout(() => {
        loadModels(pastedText.trim());
      }, 100);
    }
  };

  const toggleApiInput = () => {
    setShowApiInput(!showApiInput);
  };

  const handleModelSelection = (models: AIModel[]) => {
    setSelectedModels(models);
    // Store the selected models in localStorage
    localStorage.setItem('selected_models', JSON.stringify(models.map(m => m.id)));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {total && <span className="text-sm font-normal text-muted-foreground">/{total}</span>}
        </div>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleApiInput} 
          className="mb-2"
        >
          {showApiInput ? "Hide API Key Input" : "Configure OpenRouter API"}
        </Button>
        
        {showApiInput && (
          <div className="space-y-2 mt-2">
            <Input
              placeholder="Enter OpenRouter API Key"
              value={apiKey}
              onChange={handleApiKeyInput}
              onPaste={handleApiKeyPaste}
              type="password"
            />
            <Button 
              size="sm" 
              onClick={handleApiKeySubmit} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Loading..." : "Load Models"}
            </Button>
          </div>
        )}
        
        {models.length > 0 && (
          <div className="mt-4">
            <ModelSelector 
              models={models} 
              onSelectionChange={handleModelSelection}
              maxSelections={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
