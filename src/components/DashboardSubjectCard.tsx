
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, BookOpenCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import deepSeekService, { AIStatus } from '../services/deepSeekService';

interface DashboardSubjectCardProps {
  subject: string;
  board: string;
  className: string;
  description?: string;
  progress?: number;
}

const DashboardSubjectCard: React.FC<DashboardSubjectCardProps> = ({
  subject,
  board,
  className,
  description,
  progress = 0
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<AIStatus | null>(null);
  
  const handleStudyClick = async () => {
    setLoading(true);
    
    try {
      // Check if study plan exists in localStorage
      const studyPlanKey = `studyPlan_${subject}_${board}_${className}`;
      const existingPlan = localStorage.getItem(studyPlanKey);
      
      if (existingPlan) {
        // Plan exists, navigate to subject details
        localStorage.setItem('selectedSubject', subject);
        navigate('/subject');
        return;
      }
      
      // Update loading status
      const updateStatus = (status: AIStatus) => {
        setLoadingStatus(status);
      };
      
      // Generate study plan
      toast(`Preparing ${subject} content`, {
        description: "Analyzing curriculum and generating personalized study materials..."
      });
      
      const studyPlan = await deepSeekService.generateStudyPlan(
        subject, 
        board, 
        className,
        updateStatus
      );
      
      // Save study plan to localStorage
      localStorage.setItem(studyPlanKey, JSON.stringify(studyPlan));
      
      // Navigate to subject details
      localStorage.setItem('selectedSubject', subject);
      navigate('/subject');
    } catch (error) {
      console.error(`Error generating study plan for ${subject}:`, error);
      toast.error("Failed to load subject content", {
        description: "There was an error preparing your study materials. Please try again."
      });
    } finally {
      setLoading(false);
      setLoadingStatus(null);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {subject === "Mathematics" ? (
            <span className="text-blue-600 bg-blue-50 p-1 rounded-md">
              <BookOpen className="h-5 w-5" />
            </span>
          ) : subject === "Science" ? (
            <span className="text-green-600 bg-green-50 p-1 rounded-md">
              <BookOpen className="h-5 w-5" />
            </span>
          ) : subject === "English" ? (
            <span className="text-purple-600 bg-purple-50 p-1 rounded-md">
              <BookOpen className="h-5 w-5" />
            </span>
          ) : subject === "Social Studies" ? (
            <span className="text-orange-600 bg-orange-50 p-1 rounded-md">
              <BookOpen className="h-5 w-5" />
            </span>
          ) : (
            <span className="text-gray-600 bg-gray-50 p-1 rounded-md">
              <BookOpen className="h-5 w-5" />
            </span>
          )}
          {subject}
        </CardTitle>
        <CardDescription>
          {description || `${board} curriculum for Class ${className}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loadingStatus ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>{loadingStatus.stage}</span>
                <span>{loadingStatus.progress}%</span>
              </div>
              <Progress value={loadingStatus.progress} className="h-1.5" />
            </div>
            <p className="text-xs text-muted-foreground">
              Our AI is analyzing {board} curriculum for Class {className} and creating personalized study content with visual aids.
            </p>
          </div>
        ) : progress > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Current Chapter</span>
              <span>Chapter 3: Compounds and Mixtures</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center h-full justify-center py-4">
            <div className="text-center">
              <BookOpenCheck className="h-12 w-12 text-primary/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Start studying {subject} with our AI-powered lesson plans and interactive quizzes
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant="outline" 
          onClick={handleStudyClick}
          disabled={loading}
        >
          {loading ? "Preparing Content..." : "Study Now"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DashboardSubjectCard;
