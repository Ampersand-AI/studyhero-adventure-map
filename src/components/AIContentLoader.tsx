
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AIContentLoaderProps {
  title: string;
  description?: string;
  stage: string;
  progress: number;
  provider: string;
  context?: {
    subject?: string;
    className?: string;
    topic?: string;
  };
}

const AIContentLoader: React.FC<AIContentLoaderProps> = ({
  title,
  description,
  stage,
  progress,
  provider,
  context
}) => {
  const getStageEmoji = () => {
    if (progress < 30) return "🔍";
    if (progress < 60) return "⚙️";
    if (progress < 90) return "🧠";
    return "✨";
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description || "Please wait while we prepare your content..."}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">
                {getStageEmoji()} {stage}
              </p>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              variant={progress >= 100 ? "success" : progress > 70 ? "info" : "default"} 
            />
            <p className="text-xs text-muted-foreground">Using {provider} to generate curriculum-aligned content</p>
          </div>
          
          {context && (
            <div className="pt-4 space-y-2">
              <p className="text-sm">This content is being generated based on:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                {context.subject && <li>NCERT {context.subject} curriculum</li>}
                {context.className && <li>Class {context.className} textbook content</li>}
                {context.topic && <li>Topic: {context.topic}</li>}
                <li>Latest educational standards and learning objectives</li>
              </ul>
            </div>
          )}
          
          <div className="animate-pulse space-y-3 pt-4">
            <div className="h-4 bg-secondary rounded w-3/4"></div>
            <div className="h-4 bg-secondary rounded w-full"></div>
            <div className="h-4 bg-secondary rounded w-5/6"></div>
            <div className="h-4 bg-secondary rounded w-2/3"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIContentLoader;
