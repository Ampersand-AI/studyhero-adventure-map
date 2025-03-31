
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudyAIHeader from "@/components/StudyAIHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, BookOpenCheck, CheckCircle, Clock, Settings } from "lucide-react";
import SubjectTopicList from "@/components/SubjectTopicList";
import WeeklyPlanView from "@/components/WeeklyPlanView";
import StudyTimeline from "@/components/StudyTimeline";
import { toast } from "sonner";

interface Lesson {
  title: string;
  type: string;
}

interface Chapter {
  title: string;
  lessons: Lesson[];
}

interface StudyPlan {
  subject: string;
  board: string;
  className: string;
  chapters: Chapter[];
  lastUpdated: string;
}

// Mock data structure for topic list
const mockTopics = [
  {
    id: "1",
    title: "Introduction to the Subject",
    description: "Overview of key concepts and fundamentals",
    type: "lesson" as const,
    estimatedTimeInMinutes: 30,
    chapterNumber: 1,
    difficulty: "beginner" as const
  },
  {
    id: "2",
    title: "Basic Principles",
    description: "Understanding the core principles",
    type: "lesson" as const,
    estimatedTimeInMinutes: 45,
    chapterNumber: 2,
    difficulty: "beginner" as const
  }
];

// Mock data for weekly plans
const mockWeeklyPlans = [
  {
    weekNumber: 1,
    startDate: "Sep 1",
    endDate: "Sep 7",
    dailyActivities: [
      {
        date: "2023-09-01",
        items: [
          {
            id: "activity-1",
            title: "Introduction",
            description: "Basic concepts",
            type: "lesson",
            estimatedTimeInMinutes: 30,
            subject: "Physics"
          }
        ]
      }
    ],
    weeklyTest: {
      id: "test-week-1",
      title: "Week 1 Test",
      description: "Test your knowledge",
      type: "quiz",
      status: "upcoming",
      dueDate: "Sep 7",
      estimatedTimeInMinutes: 45,
      subject: "Physics",
      isWeeklyTest: true,
      weekNumber: 1
    }
  }
];

