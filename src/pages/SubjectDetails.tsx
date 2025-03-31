import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Check, ChevronRight, BookOpen, Clock, BarChart } from "lucide-react";
import StudyAIHeader from '@/components/StudyAIHeader';
import SubjectTopicList from '@/components/SubjectTopicList';
import { useStudyPlan } from '@/contexts/StudyPlanContext';
import StudyTimeline, { TimelineItem } from '@/components/StudyTimeline'; // Import the TimelineItem interface
import { generateStudyPlan } from '@/services/studyPlanService';

interface Topic {
  id: string;
  title: string;
  completed: boolean;
}

const initialTopics: Topic[] = [
  { id: '1', title: 'Introduction to Subject', completed: false },
  { id: '2', title: 'Core Concepts', completed: false },
  { id: '3', title: 'Advanced Topics', completed: false },
];

const SubjectDetails = () => {
  const { subjectName } = useParams<{ subjectName: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [showAIModal, setShowAIModal] = useState(false);
  const [studyPlanGenerated, setStudyPlanGenerated] = useState(false);
  const [progress, setProgress] = useState(50);
  const { setIsLoading, updateAIStatus, setError } = useStudyPlan();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    if (subjectName) {
      document.title = `StudyHero - ${subjectName} Details`;
    }
  }, [subjectName]);

  const handleTopicToggle = (id: string) => {
    setTopics(topics.map(topic =>
      topic.id === id ? { ...topic, completed: !topic.completed } : topic
    ));
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGenerateStudyPlan = async () => {
    setShowAIModal(true);
    setIsLoading(true);
    updateAIStatus({ stage: "Initializing", progress: 10, provider: "System" });

    try {
      updateAIStatus({ stage: "Fetching requirements", progress: 30, provider: "System" });
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateAIStatus({ stage: "Building plan", progress: 60, provider: "System" });
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateAIStatus({ stage: "Finalizing", progress: 90, provider: "System" });
      await new Promise(resolve => setTimeout(resolve, 500));

      updateAIStatus({ stage: "Complete", progress: 100, provider: "System" });
      setStudyPlanGenerated(true);
      toast.success("Study plan generated successfully!");
    } catch (e: any) {
      setError(e.message || "Failed to generate study plan.");
      toast.error(e.message || "Failed to generate study plan.");
    } finally {
      setIsLoading(false);
      updateAIStatus({ stage: "Idle", progress: 0, provider: "System" });
    }
  };

  const handleStartItem = (id: string) => {
    toast.success(`Starting item ${id}`);
  };

  useEffect(() => {
    setTimelineItems(generateTimelineItems());
  }, [subjectName]);

  const generateTimelineItems = (): TimelineItem[] => {
    const timeline: TimelineItem[] = [];
    
    // Add topic overview
    timeline.push({
      id: 'overview',
      title: 'Subject Overview',
      description: `Introduction to ${subjectName}`,
      date: 'Day 1',
      type: 'lesson',
      status: 'upcoming' // Now this property is allowed
    });

    // Add fundamentals
    timeline.push({
      id: 'fundamentals',
      title: 'Core Concepts',
      description: `Understanding the fundamentals of ${subjectName}`,
      date: 'Day 2-3',
      type: 'lesson',
      status: 'upcoming' // Now this property is allowed
    });
    
    // Add practice quiz
    timeline.push({
      id: 'quiz1',
      title: 'Practice Quiz',
      description: 'Test your understanding of core concepts',
      date: 'Day 4',
      type: 'quiz',
      status: 'upcoming' // Now this property is allowed
    });
    
    // Add advanced topics
    timeline.push({
      id: 'advanced',
      title: 'Advanced Topics',
      description: `Deeper exploration of ${subjectName}`,
      date: 'Day 5-7',
      type: 'lesson',
      status: 'upcoming' // Now this property is allowed
    });
    
    return timeline;
  };

  return (
    <div className="min-h-screen bg-background">
      <StudyAIHeader />
      
      <div className="container max-w-6xl mx-auto p-4">
        <Button variant="ghost" onClick={handleBackToDashboard} className="mb-4">
          <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
          Back to Dashboard
        </Button>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{subjectName}</CardTitle>
            <CardDescription>
              Explore key topics and track your progress in {subjectName}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Overall Progress</h3>
                <p className="text-sm text-muted-foreground">Keep it up! You're doing great.</p>
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
                  Key topics to master in {subjectName}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubjectTopicList topics={topics} onTopicToggle={handleTopicToggle} />
                {!studyPlanGenerated && (
                  <Button onClick={handleGenerateStudyPlan} className="mt-4 w-full">
                    <Check className="h-4 w-4 mr-2" />
                    Generate Personalized Study Plan
                  </Button>
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
                    Your personalized learning journey for {subjectName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StudyTimeline 
                    items={timelineItems} 
                    onStartItem={(id) => handleStartItem(id)} 
                  />
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
                <p>Performance data will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showAIModal && <StudyAIHeader />}
      </div>
    </div>
  );
};

export default SubjectDetails;
