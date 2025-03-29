
import React, { useState, useEffect } from 'react';
import { StudyAIHeader } from '@/components/StudyAIHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, BarChartHorizontal, LineChart, PieChart } from "@/components/ui/chart";
import { Home, Map, Trophy, BarChart as BarChartIcon, TrendingUp, PieChart as PieChartIcon, Award, Clock } from "lucide-react";

interface TestResult {
  lessonId: string;
  score: number;
  total: number;
  date: string;
}

interface StudySession {
  date: string;
  minutes: number;
}

const Analytics = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [studyPlan, setStudyPlan] = useState<any[]>([]);
  const [lessonNames, setLessonNames] = useState<Record<string, string>>({});

  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Timeline", href: "/dashboard", icon: <Map className="h-4 w-4" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChartIcon className="h-4 w-4" /> },
  ];

  useEffect(() => {
    // Load test results
    const savedResults = localStorage.getItem('testResults');
    if (savedResults) {
      setTestResults(JSON.parse(savedResults));
    }

    // Load study plan to get lesson names
    const savedPlan = localStorage.getItem('studyPlan');
    if (savedPlan) {
      const plan = JSON.parse(savedPlan);
      setStudyPlan(plan);
      
      // Create a mapping of lesson IDs to names
      const names: Record<string, string> = {};
      plan.forEach((item: any) => {
        names[item.id] = item.title;
      });
      setLessonNames(names);
    }
  }, []);

  // Calculate progress statistics
  const totalLessons = studyPlan.length;
  const completedLessons = studyPlan.filter(item => item.status === 'completed').length;
  const progressPercentage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Format test results for chart
  const testScoreData = testResults.map(result => ({
    name: lessonNames[result.lessonId] || `Lesson ${result.lessonId}`,
    score: Math.round((result.score / result.total) * 100)
  }));

  // Get average test score
  const averageScore = testResults.length 
    ? Math.round(testResults.reduce((sum, result) => sum + ((result.score / result.total) * 100), 0) / testResults.length) 
    : 0;

  // Mock data for study time chart - in a real app, you would track this data
  const mockStudyTimeData = [
    { name: "Mon", hours: 1.5 },
    { name: "Tue", hours: 2.2 },
    { name: "Wed", hours: 1.0 },
    { name: "Thu", hours: 2.5 },
    { name: "Fri", hours: 1.8 },
    { name: "Sat", hours: 0.5 },
    { name: "Sun", hours: 1.2 },
  ];

  // Create topic distribution data
  const topicDistribution = [
    { name: "Physics", value: 35 },
    { name: "Chemistry", value: 25 },
    { name: "Biology", value: 20 },
    { name: "Mathematics", value: 20 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader 
        userName="Student" 
        level={3} 
        xp={750}
        navigation={navigationItems}
      />
      
      <main className="flex-1 container py-6">
        <h1 className="text-3xl font-display mb-6">Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{progressPercentage}%</div>
                <div className="text-muted-foreground text-sm">{completedLessons}/{totalLessons} lessons</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Average Test Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{averageScore}%</div>
                <div className="text-muted-foreground text-sm">{testResults.length} tests taken</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Study Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">10.7h</div>
                <div className="text-muted-foreground text-sm">This week</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="performance">
          <TabsList className="mb-4">
            <TabsTrigger value="performance" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" /> Performance
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" /> Study Time
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center">
              <PieChartIcon className="mr-2 h-4 w-4" /> Topics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Scores</CardTitle>
                <CardDescription>Your performance in tests across different lessons</CardDescription>
              </CardHeader>
              <CardContent>
                {testScoreData.length > 0 ? (
                  <div className="h-80">
                    <BarChartHorizontal
                      data={testScoreData}
                      index="name"
                      categories={["score"]}
                      colors={["primary"]}
                      valueFormatter={(value) => `${value}%`}
                      showAnimation={true}
                    />
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No test data available yet. Complete lessons and take tests to see your performance.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test History</CardTitle>
                  <CardDescription>Recent test results</CardDescription>
                </CardHeader>
                <CardContent>
                  {testResults.length > 0 ? (
                    <div className="space-y-4">
                      {testResults.slice().reverse().slice(0, 5).map((result, index) => (
                        <div key={index} className="flex justify-between items-center border-b pb-2 last:border-b-0">
                          <div>
                            <p className="font-medium">{lessonNames[result.lessonId] || `Lesson ${result.lessonId}`}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(result.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-white text-sm ${
                            (result.score / result.total) >= 0.8 ? 'bg-study-green' : 
                            (result.score / result.total) >= 0.6 ? 'bg-amber-500' :
                            'bg-destructive'
                          }`}>
                            {Math.round((result.score / result.total) * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-muted-foreground">No test history yet</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardDescription>Analysis of your test results</CardDescription>
                </CardHeader>
                <CardContent>
                  {testResults.length > 0 ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Strengths</h4>
                        <p className="text-sm">
                          You performed well in recent tests, with an average score of {averageScore}%. 
                          Continue maintaining this level of understanding.
                        </p>
                      </div>
                      
                      {testResults.some(r => (r.score / r.total) < 0.7) && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <h4 className="font-medium mb-2">Areas for Improvement</h4>
                          <p className="text-sm">
                            Consider reviewing {
                              testResults
                                .filter(r => (r.score / r.total) < 0.7)
                                .map(r => lessonNames[r.lessonId])
                                .slice(0, 2)
                                .join(" and ")
                            } to strengthen your understanding.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-muted-foreground">Complete tests to see insights</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="time">
            <Card>
              <CardHeader>
                <CardTitle>Study Time Distribution</CardTitle>
                <CardDescription>Hours spent studying this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <BarChart
                    data={mockStudyTimeData}
                    index="name"
                    categories={["hours"]}
                    colors={["primary"]}
                    valueFormatter={(value) => `${value}h`}
                    showAnimation={true}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="topics">
            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>Breakdown of your curriculum by subject area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <PieChart
                    data={topicDistribution}
                    index="name"
                    category="value"
                    colors={["primary", "violet", "indigo", "cyan"]}
                    valueFormatter={(value) => `${value}%`}
                    showAnimation={true}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
