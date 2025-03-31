// Import required for the ReactNode type and icons
import React, { useEffect, useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { BookOpen, Clock, ListChecks, BarChart, ChevronLeft, BookText, CalendarDays, GraduationCap } from "lucide-react";
import StudyAIHeader from '@/components/StudyAIHeader';
import SubjectTopicList from '@/components/SubjectTopicList';
import WeeklyPlanView from '@/components/WeeklyPlanView';
import StudyPlanProgress from '@/components/StudyPlanProgress';
import StudyTimeline, { TimelineItem } from '@/components/StudyTimeline';
import { claudeService } from '@/services/claudeService';
import { studyPlanService } from '@/services/studyPlanService';

// Types for the component
interface Chapter {
  title: string;
  progress: number;
  lessons: {
    title: string;
    type: string;
    completed?: boolean;
  }[];
}

interface SubjectDetailsProps {}

// Mock data for topics if needed
const mockTopics = [
  {
    id: "chapter1",
    title: "Introduction to the Subject",
    description: "Basic overview of fundamental concepts",
    type: "lesson",
    estimatedTimeInMinutes: 30,
    lessons: [
      { id: "1.1", title: "Basic Concepts", type: "lesson" },
      { id: "1.2", title: "Fundamental Principles", type: "lesson" },
      { id: "1.3", title: "Chapter Review", type: "quiz" }
    ]
  },
  {
    id: "chapter2",
    title: "Advanced Concepts",
    description: "Deeper exploration of complex theories",
    type: "lesson",
    estimatedTimeInMinutes: 45,
    lessons: [
      { id: "2.1", title: "Complex Theories", type: "lesson" },
      { id: "2.2", title: "Practical Applications", type: "practice" },
      { id: "2.3", title: "Problem Solving", type: "quiz" }
    ]
  }
];

// Weekly plan mock data that matches WeeklyPlanView props
const mockWeeklyPlans = [
  {
    weekNumber: 1,
    startDate: "2023-09-01",
    endDate: "2023-09-07",
    dailyActivities: [
      {
        date: "2023-09-01",
        items: [
          {
            id: "1",
            title: "Introduction to Subject",
            description: "Getting started with basic concepts",
            type: "lesson",
            status: "completed",
            dueDate: "2023-09-01",
            estimatedTimeInMinutes: 30,
            subject: "Mathematics"
          }
        ]
      },
      {
        date: "2023-09-03",
        items: [
          {
            id: "2",
            title: "Basic Practice",
            description: "Apply what you've learned",
            type: "practice",
            status: "current",
            dueDate: "2023-09-03",
            estimatedTimeInMinutes: 45,
            subject: "Mathematics"
          }
        ]
      },
      {
        date: "2023-09-05",
        items: [
          {
            id: "3",
            title: "Weekly Quiz",
            description: "Test your knowledge",
            type: "quiz",
            status: "future",
            dueDate: "2023-09-05",
            estimatedTimeInMinutes: 20,
            subject: "Mathematics"
          }
        ]
      }
    ],
    weeklyTest: {
      id: "test1",
      title: "Week 1 Comprehensive Test",
      description: "Test covering all week 1 content",
      type: "quiz",
      status: "future",
      dueDate: "2023-09-07",
      estimatedTimeInMinutes: 60,
      subject: "Mathematics",
      isWeeklyTest: true,
      weekNumber: 1
    }
  }
];

// SubjectDetails component
const SubjectDetails: React.FC<SubjectDetailsProps> = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<string>(subjectId || "Unknown Subject");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState("chapters");
  const [progress, setProgress] = useState(0);
  const [nextLesson, setNextLesson] = useState({
    title: "",
    chapter: "",
    estimatedTime: 0
  });
  const [lastActivity, setLastActivity] = useState("");
  
  // Fetch subject details and chapters on component mount
  useEffect(() => {
    const loadSubjectDetails = async () => {
      setLoading(true);
      
      try {
        // Get the stored subjects from localStorage
        const storedSubjects = localStorage.getItem('selectedSubjects');
        if (storedSubjects) {
          const subjects = JSON.parse(storedSubjects);
          const foundSubject = subjects.find((s: string) => s.toLowerCase() === subjectId?.toLowerCase());
          if (foundSubject) {
            setSubject(foundSubject);
          }
        }
        
        // Get stored study plan for subject if available
        const storedPlan = localStorage.getItem(`studyPlan_${subjectId}`);
        if (storedPlan) {
          const plan = JSON.parse(storedPlan);
          if (plan.chapters && Array.isArray(plan.chapters)) {
            // Calculate progress for each chapter
            const chaptersWithProgress = plan.chapters.map((chapter: any) => ({
              ...chapter,
              progress: Math.floor(Math.random() * 100) // Mock progress - replace with real data
            }));
            setChapters(chaptersWithProgress);
            
            // Calculate overall progress
            const totalLessons = chaptersWithProgress.reduce(
              (acc: number, chapter: Chapter) => acc + chapter.lessons.length, 0
            );
            const completedLessons = chaptersWithProgress.reduce(
              (acc: number, chapter: Chapter) => 
                acc + chapter.lessons.filter(lesson => lesson.completed).length, 0
            );
            
            setProgress(totalLessons ? Math.floor((completedLessons / totalLessons) * 100) : 0);
            
            // Set next lesson (mock data - replace with real logic)
            if (chaptersWithProgress.length > 0 && chaptersWithProgress[0].lessons.length > 0) {
              setNextLesson({
                title: chaptersWithProgress[0].lessons[0].title,
                chapter: chaptersWithProgress[0].title,
                estimatedTime: 20
              });
            }
            
            // Set last activity
            setLastActivity(new Date().toLocaleDateString());
          }
        } else {
          // If no stored plan, try to generate one
          try {
            const className = localStorage.getItem('selectedClass') || '10';
            const board = localStorage.getItem('selectedBoard') || 'CBSE';
            
            toast.loading("Generating study plan...", {
              description: "Connecting to AI services to create your personalized plan"
            });
            
            const handleStatusUpdate = (status: { stage: string; progress: number; provider: string }) => {
              toast.loading(`${status.provider} AI: ${status.stage}`, {
                description: `Progress: ${status.progress}%`,
                id: "ai-progress-toast"
              });
              
              if (status.progress === 100) {
                toast.success(`${status.provider} generated content successfully`, {
                  id: "ai-progress-toast"
                });
              }
            };
            
            const studyPlan = await studyPlanService.getStudyPlan(
              subject, 
              board, 
              className, 
              handleStatusUpdate
            );
            
            if (studyPlan && studyPlan.chapters) {
              // Calculate progress for each chapter
              const chaptersWithProgress = studyPlan.chapters.map((chapter: any) => ({
                ...chapter,
                progress: 0 // Initial progress is 0
              }));
              
              setChapters(chaptersWithProgress);
              
              // Save to localStorage
              localStorage.setItem(`studyPlan_${subjectId}`, JSON.stringify({
                subject,
                board,
                className,
                chapters: chaptersWithProgress,
                lastUpdated: new Date().toISOString()
              }));
              
              // Set next lesson
              if (chaptersWithProgress.length > 0 && chaptersWithProgress[0].lessons.length > 0) {
                setNextLesson({
                  title: chaptersWithProgress[0].lessons[0].title,
                  chapter: chaptersWithProgress[0].title,
                  estimatedTime: 20
                });
              }
              
              toast.success("Study plan created successfully!");
            } else {
              // If API fails, use default chapters
              setChapters(
                mockTopics.map(topic => ({
                  title: topic.title,
                  progress: Math.floor(Math.random() * 100),
                  lessons: topic.lessons.map(lesson => ({
                    ...lesson,
                    completed: Math.random() > 0.5
                  }))
                }))
              );
              toast.error("Could not generate AI plan, using fallback data");
            }
          } catch (error) {
            console.error("Error generating study plan:", error);
            // Fall back to mock topics
            setChapters(
              mockTopics.map(topic => ({
                title: topic.title,
                progress: Math.floor(Math.random() * 100),
                lessons: topic.lessons.map(lesson => ({
                  ...lesson,
                  completed: Math.random() > 0.5
                }))
              }))
            );
            toast.error("Failed to generate study plan, using default content");
          }
        }
      } catch (error) {
        console.error("Error loading subject details:", error);
        toast.error("Failed to load subject details");
      } finally {
        setLoading(false);
      }
    };
    
    loadSubjectDetails();
  }, [subjectId]);
  
  const handleStartLesson = (lesson: string, chapter: string) => {
    // Store the current study item for the lesson page
    localStorage.setItem('currentStudyItem', JSON.stringify({
      title: lesson,
      subject: subject,
      chapter: chapter,
      className: localStorage.getItem('selectedClass') || '10'
    }));
    
    // Navigate to the lesson page
    navigate(`/lesson/${encodeURIComponent(lesson)}`);
  };
  
  // Navigation items for the header
  const navigationItems = [
    { 
      name: "Dashboard", 
      href: "/dashboard", 
      icon: <ChevronLeft className="h-4 w-4" /> 
    },
    { 
      name: "Browse Library", 
      href: "/library", 
      icon: <BookOpen className="h-4 w-4" /> 
    }
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StudyAIHeader
          userName="Student"
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="container py-6 md:py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">Loading Subject Details</h2>
              <p className="text-muted-foreground mt-2">Please wait while we prepare your study materials...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Map chapters data to SubjectTopic format for the SubjectTopicList component
  const subjectTopics = chapters.length > 0 ? chapters.map(chapter => ({
    id: chapter.title,
    title: chapter.title,
    description: `Progress: ${chapter.progress}%`,
    type: "lesson" as "lesson" | "quiz" | "practice",
    estimatedTimeInMinutes: 30
  })) : mockTopics.map(topic => ({
    id: topic.id,
    title: topic.title,
    description: topic.description,
    type: topic.type as "lesson" | "quiz" | "practice",
    estimatedTimeInMinutes: topic.estimatedTimeInMinutes
  }));

  // This function generates the timeline items with proper types
  const generateTimelineItems = (): TimelineItem[] => {
    if (!chapters || chapters.length === 0) {
      return [];
    }

    // Create timeline items from chapters and lessons with proper status types
    const timelineItems: TimelineItem[] = [];
    
    // First few completed items
    if (chapters.length > 0 && chapters[0].lessons && chapters[0].lessons.length > 0) {
      timelineItems.push({
        id: "event1",
        title: `Started ${chapters[0].title}`,
        description: "Beginning your learning journey",
        status: "completed" as "completed",
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        type: "lesson" as "lesson"
      });
    }
    
    if (chapters.length > 0 && chapters[0].lessons && chapters[0].lessons.length > 0) {
      timelineItems.push({
        id: "event2",
        title: `Completed Quiz on ${chapters[0].title}`,
        description: "8/10 questions answered correctly",
        status: "completed" as "completed",
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        type: "quiz" as "quiz"
      });
    }
    
    // Current item
    if (chapters.length > 1) {
      timelineItems.push({
        id: "event3",
        title: `Start ${chapters[1].title}`,
        description: "Moving to advanced concepts",
        status: "current" as "current",
        dueDate: new Date().toLocaleDateString(),
        type: "lesson" as "lesson"
      });
    }
    
    // Future items
    if (chapters.length > 2) {
      timelineItems.push({
        id: "event4",
        title: `Upcoming ${chapters[2].title}`,
        description: "Get ready for the next topic",
        status: "future" as "future",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        type: "practice" as "practice"
      });
    }
    
    return timelineItems;
  };
  
  return (
    <div className="min-h-screen bg-background">
      <StudyAIHeader
        userName="Student"
        level={parseInt(localStorage.getItem('currentLevel') || '1')}
        xp={parseInt(localStorage.getItem('currentXp') || '0')}
        navigation={navigationItems}
      />
      
      <main className="container py-6 md:py-12">
        {/* Subject Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{subject}</h1>
            <p className="text-muted-foreground">
              Class {localStorage.getItem('selectedClass') || '10'} • {localStorage.getItem('selectedBoard') || 'CBSE'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => handleStartLesson(nextLesson.title, nextLesson.chapter)}>
              Continue Learning
            </Button>
          </div>
        </div>
        
        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress}%</div>
              <Progress value={progress} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Based on completed lessons
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Next Lesson</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold truncate" style={{ maxWidth: "200px" }}>
                {nextLesson.title || "No upcoming lessons"}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{nextLesson.estimatedTime} minutes</span>
              </div>
              <Button
                variant="link"
                className="p-0 h-auto text-xs mt-2"
                onClick={() => handleStartLesson(nextLesson.title, nextLesson.chapter)}
              >
                Start Lesson
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Chapters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chapters.length}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)} total lessons
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold">{lastActivity || "No recent activity"}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Continue your progress
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabs Section */}
        <Tabs defaultValue="chapters" className="mb-8" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chapters" className="mt-6">
            <SubjectTopicList
              subject={subject}
              className={localStorage.getItem('selectedClass') || '10'}
              topics={subjectTopics}
              onSelectTopic={(topic) => handleStartLesson(topic.title, topic.id)}
            />
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-6">
            <WeeklyPlanView
              weeklyPlans={mockWeeklyPlans}
              onStartItem={(id) => {
                toast(`Selected: ${id}`);
              }}
              testScores={{}}
            />
          </TabsContent>
          
          <TabsContent value="progress" className="mt-6">
            <StudyPlanProgress
              subjects={[subject]}
              board={localStorage.getItem('selectedBoard') || 'CBSE'}
              className={localStorage.getItem('selectedClass') || '10'}
              onComplete={() => {
                toast("Study plans generated");
              }}
            />
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <StudyTimeline
              items={generateTimelineItems()}
              onStartItem={(id) => {
                toast(`Starting item: ${id}`);
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SubjectDetails;
