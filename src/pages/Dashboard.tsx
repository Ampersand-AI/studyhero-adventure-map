
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StudyAIHeader from '@/components/StudyAIHeader';
import ProgressCard from '@/components/ProgressCard';
import StudyTimeline from '@/components/StudyTimeline';
import SubjectCardGrid from '@/components/SubjectCardGrid';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap, Trophy, BookOpenCheck } from "lucide-react";
import DashboardSubjectCard from '@/components/DashboardSubjectCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  
  useEffect(() => {
    // Load user profile
    const profile = localStorage.getItem('studyHeroProfile');
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile);
        setUserProfile(parsedProfile);
        
        // Load subjects
        if (parsedProfile.subjects && Array.isArray(parsedProfile.subjects)) {
          setSubjects(parsedProfile.subjects);
        } else {
          // Default subjects
          setSubjects(['Mathematics', 'Science', 'English', 'Social Studies']);
        }
      } catch (e) {
        console.error("Error parsing profile:", e);
        // Redirect to onboarding if profile is invalid
        navigate('/onboarding');
      }
    } else {
      // Redirect to onboarding if no profile
      navigate('/onboarding');
    }
  }, [navigate]);
  
  const handleSubjectClick = (subject: string) => {
    localStorage.setItem('selectedSubject', subject);
    navigate('/subject');
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader
        userName={userProfile?.name || "Student"}
        level={parseInt(localStorage.getItem('currentLevel') || '1')}
        xp={parseInt(localStorage.getItem('currentXp') || '0')}
        navigation={[]}
      />
      
      <main className="flex-1 container py-6 md:py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Progress Overview */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>
                Your study activity and achievements this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <ProgressCard
                  title="Study Streak"
                  value="5 Days"
                  description="Current streak"
                  icon={<GraduationCap />}
                />
                <ProgressCard
                  title="Minutes Studied"
                  value="120"
                  description="This week"
                  icon={<BookOpenCheck />}
                />
                <ProgressCard
                  title="Quizzes Completed"
                  value="3"
                  description="Average score: 86%"
                  icon={<Trophy />}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Timeline */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                Your personalized study plan for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudyTimeline />
            </CardContent>
          </Card>
          
          {/* Subjects Grid */}
          <Card className="col-span-1 lg:col-span-3">
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Your Subjects</CardTitle>
                <CardDescription>
                  {userProfile?.board || "CBSE"} curriculum for Class {userProfile?.class || "10"}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/onboarding')}>
                Add Subjects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {subjects.map((subject) => (
                  <DashboardSubjectCard
                    key={subject}
                    subject={subject}
                    board={userProfile?.board || "CBSE"}
                    className={userProfile?.class || "10"}
                    progress={0}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
