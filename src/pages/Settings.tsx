
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Key, Info, Shield } from "lucide-react";
import StudyAIHeader from "@/components/StudyAIHeader";
import { fetchOpenRouterModels } from "@/services/openaiService";
import ModelSelector from "@/components/ModelSelector";

const Settings = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModels, setSelectedModels] = useState<any[]>([]);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Load API key from localStorage
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
      setShowSuccess(true);
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

  const handleFeedbackSubmit = () => {
    if (feedbackText.trim()) {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      setFeedbackText("");
    }
  };

  const handleModelSelection = (models: any[]) => {
    setSelectedModels(models);
  };

  return (
    <div className="min-h-screen bg-background">
      <StudyAIHeader userName="Student" level={1} />
      
      <main className="container py-6 space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>Configure your OpenRouter API key to access AI models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenRouter API Key</Label>
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
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Help & Feedback
              </CardTitle>
              <CardDescription>Send us your feedback or report issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">Your Feedback</Label>
                <Textarea 
                  id="feedback" 
                  placeholder="Share your thoughts or report an issue..." 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleFeedbackSubmit} 
                disabled={!feedbackText.trim()}
                className="w-full"
              >
                Submit Feedback
              </Button>
              
              <div className="text-sm text-center text-muted-foreground pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-auto p-0">
                      <Shield className="h-4 w-4 mr-1" />
                      Privacy Policy
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Privacy Policy</DialogTitle>
                      <DialogDescription>
                        How we handle your data and API keys
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 text-sm">
                      <p>
                        <strong>API Key Storage:</strong> Your OpenRouter API key is stored locally in your browser's localStorage. 
                        It never leaves your device and is not transmitted to our servers.
                      </p>
                      <p>
                        <strong>Model Selection:</strong> Your selected models are also stored locally for your convenience.
                      </p>
                      <p>
                        <strong>Usage Data:</strong> We collect anonymous usage statistics to improve the application.
                        No personal information is collected.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
