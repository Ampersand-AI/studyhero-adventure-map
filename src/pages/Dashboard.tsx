
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, User } from '@/services/userService';
import { studyPlanService } from '@/services/studyPlanService';
import StudyAIHeader from '@/components/StudyAIHeader';
import SubjectCardGrid from '@/components/SubjectCardGrid';
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
  content?: string;
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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
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
            description: `Creating plans for ${subjectsToGenerate.length} subjects based on NCERT curriculum...`,
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
            description: `Created personalized plans for ${newPlans.length} subjects from NCERT curriculum.`,
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
  
  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject === selectedSubject ? null : subject);
  };
  
  const handleGenerateStudyPlan = () => {
    navigate('/onboarding');
  };
  
  const getFilteredWeeklyPlans = () => {
    if (!selectedSubject) return [];
    
    // Filter the weekly plans to only include items related to the selected subject
    return weeklyPlans.map(weekPlan => {
      // Create a copy of the weekly plan
      const filteredWeekPlan = { ...weekPlan };
      
      // Filter daily activities to only include items for the selected subject
      filteredWeekPlan.dailyActivities = weekPlan.dailyActivities.map(day => {
        return {
          ...day,
          items: day.items.filter(item => item.subject === selectedSubject)
        };
      }).filter(day => day.items.length > 0); // Only include days that have items
      
      return filteredWeekPlan;
    }).filter(weekPlan => {
      // Include week if it has daily activities or if the weekly test is for the selected subject
      const hasActivities = weekPlan.dailyActivities.length > 0;
      const testIsForSubject = weekPlan.weeklyTest.subject === selectedSubject || 
                              weekPlan.weeklyTest.subject === "All Subjects";
      
      return hasActivities || testIsForSubject;
    });
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
          </div>
          <Button onClick={handleGenerateStudyPlan}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Update Study Plan
          </Button>
        </div>
        
        {initialLoadComplete && subjects.length === 0 && (
          <Alert className="my-4">
            <Info className="h-4 w-4" />
            <AlertTitle>No subjects found</AlertTitle>
            <AlertDescription>
              You haven't added any subjects yet. Click "Update Study Plan" to add subjects.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4">
          {!selectedSubject ? (
            // Show subject cards when no subject is selected
            <SubjectCardGrid 
              subjects={subjects} 
              onSelectSubject={handleSelectSubject} 
            />
          ) : (
            // Show weekly plan for selected subject
            <>
              <div className="mb-4 flex items-center">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSubject(null)}
                  className="mr-2"
                >
                  ← Back to Subjects
                </Button>
                <h2 className="text-xl font-semibold">{selectedSubject} Curriculum</h2>
              </div>
              
              <WeeklyPlanView 
                weeklyPlans={getFilteredWeeklyPlans()} 
                onStartItem={handleStartItem} 
                testScores={testScores}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
