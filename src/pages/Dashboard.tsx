import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudyAIHeader } from '@/components/StudyAIHeader';
import ProgressCard from '@/components/ProgressCard';
import StudyTimeline from '@/components/StudyTimeline';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, BookOpen, BarChart, Award, Home, Trophy, Map, Loader2, PlusCircle, Trash2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { claudeService } from '@/services/claudeService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudyItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  status: "completed" | "current" | "future";
  dueDate: string;
  content: string;
  estimatedTimeInMinutes: number;
  subject?: string;
}

interface SubjectPlan {
  subject: string;
  items: StudyItem[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyPlans, setStudyPlans] = useState<SubjectPlan[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>("");
  const [profileInfo, setProfileInfo] = useState<any>({
    board: '',
    className: '',
    subject: '',
    userName: 'Student'
  });

  // For new subject dialog
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newSubjectClass, setNewSubjectClass] = useState("");
  const [newSubjectBoard, setNewSubjectBoard] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // New dialog state for reset confirmation
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

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

    // Load all study plans
    loadStudyPlans();
  }, [navigate]);

  const loadStudyPlans = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all study plans from localStorage
      const plans = localStorage.getItem('studyPlans');
      
      if (plans) {
        const parsedPlans = JSON.parse(plans) as SubjectPlan[];
        setStudyPlans(parsedPlans);
        
        // Set active subject to the first one if not already set
        if (parsedPlans.length > 0 && !activeSubject) {
          setActiveSubject(parsedPlans[0].subject);
        }
      } else {
        // If no plans exist yet, create one for the main subject from profile
        const profile = localStorage.getItem('studyHeroProfile');
        if (profile) {
          const { subject, board, className } = JSON.parse(profile);
          generateStudyPlan(board, className, subject)
            .then(plan => {
              if (plan) {
                const newPlans = [{
                  subject,
                  items: plan
                }];
                setStudyPlans(newPlans);
                setActiveSubject(subject);
                localStorage.setItem('studyPlans', JSON.stringify(newPlans));
              }
            })
            .catch(err => {
              console.error("Error in initial study plan generation:", err);
              setError("Failed to generate your study plan. Please try again later.");
            });
        }
      }
    } catch (e) {
      console.error("Error loading study plans:", e);
      setError("Failed to load your study plans. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateStudyPlan = async (board: string, className: string, subject: string): Promise<StudyItem[] | null> => {
    try {
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
          type: item.type || ["lesson", "quiz", "practice"][index % 3],
          subject
        };
      });
      
      return processedPlan;
    } catch (error) {
      console.error("Error generating study plan:", error);
      setError("Failed to generate your study plan. Please try again later.");
      toast({
        title: "Error generating study plan",
        description: "Please try again later",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleStartItem = (id: string) => {
    // Find the active subject plan
    const activePlan = studyPlans.find(plan => plan.subject === activeSubject);
    if (!activePlan) return;
    
    // Find the item in study plan
    const item = activePlan.items.find(item => item.id === id);
    if (item) {
      // Save the current item to localStorage for the lesson/quiz page
      localStorage.setItem('currentStudyItem', JSON.stringify(item));
      
      if (item.type === 'quiz') {
        navigate(`/quiz/${id}`);
      } else {
        navigate(`/lesson/${id}`);
      }
    }
  };

  const handleRegeneratePlan = () => {
    // Regenerate only the active subject plan
    setIsLoading(true);
    setError(null);
    
    generateStudyPlan(profileInfo.board, profileInfo.className, activeSubject)
      .then(plan => {
        if (plan) {
          // Update just the active plan
          const updatedPlans = studyPlans.map(p => 
            p.subject === activeSubject ? { ...p, items: plan } : p
          );
          
          setStudyPlans(updatedPlans);
          localStorage.setItem('studyPlans', JSON.stringify(updatedPlans));
          
          toast({
            title: "Study plan regenerated!",
            description: `Your ${activeSubject} study plan has been updated`,
          });
        }
      })
      .catch(err => {
        console.error("Error regenerating study plan:", err);
        toast({
          title: "Failed to regenerate study plan",
          description: "Please try again later",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleAddSubject = async () => {
    if (!newSubject || !newSubjectClass || !newSubjectBoard) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields for the new subject",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingPlan(true);
    setError(null);
    
    try {
      // Check if subject already exists
      if (studyPlans.some(plan => plan.subject.toLowerCase() === newSubject.toLowerCase())) {
        toast({
          title: "Subject already exists",
          description: "This subject is already in your study plans",
          variant: "destructive"
        });
        return;
      }
      
      // Generate new plan
      const newPlan = await generateStudyPlan(newSubjectBoard, newSubjectClass, newSubject);
      
      if (newPlan) {
        // Add to existing plans
        const updatedPlans = [...studyPlans, {
          subject: newSubject,
          items: newPlan
        }];
        
        setStudyPlans(updatedPlans);
        setActiveSubject(newSubject);
        localStorage.setItem('studyPlans', JSON.stringify(updatedPlans));
        
        // Clear the form
        setNewSubject("");
        setNewSubjectClass("");
        setNewSubjectBoard("");
        setIsAddingSubject(false);
        
        toast({
          title: "Subject added!",
          description: `Your ${newSubject} study plan is now ready`,
        });
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      toast({
        title: "Error adding subject",
        description: "Failed to create study plan for this subject",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleClearUserData = () => {
    setIsResetDialogOpen(true);
  };

  const confirmClearUserData = () => {
    try {
      // Call the service method to clear all data
      claudeService.clearAllUserData();
      
      // After clearing data, redirect to onboarding or reload page
      navigate('/onboarding');
    } catch (error) {
      console.error("Error clearing user data:", error);
      toast({
        title: "Error",
        description: "Failed to clear user data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetDialogOpen(false);
    }
  };

  // Get the current active plan
  const activePlan = studyPlans.find(plan => plan.subject === activeSubject);
  const activeItems = activePlan?.items || [];

  // Calculate progress for the active plan
  const totalItems = activeItems.length;
  const completedItems = activeItems.filter(item => item.status === "completed").length;
  const completionPercentage = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader 
        userName={profileInfo.userName || "Student"} 
        level={parseInt(localStorage.getItem('currentLevel') || '1')}
        xp={parseInt(localStorage.getItem('currentXp') || '0')}
        navigation={navigationItems}
      />
      
      <main className="flex-1">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-display">
                {activeSubject} Adventure
              </h1>
              <p className="text-muted-foreground">
                Class {profileInfo.className} • {profileInfo.board}
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                onClick={handleRegeneratePlan}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Plan
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleClearUserData}
                className="border-destructive text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Data
              </Button>
              
              <Dialog open={isAddingSubject} onOpenChange={setIsAddingSubject}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subject</DialogTitle>
                    <DialogDescription>
                      Add a new subject to your study plan. This will generate a complete curriculum for the subject.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subject" className="text-right">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. Mathematics, Physics, Biology"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="class" className="text-right">
                        Class
                      </Label>
                      <Input
                        id="class"
                        value={newSubjectClass}
                        onChange={(e) => setNewSubjectClass(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. 8, 9, 10"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="board" className="text-right">
                        Board
                      </Label>
                      <Input
                        id="board"
                        value={newSubjectBoard}
                        onChange={(e) => setNewSubjectBoard(e.target.value)}
                        className="col-span-3"
                        placeholder="e.g. CBSE, ICSE, State Board"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingSubject(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubject} disabled={isGeneratingPlan}>
                      {isGeneratingPlan ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Plan...
                        </>
                      ) : (
                        "Add Subject"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {studyPlans.length > 1 && (
            <div className="mb-6">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 p-2">
                  {studyPlans.map((plan, index) => (
                    <Button
                      key={index}
                      variant={plan.subject === activeSubject ? "default" : "outline"}
                      onClick={() => setActiveSubject(plan.subject)}
                      className="flex-shrink-0"
                    >
                      {plan.subject}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

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
                ) : activeItems.length > 0 ? (
                  <StudyTimeline items={activeItems} onStartItem={handleStartItem} />
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No study plan available</h3>
                    <p className="text-muted-foreground mt-2">Click the Regenerate button to create a new study plan</p>
                    <Button className="mt-4" onClick={handleRegeneratePlan}>
                      Generate Study Plan
                    </Button>
                  </div>
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
                    percentage={Math.round((activeItems.filter(item => item.status === "completed" && item.type === "quiz").length / 
                      Math.max(1, activeItems.filter(item => item.type === "quiz").length)) * 100)} 
                    icon={<Award className="h-4 w-4" />}
                    color="purple"
                  />
                  <ProgressCard 
                    title="Lessons Studied" 
                    percentage={Math.round((activeItems.filter(item => item.status === "completed" && item.type === "lesson").length / 
                      Math.max(1, activeItems.filter(item => item.type === "lesson").length)) * 100)} 
                    icon={<BookOpen className="h-4 w-4" />}
                    color="green"
                  />
                  <ProgressCard 
                    title="Practice Completed" 
                    percentage={Math.round((activeItems.filter(item => item.status === "completed" && item.type === "practice").length / 
                      Math.max(1, activeItems.filter(item => item.type === "practice").length)) * 100)} 
                    icon={<BarChart className="h-4 w-4" />}
                    color="orange"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="upcoming" className="mt-6">
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <div className="flex w-max space-x-4 p-4">
                    {activeItems
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

          {/* Add reset confirmation dialog */}
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reset All Data</DialogTitle>
                <DialogDescription>
                  This will clear all your study plans, progress, and achievements. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmClearUserData}
                >
                  Reset All Data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    </div>
  );
};

export default Dashboard;
