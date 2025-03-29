import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { StudyAIHeader } from '@/components/StudyAIHeader';
import { ArrowLeft, BookOpen, Home, Award, BarChart, Trophy, Map, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { claudeService } from '@/services/claudeService';

interface LessonContent {
  title: string;
  keyPoints: string[];
  explanation: string[];
  examples: Array<{ title: string; content: string }>;
  visualAids: Array<{ title: string; description: string }>;
  activities: string[];
  summary: string;
}

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lessonItem, setLessonItem] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);

  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Timeline", href: "/dashboard", icon: <Map className="h-4 w-4" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart className="h-4 w-4" /> },
  ];

  useEffect(() => {
    // First try to get the lesson item from the currentStudyItem in localStorage
    const currentItem = localStorage.getItem('currentStudyItem');
    if (currentItem) {
      const parsedItem = JSON.parse(currentItem);
      if (parsedItem.id === id) {
        setLessonItem(parsedItem);
        loadLessonContent(parsedItem.title);
        return;
      }
    }

    // Otherwise, find the lesson in the study plan
    const studyPlan = localStorage.getItem('studyPlan');
    if (studyPlan) {
      const items = JSON.parse(studyPlan);
      const item = items.find((item: any) => item.id === id);
      if (item) {
        setLessonItem(item);
        loadLessonContent(item.title);
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  }, [id, navigate]);

  const loadLessonContent = async (topic: string) => {
    setIsLoading(true);
    try {
      // Check if we already have cached content for this lesson
      const cachedContent = localStorage.getItem(`lesson-content-${id}`);
      if (cachedContent) {
        setLessonContent(JSON.parse(cachedContent));
        setIsLoading(false);
        return;
      }

      // Get profile info to determine subject
      const profile = localStorage.getItem('studyHeroProfile');
      if (!profile) {
        throw new Error("Profile not found");
      }
      
      const { subject } = JSON.parse(profile);
      const content = await claudeService.generateLessonContent(subject, topic);
      
      setLessonContent(content);
      // Cache the content
      localStorage.setItem(`lesson-content-${id}`, JSON.stringify(content));
    } catch (error) {
      console.error("Error loading lesson content:", error);
      toast({
        title: "Error loading lesson content",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsCompleted = () => {
    const studyPlan = localStorage.getItem('studyPlan');
    if (studyPlan && lessonItem) {
      const items = JSON.parse(studyPlan);
      const updatedItems = items.map((item: any) => {
        if (item.id === id) {
          return { ...item, status: "completed" };
        }
        
        // Mark the next item as "current" if this item is being completed
        if (item.id !== id && item.status === "future" && lessonItem.status === "current") {
          // Find the index of the current item
          const currentIndex = items.findIndex((i: any) => i.id === id);
          const thisIndex = items.findIndex((i: any) => i.id === item.id);
          
          // If this is the next item in sequence, mark it as current
          if (thisIndex === currentIndex + 1) {
            return { ...item, status: "current" };
          }
        }
        
        return item;
      });
      
      localStorage.setItem('studyPlan', JSON.stringify(updatedItems));
      
      toast({
        title: "Lesson completed!",
        description: "You've earned 50 XP",
      });
      
      navigate('/dashboard');
    }
  };

  if (!lessonItem) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader 
          userName="Student Hero" 
          level={3} 
          xp={750}
          navigation={navigationItems}
        />
        <div className="container py-12 flex justify-center">
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader 
        userName="Student Hero" 
        level={3} 
        xp={750}
        navigation={navigationItems}
      />
      
      <main className="flex-1">
        <div className="container py-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display">{lessonItem.title}</h1>
              <p className="text-muted-foreground">
                {lessonItem.estimatedTimeInMinutes} min • Lesson
              </p>
            </div>
            
            <Button onClick={markAsCompleted}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-primary" /> 
                      Lesson Content
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-4/5" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-8 w-2/5 mt-8" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : lessonContent ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Key Points</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {lessonContent.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                        <div className="space-y-3">
                          {lessonContent.explanation.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Examples</h3>
                        <div className="space-y-4">
                          {lessonContent.examples.map((example, index) => (
                            <Card key={index} className="bg-muted/50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">{example.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p>{example.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <p>{lessonContent.summary}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Sorry, lesson content could not be loaded.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visual Aids</CardTitle>
                  <CardDescription>Diagrams and visual references</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-40 w-full rounded-md" />
                    </div>
                  ) : lessonContent ? (
                    <div className="space-y-4">
                      {lessonContent.visualAids.map((aid, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <h4 className="font-medium mb-1">{aid.title}</h4>
                          <p className="text-sm text-muted-foreground">{aid.description}</p>
                          <div className="mt-2 bg-muted h-40 rounded-md flex items-center justify-center text-muted-foreground">
                            [Visual representation]
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No visual aids available.</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Activities</CardTitle>
                  <CardDescription>Practice to reinforce learning</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : lessonContent ? (
                    <div className="space-y-3">
                      {lessonContent.activities.map((activity, index) => (
                        <div key={index} className="bg-muted/50 p-3 rounded-md">
                          <p><span className="font-medium">Activity {index + 1}:</span> {activity}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No activities available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lesson;
