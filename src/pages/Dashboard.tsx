
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudyAIHeader } from '@/components/StudyAIHeader';
import ProgressCard from '@/components/ProgressCard';
import StudyTimeline from '@/components/StudyTimeline';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BookOpen, BarChart, Award, Home, Trophy, Map, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { claudeService } from '@/services/claudeService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StudyItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  status: "completed" | "current" | "future";
  dueDate: string;
  content: string;
  estimatedTimeInMinutes: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyItem[]>([]);
  const [profileInfo, setProfileInfo] = useState<any>({
    board: '',
    className: '',
    subject: '',
  });

  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Timeline", href: "/dashboard", icon: <Map className="h-4 w-4" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart className="h-4 w-4" /> },
  ];

  useEffect(() => {
    // Check if profile exists in localStorage
    const profile = localStorage.getItem('studyHeroProfile');
    if (!profile) {
      navigate('/');
      return;
    }

    const profileData = JSON.parse(profile);
    setProfileInfo(profileData);

    // Fetch study plan
    const storedStudyPlan = localStorage.getItem('studyPlan');
    if (storedStudyPlan) {
      try {
        setStudyPlan(JSON.parse(storedStudyPlan));
        setIsLoading(false);
      } catch (e) {
        console.error("Error parsing stored study plan:", e);
        generateStudyPlan(profileData.board, profileData.className, profileData.subject);
      }
    } else {
      generateStudyPlan(profileData.board, profileData.className, profileData.subject);
    }
  }, [navigate]);

  const generateStudyPlan = async (board: string, className: string, subject: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const planData = await claudeService.generateStudyPlan(board, className, subject);
      
      if (!planData || !planData.items || !Array.isArray(planData.items) || planData.items.length === 0) {
        throw new Error("Invalid study plan data received");
      }
      
      // Process the data to add status and due dates
      const today = new Date();
      const processedPlan = planData.items.map((item: any, index: number) => {
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + index * 2); // Every 2 days
        
        return {
          ...item,
          status: index === 0 ? "current" : "future",
          dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          type: item.type || ["lesson", "quiz", "practice"][index % 3]
        };
      });
      
      setStudyPlan(processedPlan);
      localStorage.setItem('studyPlan', JSON.stringify(processedPlan));
      
      toast({
        title: "Study plan generated!",
        description: "Your personalized study plan is now ready",
      });
    } catch (error) {
      console.error("Error generating study plan:", error);
      setError("Failed to generate your study plan. Please try again later.");
      toast({
        title: "Error generating study plan",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartItem = (id: string) => {
    // Find the item in study plan
    const item = studyPlan.find(item => item.id === id);
    if (item) {
      // Also save the current item to localStorage for the lesson/quiz page
      localStorage.setItem('currentStudyItem', JSON.stringify(item));
      
      if (item.type === 'quiz') {
        navigate(`/quiz/${id}`);
      } else {
        navigate(`/lesson/${id}`);
      }
    }
  };

  const handleRegeneratePlan = () => {
    generateStudyPlan(profileInfo.board, profileInfo.className, profileInfo.subject);
  };

  // Calculate progress
  const totalItems = studyPlan.length;
  const completedItems = studyPlan.filter(item => item.status === "completed").length;
  const completionPercentage = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-display">{profileInfo.subject} Adventure</h1>
              <p className="text-muted-foreground">
                Class {profileInfo.className} • {profileInfo.board}
              </p>
            </div>
            
            {error && (
              <Button 
                variant="outline" 
                onClick={handleRegeneratePlan}
                className="mt-2 md:mt-0"
              >
                Regenerate Study Plan
              </Button>
            )}
          </div>

          {error ? (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="mt-6">
                {isLoading ? (
                  <div className="flex flex-col justify-center items-center h-64 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p>Creating your personalized study plan...</p>
                  </div>
                ) : (
                  <StudyTimeline items={studyPlan} onStartItem={handleStartItem} />
                )}
              </TabsContent>
              
              <TabsContent value="progress" className="mt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <ProgressCard 
                    title="Overall Progress" 
                    percentage={completionPercentage} 
                    icon={<BookOpen className="h-4 w-4" />}
                    color="blue"
                  />
                  <ProgressCard 
                    title="Quizzes Completed" 
                    percentage={Math.round((studyPlan.filter(item => item.status === "completed" && item.type === "quiz").length / 
                      Math.max(1, studyPlan.filter(item => item.type === "quiz").length)) * 100)} 
                    icon={<Award className="h-4 w-4" />}
                    color="purple"
                  />
                  <ProgressCard 
                    title="Lessons Studied" 
                    percentage={Math.round((studyPlan.filter(item => item.status === "completed" && item.type === "lesson").length / 
                      Math.max(1, studyPlan.filter(item => item.type === "lesson").length)) * 100)} 
                    icon={<BookOpen className="h-4 w-4" />}
                    color="green"
                  />
                  <ProgressCard 
                    title="Practice Completed" 
                    percentage={Math.round((studyPlan.filter(item => item.status === "completed" && item.type === "practice").length / 
                      Math.max(1, studyPlan.filter(item => item.type === "practice").length)) * 100)} 
                    icon={<BarChart className="h-4 w-4" />}
                    color="orange"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="upcoming" className="mt-6">
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <div className="flex w-max space-x-4 p-4">
                    {studyPlan
                      .filter(item => item.status === "future")
                      .slice(0, 7)
                      .map(item => (
                        <Card key={item.id} className="w-[250px] shrink-0">
                          <CardHeader className="p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">{item.dueDate}</span>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                item.type === 'lesson' ? 'bg-blue-100 text-blue-800' : 
                                item.type === 'quiz' ? 'bg-purple-100 text-purple-800' : 
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {item.type}
                              </span>
                            </div>
                            <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                            <CardDescription className="mt-1 line-clamp-2">{item.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-4 pt-0">
                            <Button 
                              size="sm" 
                              onClick={() => handleStartItem(item.id)} 
                              className="w-full"
                            >
                              Start Topic
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
