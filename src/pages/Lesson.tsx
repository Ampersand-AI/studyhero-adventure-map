
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StudyHeroHeader from '@/components/StudyHeroHeader';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, ArrowRight, Home, Map, Trophy, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { claudeService } from '@/services/claudeService';

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [lessonItem, setLessonItem] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<string>('');
  
  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Timeline", href: "/dashboard", icon: <Map className="h-4 w-4" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const loadLesson = async () => {
      try {
        // Get the lesson details from the study plan
        const studyPlan = JSON.parse(localStorage.getItem('studyPlan') || '[]');
        const lesson = studyPlan.find((item: any) => item.id === id);
        
        if (!lesson) {
          toast({
            title: "Lesson not found",
            description: "The lesson you're looking for doesn't exist",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        setLessonItem(lesson);
        
        // Check if lesson content is already in localStorage
        const storedContent = localStorage.getItem(`lesson_${id}`);
        if (storedContent) {
          setLessonContent(storedContent);
          setLoading(false);
        } else {
          // For this demo, we'll set some placeholder content
          // In a real app, we would generate this with Claude
          const placeholderContent = `
          <div class="prose max-w-none">
            <h2>${lesson.title}</h2>
            <p>This is placeholder content for the lesson on ${lesson.title}. In a real application, this would be generated dynamically using Claude AI based on the specific topic.</p>
            <p>The lesson would include:</p>
            <ul>
              <li>Key concepts and definitions</li>
              <li>Explanations with examples</li>
              <li>Visual aids like diagrams</li>
              <li>Practice problems</li>
            </ul>
            <p>After studying this material, you'll be prepared to take the quiz on this topic and continue your learning journey.</p>
          </div>`;
          
          localStorage.setItem(`lesson_${id}`, placeholderContent);
          setLessonContent(placeholderContent);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading lesson:", error);
        toast({
          title: "Error loading lesson",
          description: "Please try again later",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    };
    
    loadLesson();
  }, [id, navigate, toast]);

  const handleCompleteLesson = () => {
    // Update the study plan to mark this lesson as completed
    const studyPlan = JSON.parse(localStorage.getItem('studyPlan') || '[]');
    const updatedPlan = studyPlan.map((item: any) => {
      if (item.id === id) {
        return { ...item, status: "completed" };
      } else if (item.status === "future" && studyPlan.filter((i: any) => i.status === "current").length === 0) {
        return { ...item, status: "current" };
      }
      return item;
    });
    
    localStorage.setItem('studyPlan', JSON.stringify(updatedPlan));
    
    toast({
      title: "Lesson completed!",
      description: "You've earned XP and unlocked the next item in your study plan",
    });
    
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyHeroHeader 
          userName="Student Hero" 
          level={3} 
          xp={750}
          navigation={navigationItems}
        />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading lesson content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyHeroHeader 
        userName="Student Hero" 
        level={3} 
        xp={750}
        navigation={navigationItems}
      />
      
      <main className="flex-1 container py-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <Button size="sm" onClick={handleCompleteLesson}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
          </div>
          
          <Card className="study-card animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl">{lessonItem?.title}</CardTitle>
              <CardDescription>
                {lessonItem?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div dangerouslySetInnerHTML={{ __html: lessonContent }} />
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleCompleteLesson} className="gradient-button">
              <span className="gradient-button-bg"></span>
              <span className="gradient-button-text">
                Complete & Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lesson;
