
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyHeroHeader from '@/components/StudyHeroHeader';
import AchievementCard from '@/components/AchievementCard';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Home, Map, Trophy, BarChart } from "lucide-react";

const Achievements = () => {
  const navigate = useNavigate();
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  
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

    // Get study plan
    const storedStudyPlan = localStorage.getItem('studyPlan');
    if (storedStudyPlan) {
      setStudyPlan(JSON.parse(storedStudyPlan));
    }
  }, [navigate]);

  // Calculate progress
  const totalItems = studyPlan.length;
  const completedItems = studyPlan.filter(item => item.status === "completed").length;
  const completedQuizzes = studyPlan.filter(item => item.status === "completed" && item.type === "quiz").length;
  const completedLessons = studyPlan.filter(item => item.status === "completed" && item.type === "lesson").length;
  const completionPercentage = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

  const achievements = [
    {
      id: "1",
      title: "First Step",
      description: "Complete your first study item",
      type: "star",
      color: "study-blue",
      earned: completedItems >= 1
    },
    {
      id: "2",
      title: "Quiz Whiz",
      description: "Complete 3 quizzes with perfect scores",
      type: "trophy",
      color: "study-purple",
      earned: completedQuizzes >= 3
    },
    {
      id: "3",
      title: "Knowledge Seeker",
      description: "Complete 5 lessons",
      type: "medal",
      color: "study-green",
      earned: completedLessons >= 5
    },
    {
      id: "4",
      title: "Halfway Hero",
      description: "Reach 50% completion of your study plan",
      type: "award",
      color: "study-yellow",
      earned: completionPercentage >= 50
    },
    {
      id: "5",
      title: "Consistency King",
      description: "Study for 7 consecutive days",
      type: "trophy",
      color: "study-orange",
      earned: false
    },
    {
      id: "6",
      title: "Perfect Scholar",
      description: "Complete the entire study plan",
      type: "trophy",
      color: "study-pink",
      earned: completionPercentage === 100
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyHeroHeader 
        userName="Student Hero" 
        level={3} 
        xp={750}
        navigation={navigationItems}
      />
      
      <main className="flex-1">
        <div className="container py-6">
          <h1 className="text-3xl font-display mb-6">Achievements</h1>

          <Card className="study-card mb-8">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Level 3</span>
                <span className="text-sm font-medium">750 / 1000 XP</span>
              </div>
              <Progress value={75} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">Keep studying to level up!</p>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Achievements;
