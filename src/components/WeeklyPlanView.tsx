
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Award } from "lucide-react";

interface DailyActivity {
  date: string;
  items: any[];
}

interface WeeklyTest {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  estimatedTimeInMinutes: number;
  subject: string;
  isWeeklyTest: boolean;
  weekNumber: number;
}

interface WeeklyPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  dailyActivities: DailyActivity[];
  weeklyTest: WeeklyTest;
}

interface WeeklyPlanViewProps {
  weeklyPlans: WeeklyPlan[];
  onStartItem: (id: string) => void;
  testScores?: Record<string, number>;
}

const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ weeklyPlans, onStartItem, testScores = {} }) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  
  if (!weeklyPlans || weeklyPlans.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No weekly plan available yet. Generate a study plan first.</p>
        </CardContent>
      </Card>
    );
  }
  
  const currentWeek = weeklyPlans.find(week => week.weekNumber === selectedWeek) || weeklyPlans[0];
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'lesson': return 'bg-blue-500 text-white';
      case 'quiz': return 'bg-purple-500 text-white';
      case 'practice': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Weekly Study Plan</h3>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
            disabled={selectedWeek === 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">Week {selectedWeek}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedWeek(prev => Math.min(weeklyPlans.length, prev + 1))}
            disabled={selectedWeek === weeklyPlans.length}
          >
            Next
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Week {currentWeek.weekNumber}: {currentWeek.startDate} - {currentWeek.endDate}</CardTitle>
            {testScores[`test-week-${currentWeek.weekNumber}`] !== undefined && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Weekly Test Score: {testScores[`test-week-${currentWeek.weekNumber}`]}%
              </Badge>
            )}
          </div>
          <CardDescription>Your daily learning activities for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentWeek.dailyActivities.map((day, index) => (
              <Card key={index} className="border bg-accent/50">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <CardTitle className="text-base">{day.date}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {day.items.map(item => (
                    <div key={item.id} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          {item.type === 'lesson' ? (
                            <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                          ) : (
                            <Award className="h-4 w-4 mr-2 text-purple-500" />
                          )}
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => onStartItem(item.id)}
                      >
                        Start
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            
            <Card className="border bg-primary/5">
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-primary" />
                  <CardTitle className="text-base">Weekly Test</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-2">
                  <span className="font-medium">{currentWeek.weeklyTest.title}</span>
                  <p className="text-xs text-muted-foreground">{currentWeek.weeklyTest.description}</p>
                </div>
                <Button 
                  size="sm"
                  className="w-full"
                  onClick={() => onStartItem(currentWeek.weeklyTest.id)}
                  variant={testScores[`test-week-${currentWeek.weekNumber}`] !== undefined ? "outline" : "default"}
                >
                  {testScores[`test-week-${currentWeek.weekNumber}`] !== undefined ? "Retake Test" : "Take Test"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyPlanView;
