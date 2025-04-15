
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Check, ChevronRight, BookOpen, Clock, BarChart, Home, Settings } from "lucide-react";
import StudyAIHeader from '@/components/StudyAIHeader';
import SubjectTopicList, { SubjectTopic } from '@/components/SubjectTopicList';
import { useStudyPlan } from '@/contexts/StudyPlanContext';
import StudyTimeline, { TimelineItem } from '@/components/StudyTimeline';
import { studyPlanService } from '@/services/studyPlanService';

const defaultNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4" /> },
  { name: 'Subjects', href: '/dashboard?tab=subjects', icon: <BookOpen className="h-4 w-4" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> }
];

const SubjectDetails = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<SubjectTopic[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { updateAIStatus } = useStudyPlan();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [subject, setSubject] = useState<string>("");
  const [studyPlan, setStudyPlan] = useState<any>(null);

  useEffect(() => {
    // Format the subject name for display
    if (subjectName) {
      const formattedName = subjectName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      setSubject(formattedName);
      document.title = `StudyHero - ${formattedName}`;
      
      // Try to load the study plan
      loadStudyPlan(formattedName);
    }
  }, [subjectName]);

  const loadStudyPlan = async (subjectTitle: string) => {
    setIsLoading(true);
    updateAIStatus({ stage: "Loading study plan", progress: 10, provider: "System" });
    
    try {
      // Check if we have a study plan in localStorage
      const board = localStorage.getItem('board') || 'NCERT';
      const classLevel = localStorage.getItem('class') || '10';
      const studyPlanKey = `studyPlan_${subjectTitle}_${board}_${classLevel}`;
      let plan = null;
      
      // Try to get from localStorage first
      const savedPlan = localStorage.getItem(studyPlanKey);
      if (savedPlan) {
        plan = JSON.parse(savedPlan);
      } else {
        // Generate a new plan if not found
        const modelProvider = JSON.parse(localStorage.getItem('selected_models') || '[]')[0]?.id || 'System';
        
        updateAIStatus({ stage: "Generating study plan", progress: 30, provider: modelProvider });
        
        plan = await studyPlanService.getStudyPlan(
          subjectTitle, 
          board, 
          classLevel,
          (status) => updateAIStatus({...status, provider: modelProvider})
        );
        
        // Save to localStorage
        localStorage.setItem(studyPlanKey, JSON.stringify(plan));
      }
      
      // Process the study plan
      setStudyPlan(plan);
      
      if (plan && plan.chapters) {
        // Create topics from chapters
        const topicsList: SubjectTopic[] = plan.chapters.flatMap((chapter, index) => {
          // Convert lessons to topics
          return (chapter.lessons || []).map((lesson, lessonIndex) => ({
            id: `${index}-${lessonIndex}`,
            title: lesson.title || `Lesson ${lessonIndex + 1}`,
            description: `Chapter ${index + 1}: ${chapter.title}`,
            type: lesson.type || "lesson",
            estimatedTimeInMinutes: 30,
            completed: false
          }));
        });
        
        setTopics(topicsList);
        
        // Create timeline from the first few topics
        const timeline: TimelineItem[] = topicsList.slice(0, 5).map((topic, index) => ({
          id: topic.id,
          title: topic.title,
          description: topic.description,
          date: `Day ${index + 1}`,
          type: topic.type,
          status: 'upcoming'
        }));
        
        setTimelineItems(timeline);
      }
      
      updateAIStatus({ stage: "Study plan loaded", progress: 100, provider: "System" });
    } catch (error) {
      console.error("Error loading study plan:", error);
      toast.error("Failed to load study plan. Please try again.");
      
      // Create fallback topics if we couldn't load
      setTopics([
        { 
          id: '1', 
          title: 'Introduction to Subject', 
          description: 'Basic concepts and overview', 
          type: 'lesson',
          estimatedTimeInMinutes: 30,
          completed: false 
        },
        { 
          id: '2', 
          title: 'Core Concepts', 
          description: 'Fundamental principles',
          type: 'lesson',
          estimatedTimeInMinutes: 30, 
          completed: false 
        },
        { 
          id: '3', 
          title: 'Practice Quiz', 
          description: 'Test your knowledge',
          type: 'quiz',
          estimatedTimeInMinutes: 15, 
          completed: false 
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        updateAIStatus({ stage: "Idle", progress: 0, provider: "System" });
      }, 1000);
    }
  };

  const handleTopicToggle = (id: string) => {
    setTopics(topics.map(topic =>
      topic.id === id ? { ...topic, completed: !topic.completed } : topic
    ));
    
    // Update progress
    const completedCount = topics.filter(t => t.id === id ? !t.completed : t.completed).length;
    const newProgress = Math.round((completedCount / topics.length) * 100);
    setProgress(newProgress);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleStartItem = (id: string) => {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;
    
    if (topic.type === 'quiz') {
      navigate('/quiz');
    } else {
      navigate('/lesson');
    }
    
    toast.success(`Starting ${topic.title}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <StudyAIHeader 
        userName="Student"
        level={3}
        xp={750}
        navigation={defaultNavigation}
      />
      
      <div className="container max-w-6xl mx-auto p-4">
        <Button variant="ghost" onClick={handleBackToDashboard} className="mb-4">
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{subject}</CardTitle>
            <CardDescription>
              Explore key topics and track your progress in {subject}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Overall Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {progress === 0 ? "Start your learning journey!" : "Keep it up! You're doing great."}
                </p>
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground text-right mt-1">{progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="overview" className="w-full max-w-6xl mx-auto px-4 pb-8">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">
              <BookOpen className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="performance">
              <BarChart className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Overview</CardTitle>
                <CardDescription>
                  Key topics to master in {subject}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : topics.length > 0 ? (
                  <SubjectTopicList 
                    topics={topics} 
                    subject={subject}
                    onTopicToggle={handleTopicToggle} 
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No topics found for this subject.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4" 
                      onClick={() => loadStudyPlan(subject)}
                    >
                      Regenerate Content
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Timeline</CardTitle>
                  <CardDescription>
                    Your personalized learning journey for {subject}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : timelineItems.length > 0 ? (
                    <StudyTimeline 
                      items={timelineItems} 
                      onStartItem={handleStartItem} 
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No timeline available for this subject.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>
                  Track your progress and identify areas for improvement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Complete some lessons and quizzes to see your performance data.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubjectDetails;
