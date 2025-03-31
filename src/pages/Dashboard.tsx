
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookOpen, BarChart, Clock, ChevronRight, Home, Settings } from "lucide-react";

import ProgressCard from '@/components/ProgressCard';
import SubjectCardGrid from '@/components/SubjectCardGrid'; 
import WeeklyPlanView from '@/components/WeeklyPlanView';
import StudyHeroHeader from '@/components/StudyHeroHeader';
import StudyTimeline, { TimelineItem } from '@/components/StudyTimeline';

interface DashboardData {
  subjects: { name: string; progress: number; }[];
  weeklyProgress: { day: string; completed: number; total: number; }[];
  totalSubjects: number;
  completedSubjects: number;
}

// Add dummy data for WeeklyPlanView
const weeklyPlans = [
  {
    weekNumber: 1,
    startDate: "May 1, 2023",
    endDate: "May 7, 2023",
    dailyActivities: [
      {
        date: "2023-05-01",
        items: [
          {
            id: "item1",
            title: "Introduction to Algebra",
            description: "Learn the basics of algebraic expressions",
            type: "lesson",
            estimatedTimeInMinutes: 30,
            subject: "Mathematics",
            status: "completed"
          }
        ]
      },
      {
        date: "2023-05-02",
        items: [
          {
            id: "item2",
            title: "Chemical Reactions",
            description: "Understand different types of chemical reactions",
            type: "lesson",
            estimatedTimeInMinutes: 45,
            subject: "Chemistry",
            status: "in-progress"
          }
        ]
      },
      {
        date: "2023-05-03",
        items: []
      }
    ],
    weeklyTest: {
      id: "test-week-1",
      title: "Week 1 Assessment",
      description: "Test your understanding of this week's topics",
      type: "quiz",
      status: "upcoming",
      dueDate: "2023-05-07",
      estimatedTimeInMinutes: 60,
      subject: "All Subjects",
      isWeeklyTest: true,
      weekNumber: 1
    }
  }
];

const defaultNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4" /> },
  { name: 'Subjects', href: '/subjects', icon: <BookOpen className="h-4 w-4" /> },
  { name: 'Analytics', href: '/analytics', icon: <BarChart className="h-4 w-4" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> }
];

const dashboardData: DashboardData = {
  subjects: [
    { name: 'Mathematics', progress: 75 },
    { name: 'Science', progress: 40 },
    { name: 'History', progress: 90 },
  ],
  weeklyProgress: [
    { day: 'Mon', completed: 3, total: 5 },
    { day: 'Tue', completed: 4, total: 6 },
    { day: 'Wed', completed: 2, total: 4 },
    { day: 'Thu', completed: 5, total: 5 },
    { day: 'Fri', completed: 3, total: 3 },
  ],
  totalSubjects: 10,
  completedSubjects: 3,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    toast.loading("Generating personalized plan...", { duration: 5000 });
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Personalized plan generated successfully!");
    }, 5000);
  };

  // Sample timeline data
  const sampleTimelineItems: TimelineItem[] = [
    {
      id: '1',
      title: 'Calculus: Derivatives',
      description: 'Learn the fundamentals of derivatives and their applications',
      date: 'Today',
      type: 'lesson',
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Chemistry: Periodic Table Quiz',
      description: 'Test your knowledge of the periodic table of elements',
      date: 'Tomorrow',
      type: 'quiz',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Physics: Forces and Motion',
      description: 'Explore Newton\'s laws of motion and their real-world applications',
      date: 'May 25',
      type: 'lesson',
      status: 'upcoming'
    }
  ];

  // Handle starting a timeline item
  const handleStartTimelineItem = (id: string) => {
    toast.success("Starting study session");
    // Navigate based on item type (can be expanded)
    navigate('/lesson');
  };

  const handleStartWeeklyItem = (id: string) => {
    toast.success(`Starting weekly item: ${id}`);
    navigate('/lesson');
  };

  // Convert number values to strings for ProgressCard components
  const overallProgressValue = `${Math.round((dashboardData.completedSubjects / dashboardData.totalSubjects) * 100)}`;
  const subjectsCompletedValue = `${dashboardData.completedSubjects}`;
  const weeklyStudyTimeValue = "4.5";

  return (
    <div className="min-h-screen bg-background">
      <StudyHeroHeader 
        userName="Student"
        level={3}
        xp={750}
        navigation={defaultNavigation}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProgressCard
            title="Overall Progress"
            value={overallProgressValue}
            total="100"
            description="Keep pushing forward!"
            icon={<BarChart className="h-4 w-4" />}
          />
          <ProgressCard
            title="Subjects Completed"
            value={subjectsCompletedValue}
            total="10"
            description="Your completed subjects this semester"
            icon={<BookOpen className="h-4 w-4" />}
          />
          <ProgressCard
            title="Weekly Study Time"
            value={weeklyStudyTimeValue}
            total="10"
            description="Hours studied this week"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>
        
        <Tabs defaultValue="today" className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
            <TabsTrigger value="subjects">My Subjects</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Up Next</CardTitle>
                  <CardDescription>Your upcoming study sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <StudyTimeline 
                    items={sampleTimelineItems} 
                    onStartItem={handleStartTimelineItem} 
                  />
                </CardContent>
              </Card>
              
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Jump into your subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={() => navigate('/lesson')}>
                      Continue Lesson <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/quiz')}>
                      Start Quiz <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="weekly" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Plan</CardTitle>
                <CardDescription>Your study plan for the week</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyPlanView 
                  weeklyPlans={weeklyPlans} 
                  onStartItem={handleStartWeeklyItem}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subjects" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Subjects</CardTitle>
                <CardDescription>Your subjects and their progress</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Extract just the subject names for SubjectCardGrid */}
                <SubjectCardGrid subjects={dashboardData.subjects.map(subject => subject.name)} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your earned achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
