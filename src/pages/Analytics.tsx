
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudyHeroHeader from '@/components/StudyHeroHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart as BarChartIcon, 
  PieChart, 
  Calendar, 
  Home, 
  Map, 
  Trophy, 
  BarChart as BarChartLucide 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  
  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Timeline", href: "/dashboard", icon: <Map className="h-4 w-4" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChartLucide className="h-4 w-4" /> },
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

  // Prepare data for charts
  const progressByTypeData = [
    { 
      name: 'Lessons', 
      completed: studyPlan.filter(item => item.status === "completed" && item.type === "lesson").length,
      total: studyPlan.filter(item => item.type === "lesson").length 
    },
    { 
      name: 'Quizzes', 
      completed: studyPlan.filter(item => item.status === "completed" && item.type === "quiz").length,
      total: studyPlan.filter(item => item.type === "quiz").length 
    },
    { 
      name: 'Practice', 
      completed: studyPlan.filter(item => item.status === "completed" && item.type === "practice").length,
      total: studyPlan.filter(item => item.type === "practice").length 
    }
  ];

  const overallProgressData = [
    { 
      name: 'Completed', 
      value: studyPlan.filter(item => item.status === "completed").length
    },
    { 
      name: 'In Progress', 
      value: studyPlan.filter(item => item.status === "current").length
    },
    { 
      name: 'Upcoming', 
      value: studyPlan.filter(item => item.status === "future").length
    }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

  // Prepare data for time spent per day (mock data for demo)
  const timeSpentData = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 60 },
    { day: 'Wed', minutes: 30 },
    { day: 'Thu', minutes: 75 },
    { day: 'Fri', minutes: 45 },
    { day: 'Sat', minutes: 90 },
    { day: 'Sun', minutes: 60 }
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
          <h1 className="text-3xl font-display mb-6">Analytics</h1>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="study-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Progress by Type</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={progressByTypeData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#8884d8" stackId="a" name="Total" />
                    <Bar dataKey="completed" fill="#82ca9d" stackId="b" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="study-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Overall Progress</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={overallProgressData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {overallProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="study-card md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">Study Time per Day</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={timeSpentData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="minutes" fill="#8B5CF6" name="Minutes Studied" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
