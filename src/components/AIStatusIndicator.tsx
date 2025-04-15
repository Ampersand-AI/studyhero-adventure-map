
import React from 'react';
import { useStudyPlan } from '@/contexts/StudyPlanContext';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader, CheckCircle2, AlertCircle } from "lucide-react";

const AIStatusIndicator = () => {
  const { aiStatus, isLoading } = useStudyPlan();
  
  if (!isLoading && aiStatus.stage === "Idle") {
    return null;
  }
  
  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 animate-in fade-in">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {aiStatus.progress < 100 ? (
                <Loader className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm font-medium">
                {aiStatus.stage}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              Provider: {aiStatus.provider}
            </span>
          </div>
          
          <Progress 
            value={aiStatus.progress} 
            className="h-2" 
            variant={aiStatus.progress === 100 ? "success" : "default"}
          />
          
          <p className="text-xs text-muted-foreground">
            {aiStatus.progress < 100 
              ? "Processing your request. This might take a moment..." 
              : "Processing complete!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIStatusIndicator;
