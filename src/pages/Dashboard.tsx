
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, User } from '@/services/userService';
import { studyPlanService } from '@/services/studyPlanService';
import { claudeService } from '@/services/claudeService';
import StudyAIHeader from '@/components/StudyAIHeader';
import WeeklyPlanView from '@/components/WeeklyPlanView';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Home, Trophy, BarChart, PlusCircle, BookOpen, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StudyItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  status: "completed" | "current" | "future";
  dueDate: string;
  content?: string; // Make content optional
  estimatedTimeInMinutes: number;
  subject?: string;
  isWeeklyTest?: boolean;
  weekNumber?: number;
}

interface StudyPlan {
  id: string;
  subject: string;
  items: StudyItem[];
}

interface WeeklyTest {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  estimatedTimeInMinutes: number;
  subject: string;
  isWeeklyTest: boolean;
  weekNumber: number;
}

interface DailyActivity {
  date: string;
  items: StudyItem[];
}

interface WeeklyPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  dailyActivities: DailyActivity[];
  weeklyTest: WeeklyTest;
}

interface TestScore {
  id: string;
  subject: string;
  weekNumber: number;
  score: number;
  date: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testScores, setTestScores] = useState<Record<string, number>>({});
  const [subjects, setSubjects] = useState<string[]>([]);
  
  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart className="h-4 w-4" /> },
  ];
  
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load user data
        const userData = await userService.getUserProfile();
        setUser(userData);
        
        // Get user profile from localStorage
        const profileData = localStorage.getItem('studyHeroProfile');
        if (!profileData) {
          // If no profile exists, redirect to onboarding
          navigate('/onboarding');
          return;
        }
        
        const profile = JSON.parse(profileData);
        const userSubjects = profile.subjects || [];
        setSubjects(userSubjects);
        
        if (userSubjects.length === 0) {
          toast({
            title: "No subjects found",
            description: "Please add subjects to your profile to generate a study plan.",
          });
          navigate('/onboarding');
          return;
        }
        
        // Load study plans
        const savedPlans = localStorage.getItem('studyPlans');
        let existingPlans: StudyPlan[] = [];
        
        if (savedPlans) {
          existingPlans = JSON.parse(savedPlans);
          setStudyPlans(existingPlans);
        }
        
        // Check if we need to generate plans for subjects that don't have one
        const existingSubjects = existingPlans.map(plan => plan.subject);
        const subjectsToGenerate = userSubjects.filter(subject => !existingSubjects.includes(subject));
        
        // Show an initial loading notification
        if (subjectsToGenerate.length > 0) {
          toast({
            title: "Generating Study Plans",
            description: `Creating plans for ${subjectsToGenerate.length} subjects...`,
          });
          
          const newPlans: StudyPlan[] = [];
          
          for (const subject of subjectsToGenerate) {
            try {
              const plan = await studyPlanService.createStudyPlan(subject);
              newPlans.push(plan);
            } catch (err) {
              console.error(`Error generating plan for ${subject}:`, err);
            }
          }
          
          const updatedPlans = [...existingPlans, ...newPlans];
          setStudyPlans(updatedPlans);
          localStorage.setItem('studyPlans', JSON.stringify(updatedPlans));
          
          toast({
            title: "Study Plans Ready",
            description: `Created personalized plans for ${newPlans.length} subjects.`,
          });
        }
        
        // Load or generate weekly plans
        const savedWeeklyPlans = localStorage.getItem('weeklyPlans');
        
        if (savedWeeklyPlans) {
          const parsedWeeklyPlans = JSON.parse(savedWeeklyPlans);
          setWeeklyPlans(parsedWeeklyPlans);
          
          // Only show notification on first load
          if (!initialLoadComplete) {
            toast({
              title: "Weekly Schedule Loaded",
              description: "Your personalized study schedule is ready.",
            });
          }
        } else {
          // Generate new weekly plans
          toast({
            title: "Creating Weekly Schedule",
            description: "Organizing your study material into a weekly plan...",
          });
          
          const { weeklyPlans: newWeeklyPlans } = await studyPlanService.getWeeklyPlans();
          
          setWeeklyPlans(newWeeklyPlans);
          localStorage.setItem('weeklyPlans', JSON.stringify(newWeeklyPlans));
          
          toast({
            title: "Weekly Plan Ready",
            description: `Your ${newWeeklyPlans.length}-week personalized schedule is ready to use.`,
          });
        }
        
        // Load test scores
        const savedScores = localStorage.getItem('weeklyTestScores');
        if (savedScores) {
          const scores: TestScore[] = JSON.parse(savedScores);
          const scoresMap: Record<string, number> = {};
          scores.forEach(score => {
            scoresMap[`test-week-${score.weekNumber}`] = score.score;
          });
          setTestScores(scoresMap);
        }
        
        setInitialLoadComplete(true);
        
      } catch (err: any) {
        console.error("Error loading dashboard data:", err);
        setError(err.message || "Failed to load dashboard data.");
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [navigate]);
  
  const handleStartItem = (itemId: string) => {
    // Find the item in the study plan
    let foundItem: StudyItem | null = null;
    
    // First check in regular study items
    for (const plan of studyPlans) {
      const item = plan.items.find(item => item.id === itemId);
      if (item) {
        foundItem = item;
        break;
      }
    }
    
    // Then check in weekly tests if not found
    if (!foundItem) {
      for (const weeklyPlan of weeklyPlans) {
        if (weeklyPlan.weeklyTest.id === itemId) {
          // Convert WeeklyTest to StudyItem with explicit type casting and adding content property
          foundItem = {
            ...weeklyPlan.weeklyTest,
            content: "", // Add empty content property to satisfy the StudyItem interface
          } as StudyItem;
          break;
        }
        
        // Also check in daily activities
        for (const day of weeklyPlan.dailyActivities) {
          const item = day.items.find(item => item.id === itemId);
          if (item) {
            foundItem = item;
            break;
          }
        }
        if (foundItem) break;
      }
    }
    
    if (foundItem) {
      // Save the current study item
      localStorage.setItem('currentStudyItem', JSON.stringify(foundItem));
      
      // Show a notification when starting a study item
      toast({
        title: `Starting ${foundItem.type === 'quiz' || foundItem.isWeeklyTest ? 'Quiz' : 'Lesson'}`,
        description: `Loading ${foundItem.title}...`,
      });
      
      // Navigate based on item type
      if (foundItem.type === 'quiz' || foundItem.isWeeklyTest) {
        navigate(`/quiz/${foundItem.id}`);
      } else if (foundItem.type === 'lesson') {
        navigate(`/lesson/${foundItem.id}`);
      }
    } else {
      toast({
        title: "Item Not Found",
        description: "Unable to find the selected study item.",
        variant: "destructive"
      });
    }
  };
  
  const handleGenerateStudyPlan = () => {
    navigate('/onboarding');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader userName="Student" level={1} xp={0} navigation={navigationItems} />
        <main className="flex-1 container py-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Loading Dashboard</CardTitle>
              <CardDescription>Fetching your study plans and progress...</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader userName="Student" level={1} xp={0} navigation={navigationItems} />
        <main className="flex-1 container py-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Error Loading Dashboard</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader
        userName={user?.name || "Student"}
        level={user?.level || 1}
        xp={user?.xp || 0}
        navigation={navigationItems}
      />
      <main className="flex-1 container py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Let's continue your learning journey.</p>
            {subjects.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {subjects.map(subject => (
                  <span key={subject} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {subject}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleGenerateStudyPlan}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Update Study Plan
          </Button>
        </div>
        
        {initialLoadComplete && weeklyPlans.length === 0 && (
          <Alert className="my-4">
            <Info className="h-4 w-4" />
            <AlertTitle>No study plan found</AlertTitle>
            <AlertDescription>
              You haven't generated a study plan yet. Click "Update Study Plan" to create one.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4">
          {weeklyPlans && weeklyPlans.length > 0 ? (
            <WeeklyPlanView weeklyPlans={weeklyPlans} onStartItem={handleStartItem} testScores={testScores} />
          ) : (
            <Card className="w-full">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No weekly plan available yet. Generate a study plan to get started.</p>
                  <Button onClick={handleGenerateStudyPlan} className="mt-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Generate Study Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
