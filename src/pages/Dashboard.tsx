
import React, { useState, useEffect } from 'react';
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
import { studyPlanService } from '@/services/studyPlanService';
import { useStudyPlan } from '@/contexts/StudyPlanContext';

const defaultNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4" /> },
  { name: 'Subjects', href: '/subjects', icon: <BookOpen className="h-4 w-4" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="h-4 w-4" /> }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [subjectNames, setSubjectNames] = useState<string[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { updateAIStatus } = useStudyPlan();
  
  // Check if user profile exists, if not redirect to onboarding
  useEffect(() => {
    const profile = localStorage.getItem('studyHeroProfile');
    if (!profile) {
      navigate('/onboarding');
    }
  }, [navigate]);
  
  // Load user data and subjects
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      updateAIStatus({
        stage: "Loading profile",
        progress: 20,
        provider: "System"
      });
      
      try {
        // Get profile from localStorage
        const profileData = localStorage.getItem('studyHeroProfile');
        if (!profileData) {
          navigate('/onboarding');
          return;
        }
        
        const profile = JSON.parse(profileData);
        const subjects = profile.subjects || ['Mathematics', 'Science'];
        
        updateAIStatus({
          stage: "Loading subject data",
          progress: 50,
          provider: "System"
        });
        
        // Load weekly plans
        const plansResponse = await studyPlanService.getWeeklyPlans();
        
        // Generate timeline items from the first week
        const firstWeekItems = plansResponse.weeklyPlans[0]?.dailyActivities
          .flatMap(day => day.items)
          .map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            date: item.dueDate,
            type: item.type as 'lesson' | 'quiz' | 'practice' | 'milestone',
            // Map the status string to one of the allowed values
            status: mapStatusToAllowedValue(item.status)
          })) || [];
        
        setSubjectNames(subjects);
        setTimelineItems(firstWeekItems.slice(0, 5)); // Only show the first 5 items
        setWeeklyPlans(plansResponse.weeklyPlans);
        
        updateAIStatus({
          stage: "Dashboard ready",
          progress: 100,
          provider: "System"
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load your study data. Please try again.");
      } finally {
        setIsLoading(false);
        // Reset AI status after a delay
        setTimeout(() => {
          updateAIStatus({
            stage: "Idle",
            progress: 0,
            provider: "System"
          });
        }, 1000);
      }
    };
    
    loadUserData();
  }, [navigate, updateAIStatus]);
  
  // Helper function to map any status string to one of the allowed values
  const mapStatusToAllowedValue = (status: string): 'completed' | 'in-progress' | 'upcoming' => {
    if (status === 'completed') return 'completed';
    if (status === 'current' || status === 'in-progress') return 'in-progress';
    return 'upcoming'; // Default to upcoming for any other status
  };
  
  // Handle starting a timeline item
  const handleStartTimelineItem = (id: string) => {
    toast.success("Starting study session");
    navigate('/lesson');
  };

  const handleStartWeeklyItem = (id: string) => {
    toast.success(`Starting weekly item: ${id}`);
    navigate('/lesson');
  };

  return (
    <div className="min-h-screen bg-background">
      <StudyHeroHeader 
        userName="Student"
        level={3}
        xp={750}
        navigation={defaultNavigation}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <ProgressCard
            title="Overall Progress"
            value="0"
            description="Start your learning journey!"
            icon={<BarChart className="h-4 w-4" />}
          />
          <ProgressCard
            title="Subjects"
            value={String(subjectNames.length)}
            description="Subjects in your curriculum"
            icon={<BookOpen className="h-4 w-4" />}
          />
          <ProgressCard
            title="Weekly Study Time"
            value="0"
            description="Hours studied this week"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>
        
        <Tabs defaultValue="today" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Plan</TabsTrigger>
            <TabsTrigger value="subjects">My Subjects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Up Next</CardTitle>
                  <CardDescription>Your upcoming study sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : timelineItems.length > 0 ? (
                    <StudyTimeline 
                      items={timelineItems} 
                      onStartItem={handleStartTimelineItem} 
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No upcoming activities yet.</p>
                      <p className="text-sm mt-2">Select subjects to generate a study plan.</p>
                    </div>
                  )}
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
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : weeklyPlans.length > 0 ? (
                  <WeeklyPlanView 
                    weeklyPlans={weeklyPlans} 
                    onStartItem={handleStartWeeklyItem}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No weekly plan generated yet.</p>
                    <p className="text-sm mt-2">Select subjects to generate a weekly plan.</p>
                  </div>
                )}
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
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : subjectNames.length > 0 ? (
                  <SubjectCardGrid 
                    subjects={subjectNames}
                    onSelectSubject={(subject) => navigate(`/subject/${subject.toLowerCase().replace(/\s+/g, '-')}`)}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No subjects selected yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate('/onboarding')}>
                      Select Subjects
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