const SubjectDetails = () => {
  const { subject } = useParams<{ subject: string }>();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load user profile
    const profileData = localStorage.getItem('studyHeroProfile');
    if (profileData) {
      const parsedProfile = JSON.parse(profileData);
      setUserProfile(parsedProfile);
    } else {
      navigate('/onboarding');
      return;
    }
    
    // Get selected subject from localStorage
    const selectedSubject = localStorage.getItem('selectedSubject') || subject;
    if (!selectedSubject) {
      navigate('/dashboard');
      return;
    }
    
    // Load study plan for the subject
    const loadStudyPlan = () => {
      setLoading(true);
      
      // Try to get from localStorage
      const studyPlanKey = `studyPlan_${selectedSubject}_${userProfile?.board}_${userProfile?.class}`;
      const savedPlan = localStorage.getItem(studyPlanKey);
      
      if (savedPlan) {
        try {
          const parsedPlan = JSON.parse(savedPlan);
          setStudyPlan(parsedPlan);
        } catch (e) {
          console.error("Error parsing saved study plan:", e);
        }
      }
      
      setLoading(false);
    };
    
    if (userProfile) {
      loadStudyPlan();
    }
  }, [navigate, subject, userProfile]);
  
  const generateTimelineItems = () => {
    if (!studyPlan) return [];
    
    let items = [];
    let id = 1;
    
    // Extract lessons from chapters and convert to timeline items
    for (const chapter of studyPlan.chapters) {
      for (const lesson of chapter.lessons) {
        // Calculate a due date (just for display purposes)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + id);
        
        items.push({
          id: String(id),
          title: lesson.title,
          description: `${chapter.title} - ${lesson.title}`,
          status: id === 1 ? "current" : "future",
          dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          type: lesson.type as "lesson" | "quiz" | "practice"
        });
        
        id++;
      }
    }
    
    return items;
  };
  
  const handleStartItem = (id: string) => {
    // Navigate based on the type of item
    const timelineItems = generateTimelineItems();
    const item = timelineItems.find(item => item.id === id);
    
    if (item) {
      if (item.type === "quiz") {
        navigate(`/quiz/${id}`);
      } else {
        navigate(`/lesson/${id}`);
      }
    }
  };

  const handleWeeklyPlanStartItem = (id: string) => {
    if (id.includes('quiz')) {
      navigate(`/quiz/${id}`);
    } else {
      navigate(`/lesson/${id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader 
          userName={userProfile?.name || "Student"}
          level={1}
          xp={0}
          navigation={[]}
        />
        <main className="flex-1 container py-6 flex items-center justify-center">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading subject data...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!studyPlan) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader 
          userName={userProfile?.name || "Student"}
          level={1}
          xp={0}
          navigation={[]}
        />
        <main className="flex-1 container py-6 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Subject Not Found</CardTitle>
              <CardDescription>We couldn't find study material for this subject.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  const timelineItems = generateTimelineItems();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader 
        userName={userProfile?.name || "Student"}
        level={parseInt(localStorage.getItem('currentLevel') || '1')}
        xp={parseInt(localStorage.getItem('currentXp') || '0')}
        navigation={[
          { name: "Dashboard", href: "/dashboard" },
          { name: studyPlan.subject, href: "#" }
        ]}
      />
      
      <main className="flex-1 container py-6 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{studyPlan.subject}</CardTitle>
                    <CardDescription>
                      {studyPlan.board} Curriculum for Class {studyPlan.className}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex gap-2 items-center">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Progress</p>
                        <p className="text-2xl font-bold">10%</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-2xl font-bold">2/20</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Time Spent</p>
                        <p className="text-2xl font-bold">1h 20m</p>
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={10} className="h-2" />
                  
                  <div className="text-sm text-muted-foreground">
                    Current Chapter: Introduction to {studyPlan.subject}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="topics">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="topics">Topics</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="topics" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <CardDescription>
                      Complete curriculum based on {studyPlan.board} standards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubjectTopicList
                      subject={studyPlan.subject}
                      className={studyPlan.className}
                      topics={mockTopics}
                      onSelectTopic={(topic) => navigate(`/lesson/${topic.id}`)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="weekly" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Study Plan</CardTitle>
                    <CardDescription>
                      Your customized weekly schedule for {studyPlan.subject}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WeeklyPlanView 
                      weeklyPlans={mockWeeklyPlans}
                      onStartItem={handleWeeklyPlanStartItem}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Study Timeline</CardTitle>
                    <CardDescription>
                      Your personalized learning pathway
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StudyTimeline 
                      items={timelineItems}
                      onStartItem={handleStartItem}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="lg:w-1/3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Next Up</CardTitle>
                <CardDescription>Continue where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <BookOpenCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">20 min</span>
                  </div>
                  <h3 className="font-medium">Introduction to {studyPlan.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn the fundamental concepts and terminology of {studyPlan.subject}
                  </p>
                  <Button onClick={() => navigate('/lesson/intro')} className="w-full">
                    Continue Learning
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <BookOpenCheck className="h-5 w-5 text-orange-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">15 min</span>
                  </div>
                  <h3 className="font-medium">Practice Quiz</h3>
                  <p className="text-sm text-muted-foreground">
                    Test your understanding of the introduction to {studyPlan.subject}
                  </p>
                  <Button onClick={() => navigate('/quiz/intro')} variant="outline" className="w-full">
                    Start Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Study Resources</CardTitle>
                <CardDescription>Additional learning materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => toast("Opening PDF resources")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {studyPlan.subject} Textbook PDF
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast("Opening video resources")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Video Lessons
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast("Opening practice problems")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Practice Problems
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubjectDetails;
