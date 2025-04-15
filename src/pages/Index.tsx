
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, BookOpen } from "lucide-react";
import ModelSelector from '@/components/ModelSelector';
import { fetchOpenRouterModels } from "@/services/openaiService";
import AIStatusIndicator from '@/components/AIStatusIndicator';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("welcome");
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<any[]>([]);
  const [hasSetup, setHasSetup] = useState<boolean>(false);

  // Load saved settings
  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    const savedModels = localStorage.getItem('selected_models');
    
    if (savedKey) {
      setApiKey(savedKey);
      loadModels(savedKey);
      
      if (savedModels && JSON.parse(savedModels).length > 0) {
        setHasSetup(true);
      }
    }
  }, []);

  const loadModels = async (key: string) => {
    if (!key || key.trim() === "") return;
    
    setIsLoading(true);
    try {
      const fetchedModels = await fetchOpenRouterModels(key);
      setModels(fetchedModels);
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

  const handleApiKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.trim()) {
      setTimeout(() => {
        loadModels(pastedText.trim());
      }, 100);
    }
  };

  const handleModelSelection = (selectedModels: any[]) => {
    if (selectedModels.length > 0) {
      setHasSetup(true);
      
      // Since we have API key and models, we can save this as the setup is complete
      localStorage.setItem('app_setup_complete', 'true');
      
      toast({
        title: "Setup Complete",
        description: `Primary model: ${selectedModels[0].name || selectedModels[0].id}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-display text-3xl">Study AI</CardTitle>
          <CardDescription className="text-center">Your personal AI-powered study assistant</CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="welcome">Welcome</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="welcome">
            <CardContent className="flex flex-col items-center text-center gap-4">
              <p>Welcome to Study AI, where we help you master any subject with personalized study plans, interactive lessons, and adaptive quizzes.</p>
              <div className="w-full max-w-[250px] h-[200px] bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-5xl font-display text-primary">AI</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {hasSetup ? (
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/onboarding')}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setActiveTab("settings")}
                  >
                    Setup AI Settings First
                  </Button>
                </>
              )}
            </CardFooter>
          </TabsContent>
          
          <TabsContent value="settings">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  OpenRouter API Key
                </Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter OpenRouter API Key"
                  value={apiKey}
                  onChange={handleApiKeyInput}
                  onPaste={handleApiKeyPaste}
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter</a>
                </p>
              </div>
              
              <Button 
                onClick={handleApiKeySubmit} 
                disabled={isLoading || !apiKey}
                className="w-full"
              >
                {isLoading ? "Loading..." : "Load Models"}
              </Button>
              
              {models.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <ModelSelector 
                    models={models} 
                    onSelectionChange={handleModelSelection}
                    maxSelections={3}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {hasSetup && (
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/dashboard')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              )}
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
      
      <AIStatusIndicator />
    </div>
  );
};

export default Index;
