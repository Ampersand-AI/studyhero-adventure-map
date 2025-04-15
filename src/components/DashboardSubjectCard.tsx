
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
import { 
  BookOpen, 
  ArrowRight, 
  BookOpenCheck, 
  Calculator, 
  Beaker, 
  BookText, 
  Globe, 
  Music, 
  Dumbbell,
  Palette, 
  Code, 
  Languages,
  Atom
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useStudyPlan } from '@/contexts/StudyPlanContext';
import { studyPlanService } from '../services/studyPlanService';

interface DashboardSubjectCardProps {
  subject: string;
  board?: string;
  className?: string;
  description?: string;
  progress?: number;
}

const DashboardSubjectCard: React.FC<DashboardSubjectCardProps> = ({
  subject,
  board = "NCERT",
  className = "10",
  description,
  progress = 0
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { updateAIStatus } = useStudyPlan();
  
  // Get subject-specific icon
  const getSubjectIcon = () => {
    const iconProps = { className: "h-5 w-5" };
    
    switch(subject.toLowerCase()) {
      case 'mathematics':
        return <Calculator {...iconProps} />;
      case 'science':
        return <Beaker {...iconProps} />;
      case 'physics':
        return <Atom {...iconProps} />;
      case 'chemistry':
        return <Beaker {...iconProps} />;
      case 'biology':
        return <BookOpenCheck {...iconProps} />;
      case 'english':
        return <BookText {...iconProps} />;
      case 'social studies':
        return <Globe {...iconProps} />;
      case 'history':
        return <BookText {...iconProps} />;
      case 'geography':
        return <Globe {...iconProps} />;
      case 'computer science':
        return <Code {...iconProps} />;
      case 'physical education':
        return <Dumbbell {...iconProps} />;
      case 'art':
        return <Palette {...iconProps} />;
      case 'music':
        return <Music {...iconProps} />;
      case 'sanskrit':
      case 'hindi':
      case 'french':
      case 'german':
        return <Languages {...iconProps} />;
      default:
        return <BookOpen {...iconProps} />;
    }
  };
  
  // Get subject-specific color for icon background
  const getSubjectColor = () => {
    switch(subject.toLowerCase()) {
      case 'mathematics':
        return "text-blue-600 bg-blue-50";
      case 'science':
        return "text-green-600 bg-green-50";
      case 'physics':
        return "text-purple-600 bg-purple-50";
      case 'chemistry':
        return "text-teal-600 bg-teal-50";
      case 'biology':
        return "text-emerald-600 bg-emerald-50";
      case 'english':
        return "text-purple-600 bg-purple-50";
      case 'social studies':
        return "text-orange-600 bg-orange-50";
      case 'history':
        return "text-amber-600 bg-amber-50";
      case 'geography':
        return "text-cyan-600 bg-cyan-50";
      case 'computer science':
        return "text-indigo-600 bg-indigo-50";
      case 'physical education':
        return "text-red-600 bg-red-50";
      case 'art':
        return "text-pink-600 bg-pink-50";
      case 'music':
        return "text-violet-600 bg-violet-50";
      case 'sanskrit':
      case 'hindi':
      case 'french':
      case 'german':
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };
  
  const handleStudyClick = async () => {
    setLoading(true);
    
    try {
      // Check if API key and models are set
      const apiKey = localStorage.getItem('openrouter_api_key');
      const selectedModels = localStorage.getItem('selected_models');
      
      if (!apiKey) {
        toast.error("Please set up your OpenRouter API key in Settings first");
        navigate('/');
        return;
      }
      
      if (!selectedModels || JSON.parse(selectedModels).length === 0) {
        toast.error("Please select at least one AI model in Settings");
        navigate('/');
        return;
      }
      
      // Check if study plan exists in localStorage
      const studyPlanKey = `studyPlan_${subject}_${board}_${className}`;
      const existingPlan = localStorage.getItem(studyPlanKey);
      
      if (existingPlan) {
        // Plan exists, navigate to subject details
        localStorage.setItem('selectedSubject', subject);
        navigate(`/subject/${subject.toLowerCase().replace(/\s+/g, '-')}`);
        return;
      }
      
      // Generate study plan with selected models
      const selectedModelsArray = JSON.parse(selectedModels);
      const primaryModel = selectedModelsArray[0]?.id || "anthropic/claude-3-haiku";
      
      toast.loading(`Preparing ${subject} content using ${primaryModel}`);
      
      // Update loading status through the context
      const updateStatus = (status) => {
        updateAIStatus({
          ...status,
          provider: primaryModel
        });
      };
      
      // Generate study plan
      const studyPlan = await studyPlanService.getStudyPlan(
        subject, 
        board, 
        className,
        updateStatus
      );
      
      // Save study plan to localStorage
      localStorage.setItem(studyPlanKey, JSON.stringify(studyPlan));
      
      // Navigate to subject details
      localStorage.setItem('selectedSubject', subject);
      navigate(`/subject/${subject.toLowerCase().replace(/\s+/g, '-')}`);
      
      toast.success(`Successfully created study plan for ${subject}`);
    } catch (error) {
      console.error(`Error generating study plan for ${subject}:`, error);
      toast.error("Failed to load subject content. Please try again.");
    } finally {
      setLoading(false);
      // Reset global AI status
      setTimeout(() => {
        updateAIStatus({ stage: "Idle", progress: 0, provider: "System" });
      }, 2000);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={`p-1.5 rounded-md ${getSubjectColor()}`}>
            {getSubjectIcon()}
          </span>
          {subject}
        </CardTitle>
        <CardDescription>
          {description || `${board} curriculum for Class ${className}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center h-full justify-center py-4">
          <div className="text-center">
            <BookOpenCheck className="h-12 w-12 text-primary/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Start studying {subject} with our AI-powered lesson plans and interactive quizzes
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={loading ? "secondary" : "outline"} 
          onClick={handleStudyClick}
          disabled={loading}
        >
          {loading ? "Generating Content..." : "Study Now"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DashboardSubjectCard;
