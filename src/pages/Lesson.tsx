
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { StudyAIHeader } from '@/components/StudyAIHeader';
import { ArrowLeft, BookOpen, Home, Award, BarChart, Trophy, Map, CheckCircle, TestTube, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { claudeService } from '@/services/claudeService';
import LessonTest from '@/components/LessonTest';

interface LessonContent {
  title: string;
  keyPoints: string[];
  explanation: string[];
  examples: Array<{ title: string; content: string }>;
  visualAids: Array<{ title: string; description: string }>;
  activities: Array<{ title?: string; instructions: string }> | string[];
  summary: string;
}

interface TestResult {
  lessonId: string;
  score: number;
  total: number;
  date: string;
}

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lessonItem, setLessonItem] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [visualDiagrams, setVisualDiagrams] = useState<Record<string, string>>({});
  const [isLoadingDiagrams, setIsLoadingDiagrams] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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
    const studyPlans = localStorage.getItem('studyPlans');
    if (studyPlans) {
      const plans = JSON.parse(studyPlans);
      let found = false;
      
      for (const plan of plans) {
        const item = plan.items.find((item: any) => item.id === id);
        if (item) {
          setLessonItem(item);
          loadLessonContent(item.title);
          found = true;
          break;
        }
      }
      
      if (!found) {
        navigate('/dashboard');
        toast({
          title: "Lesson not found",
          description: "This lesson could not be found in your study plans",
          variant: "destructive"
        });
      }
    } else {
      navigate('/dashboard');
      toast({
        title: "No study plans found",
        description: "Please set up your study plans first",
        variant: "destructive"
      });
    }
  }, [id, navigate]);

  const loadLessonContent = async (topic: string) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Check if we already have cached content for this lesson
      const cachedContent = localStorage.getItem(`lesson-content-${id}`);
      if (cachedContent) {
        try {
          const parsed = JSON.parse(cachedContent);
          
          // Validate the parsed content has all required fields
          if (!parsed || !parsed.keyPoints || !parsed.explanation || !parsed.examples || !parsed.summary) {
            console.warn("Cached lesson content is missing required fields, loading fresh content");
            localStorage.removeItem(`lesson-content-${id}`);
            await fetchLessonContent(topic);
            return;
          }
          
          setLessonContent(parsed);
          
          // Still load diagrams if we don't have them
          if (!localStorage.getItem(`lesson-diagrams-${id}`)) {
            loadVisualDiagrams(topic, parsed.visualAids || []);
          } else {
            setVisualDiagrams(JSON.parse(localStorage.getItem(`lesson-diagrams-${id}`) || '{}'));
          }
        } catch (e) {
          console.error("Error parsing cached lesson content:", e);
          // If cached content is invalid, remove it and load fresh content
          localStorage.removeItem(`lesson-content-${id}`);
          await fetchLessonContent(topic);
        }
      } else {
        await fetchLessonContent(topic);
      }
    } catch (error) {
      console.error("Error in loadLessonContent:", error);
      setApiError("Failed to load lesson content. Please try again later.");
      toast({
        title: "Error loading lesson content",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessonContent = async (topic: string) => {
    try {
      // Get profile info to determine subject
      const profile = localStorage.getItem('studyHeroProfile');
      if (!profile) {
        throw new Error("Profile not found");
      }
      
      const { subject } = JSON.parse(profile);
      console.log(`Fetching lesson content for ${subject}, topic: ${topic}`);
      
      const content = await claudeService.generateLessonContent(subject, topic);
      
      // Ensure the content has all required fields with fallbacks
      const normalizedContent: LessonContent = {
        title: content.title || topic,
        keyPoints: content.keyPoints || [],
        explanation: content.explanation || [],
        examples: content.examples || [],
        visualAids: content.visualAids || [],
        activities: [],
        summary: content.summary || ""
      };
      
      // Normalize activities if they're not in the expected format
      if (content.activities && Array.isArray(content.activities)) {
        if (content.activities.length > 0) {
          if (typeof content.activities[0] === 'string') {
            normalizedContent.activities = content.activities.map((activity: string) => ({
              instructions: activity
            }));
          } else {
            normalizedContent.activities = content.activities;
          }
        }
      }
      
      setLessonContent(normalizedContent);
      
      // Cache the content
      localStorage.setItem(`lesson-content-${id}`, JSON.stringify(normalizedContent));
      
      // Load visual diagrams
      if (normalizedContent.visualAids && normalizedContent.visualAids.length > 0) {
        loadVisualDiagrams(topic, normalizedContent.visualAids);
      }
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      throw error;
    }
  };

  const loadVisualDiagrams = async (topic: string, visualAids: Array<{ title: string; description: string }>) => {
    setIsLoadingDiagrams(true);
    try {
      // Check if we already have cached diagrams
      const cachedDiagrams = localStorage.getItem(`lesson-diagrams-${id}`);
      if (cachedDiagrams) {
        setVisualDiagrams(JSON.parse(cachedDiagrams));
        setIsLoadingDiagrams(false);
        return;
      }

      // Get profile info to determine subject
      const profile = localStorage.getItem('studyHeroProfile');
      if (!profile) {
        throw new Error("Profile not found");
      }
      
      const { subject } = JSON.parse(profile);
      const diagramsObj: Record<string, string> = {};
      
      // Generate diagrams for each visual aid
      if (visualAids && visualAids.length > 0) {
        for (const aid of visualAids) {
          console.log(`Generating diagram for ${aid.title}`);
          const diagramDescription = await claudeService.generateDiagram(subject, topic, aid.title);
          diagramsObj[aid.title] = diagramDescription;
        }
      }
      
      setVisualDiagrams(diagramsObj);
      // Cache the diagrams
      localStorage.setItem(`lesson-diagrams-${id}`, JSON.stringify(diagramsObj));
    } catch (error) {
      console.error("Error loading visual diagrams:", error);
      toast({
        title: "Error loading visual aids",
        description: "Some visual aids may not display properly",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDiagrams(false);
    }
  };

  const startTest = async () => {
    setIsLoadingTest(true);
    try {
      // Check if we already have cached test questions for this lesson
      const cachedTest = localStorage.getItem(`lesson-test-${id}`);
      if (cachedTest) {
        setTestQuestions(JSON.parse(cachedTest).questions);
        setShowTest(true);
        setIsLoadingTest(false);
        return;
      }

      const profile = localStorage.getItem('studyHeroProfile');
      if (!profile) {
        throw new Error("Profile not found");
      }
      
      const { subject } = JSON.parse(profile);
      console.log(`Generating test for ${subject}, topic: ${lessonItem.title}`);
      
      const testData = await claudeService.generateLessonTest(subject, lessonItem.title, 5);
      
      setTestQuestions(testData.questions);
      // Cache the test
      localStorage.setItem(`lesson-test-${id}`, JSON.stringify(testData));
      setShowTest(true);
    } catch (error) {
      console.error("Error loading test questions:", error);
      toast({
        title: "Error loading test questions",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTest(false);
    }
  };

  const handleTestComplete = (score: number, total: number) => {
    // Save test result
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    const newResult: TestResult = {
      lessonId: id || '',
      score,
      total,
      date: new Date().toISOString()
    };
    testResults.push(newResult);
    localStorage.setItem('testResults', JSON.stringify(testResults));
    
    // Update XP
    const xpGained = Math.round((score / total) * 100);
    const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
    localStorage.setItem('currentXp', (currentXp + xpGained).toString());
    
    toast({
      title: `Test completed!`,
      description: `You scored ${score}/${total} and earned ${xpGained} XP`,
    });
  };

  const markAsCompleted = () => {
    if (!lessonItem) return;
    
    const studyPlans = localStorage.getItem('studyPlans');
    if (studyPlans) {
      const plans = JSON.parse(studyPlans);
      
      const updatedPlans = plans.map((plan: any) => {
        // Check if this lesson is in this plan
        const itemIndex = plan.items.findIndex((item: any) => item.id === id);
        
        if (itemIndex >= 0) {
          // Create a copy of items
          const updatedItems = [...plan.items];
          
          // Update the completed item
          updatedItems[itemIndex] = { 
            ...updatedItems[itemIndex], 
            status: "completed" 
          };
          
          // If this was a "current" item, make the next item "current"
          if (updatedItems[itemIndex].status === "current" && itemIndex + 1 < updatedItems.length) {
            updatedItems[itemIndex + 1] = {
              ...updatedItems[itemIndex + 1],
              status: "current"
            };
          }
          
          return { ...plan, items: updatedItems };
        }
        
        return plan;
      });
      
      localStorage.setItem('studyPlans', JSON.stringify(updatedPlans));
      
      toast({
        title: "Lesson completed!",
        description: "You've earned 50 XP",
      });
      
      // Add XP
      const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
      localStorage.setItem('currentXp', (currentXp + 50).toString());
      
      // If it was a lesson (not a practice or quiz), offer test
      if (lessonItem.type === "lesson") {
        startTest();
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Get user profile info
  const profile = localStorage.getItem('studyHeroProfile');
  const profileData = profile ? JSON.parse(profile) : { userName: "Student" };

  if (!lessonItem) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader 
          userName={profileData.userName || "Student"} 
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <div className="container py-12 flex justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Loading lesson...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showTest) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader 
          userName={profileData.userName || "Student"} 
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="flex-1">
          <div className="container py-6">
            {isLoadingTest ? (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Preparing your test...</p>
              </div>
            ) : (
              <LessonTest 
                lessonId={id || ''} 
                lessonTitle={lessonItem.title}
                questions={testQuestions}
                onComplete={handleTestComplete}
                onCancel={() => navigate('/dashboard')}
              />
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader 
        userName={profileData.userName || "Student"} 
        level={parseInt(localStorage.getItem('currentLevel') || '1')}
        xp={parseInt(localStorage.getItem('currentXp') || '0')}
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
                {lessonItem.estimatedTimeInMinutes} min • {lessonItem.type.charAt(0).toUpperCase() + lessonItem.type.slice(1)}
              </p>
            </div>
            
            <div className="flex gap-2">
              {lessonItem.type === "lesson" && (
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={startTest}
                  disabled={isLoadingTest}
                >
                  {isLoadingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )} Take Test
                </Button>
              )}
              <Button onClick={markAsCompleted}>
                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
              </Button>
            </div>
          </div>
          
          {apiError && (
            <div className="mb-6">
              <Card className="bg-destructive/10 border-destructive">
                <CardHeader>
                  <CardTitle>Error Loading Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{apiError}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => loadLessonContent(lessonItem.title)}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          
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
                          {lessonContent.keyPoints && lessonContent.keyPoints.length > 0 ? (
                            lessonContent.keyPoints.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))
                          ) : (
                            <li>No key points available for this lesson.</li>
                          )}
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                        <div className="space-y-3">
                          {lessonContent.explanation && lessonContent.explanation.length > 0 ? (
                            lessonContent.explanation.map((paragraph, index) => (
                              <p key={index}>{paragraph}</p>
                            ))
                          ) : (
                            <p>No detailed explanation available for this lesson.</p>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Examples</h3>
                        <div className="space-y-4">
                          {lessonContent.examples && lessonContent.examples.length > 0 ? (
                            lessonContent.examples.map((example, index) => (
                              <Card key={index} className="bg-muted/50">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-base">{example.title || `Example ${index + 1}`}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p>{example.content}</p>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <p>No examples available for this lesson.</p>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <p>{lessonContent.summary || "No summary available for this lesson."}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <p>Failed to load lesson content.</p>
                      <Button 
                        onClick={() => loadLessonContent(lessonItem.title)} 
                        className="mt-4"
                      >
                        Try Again
                      </Button>
                    </div>
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
                  ) : lessonContent && lessonContent.visualAids && lessonContent.visualAids.length > 0 ? (
                    <div className="space-y-4">
                      {lessonContent.visualAids.map((aid, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <h4 className="font-medium mb-1">{aid.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{aid.description}</p>
                          <div className="mt-2 bg-muted p-4 h-auto rounded-md">
                            {isLoadingDiagrams ? (
                              <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-6 w-6 animate-spin" />
                              </div>
                            ) : visualDiagrams[aid.title] ? (
                              <div className="text-sm overflow-auto max-h-[200px]">
                                <p className="whitespace-pre-wrap">{visualDiagrams[aid.title]}</p>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-40 text-muted-foreground">
                                <p>Diagram description not available</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => loadVisualDiagrams(lessonItem.title, lessonContent.visualAids)}
                                  className="ml-2"
                                >
                                  <Loader2 className="h-4 w-4 mr-1" /> Load
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No visual aids available for this lesson.</p>
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
                  ) : lessonContent && lessonContent.activities ? (
                    <div className="space-y-3">
                      {Array.isArray(lessonContent.activities) && lessonContent.activities.length > 0 ? (
                        lessonContent.activities.map((activity, index) => (
                          <div key={index} className="bg-muted/50 p-3 rounded-md">
                            <p>
                              <span className="font-medium">Activity {index + 1}: </span> 
                              {typeof activity === 'string' 
                                ? activity 
                                : activity.instructions || (activity.title ? `${activity.title}` : 'Complete this activity')}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p>No specific activities available for this lesson.</p>
                      )}
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
