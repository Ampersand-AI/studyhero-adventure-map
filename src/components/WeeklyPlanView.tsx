import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, BookOpen, Award, ChevronLeft, ChevronRight, Info, BookOpenText, FileSpreadsheet } from "lucide-react";

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
          <Alert className="my-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              No weekly plans available for this subject yet. Try selecting a different subject.
            </AlertDescription>
          </Alert>
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
  
  const getSubjectColor = (subject: string) => {
    if (!subject) return 'bg-gray-100 text-gray-800';
    
    const colors: Record<string, string> = {
      'Mathematics': 'bg-green-100 text-green-800',
      'Physics': 'bg-blue-100 text-blue-800',
      'Chemistry': 'bg-purple-100 text-purple-800',
      'Biology': 'bg-teal-100 text-teal-800',
      'English': 'bg-yellow-100 text-yellow-800',
      'History': 'bg-orange-100 text-orange-800',
      'Geography': 'bg-indigo-100 text-indigo-800',
      'Economics': 'bg-red-100 text-red-800',
      'Computer Science': 'bg-cyan-100 text-cyan-800',
      'Science': 'bg-emerald-100 text-emerald-800',
      'Social Studies': 'bg-amber-100 text-amber-800',
      'All Subjects': 'bg-gray-100 text-gray-800'
    };
    
    return colors[subject] || 'bg-gray-100 text-gray-800';
  };

  // Function to get appropriate icon based on content type
  const getItemIcon = (type: string) => {
    switch(type) {
      case 'lesson': return <BookOpen className="h-4 w-4 mr-2 text-blue-500" />;
      case 'quiz': return <Award className="h-4 w-4 mr-2 text-purple-500" />;
      case 'practice': return <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-500" />;
      default: return <BookOpen className="h-4 w-4 mr-2 text-blue-500" />;
    }
  };

  // Function to get textbook URL based on subject (same as in SubjectCardGrid)
  const getTextbookUrl = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    const baseUrl = "https://ncert.nic.in/textbook.php";
    
    if (subjectLower.includes('math')) {
      return `${baseUrl}?lemh1=0-10`;
    } else if (subjectLower.includes('physics')) {
      return `${baseUrl}?leph1=0-8`;
    } else if (subjectLower.includes('chemistry')) {
      return `${baseUrl}?lech1=0-14`;
    } else if (subjectLower.includes('english')) {
      return `${baseUrl}?lefl1=0-11`;
    } else if (subjectLower.includes('economics')) {
      return `${baseUrl}?leec1=0-10`;
    } else if (subjectLower.includes('geography')) {
      return `${baseUrl}?legy1=0-7`;
    } else if (subjectLower.includes('computer')) {
      return `${baseUrl}?lecs1=0-10`;
    } else if (subjectLower.includes('biology')) {
      return `${baseUrl}?lebo1=0-16`;
    } else if (subjectLower.includes('social')) {
      return `${baseUrl}?less1=0-9`;
    } else if (subjectLower.includes('science') && !subjectLower.includes('computer')) {
      return `${baseUrl}?lesc1=0-18`;
    } else {
      return baseUrl;
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
            <ChevronLeft className="h-4 w-4 mr-1" />
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
            <ChevronRight className="h-4 w-4 ml-1" />
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
          <CardDescription>Your NCERT-aligned learning activities for this week</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Reference to original textbook */}
          {currentWeek.dailyActivities[0]?.items[0]?.subject && (
            <div className="mb-4">
              <Alert className="bg-blue-50 border-blue-200">
                <div className="flex items-center">
                  <BookOpenText className="h-4 w-4 mr-2 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">
                      Need more resources? Access the official NCERT textbooks for detailed content.
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="ml-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => window.open(getTextbookUrl(currentWeek.dailyActivities[0].items[0].subject), '_blank')}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    View Textbook
                  </Button>
                </div>
              </Alert>
            </div>
          )}

          {/* First show the weekly test card */}
          <div className="mb-6">
            <Card className="border bg-primary/5">
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-primary" />
                  <CardTitle className="text-base">Weekly Test</CardTitle>
                  {currentWeek.weeklyTest.subject && (
                    <Badge className={`ml-2 ${getSubjectColor(currentWeek.weeklyTest.subject)}`}>
                      {currentWeek.weeklyTest.subject}
                    </Badge>
                  )}
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
          
          {/* Display daily activities in a 3-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentWeek.dailyActivities.map((day, index) => (
              <Card key={index} className="border bg-accent/50">
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <CardTitle className="text-base">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {day.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activities scheduled for this day.</p>
                  ) : (
                    day.items.map(item => (
                      <div key={item.id} className="mb-3 last:mb-0 bg-white rounded-md p-3 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center">
                            {getItemIcon(item.type)}
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <div className="flex gap-2 flex-wrap justify-end">
                            {item.subject && (
                              <Badge className={getSubjectColor(item.subject)}>
                                {item.subject}
                              </Badge>
                            )}
                            <Badge className={getTypeColor(item.type)}>
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                        <div className="text-xs text-muted-foreground mb-2">
                          <span className="inline-block bg-gray-100 rounded px-2 py-1">
                            {item.estimatedTimeInMinutes} min
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full hover:bg-primary/10"
                          onClick={() => onStartItem(item.id)}
                        >
                          Start Learning
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyPlanView;
