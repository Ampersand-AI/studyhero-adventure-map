import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import StudyAIHeader from '@/components/StudyAIHeader';
import SubjectTopicList from '@/components/SubjectTopicList';
import deepSeekService, { AIStatus } from '@/services/deepSeekService';
import { BookOpen, ChevronLeft, RefreshCw, Loader, BookOpenCheck } from "lucide-react";
import AIContentLoader from '@/components/AIContentLoader';

const SubjectDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState<AIStatus | null>(null);
  const [subject, setSubject] = useState<string>('');
  const [className, setClassName] = useState<string>('10');
  const [board, setBoard] = useState<string>('CBSE');
  const [topics, setTopics] = useState<any[]>([]);
  const [studyPlan, setStudyPlan] = useState<any>(null);
  
  useEffect(() => {
    // Get subject info from localStorage
    const subjectData = localStorage.getItem('selectedSubject');
    
    // Get profile info from localStorage
    const profileData = localStorage.getItem('studyHeroProfile');
    let parsedProfile: any = {};
    
    if (profileData) {
      try {
        parsedProfile = JSON.parse(profileData);
      } catch (e) {
        console.error("Error parsing profile:", e);
      }
    }
    
    const classData = parsedProfile.class || localStorage.getItem('selectedClass') || '10';
    const boardData = parsedProfile.board || localStorage.getItem('selectedBoard') || 'CBSE';
    
    if (subjectData) {
      setSubject(subjectData);
      setClassName(classData);
      setBoard(boardData);
      
      // Load study plan for this subject
      loadStudyPlan(subjectData, boardData, classData);
    } else {
      // Navigate back to dashboard if no subject is selected
      navigate('/dashboard');
    }
  }, [location, navigate]);
  
  const updateLoadingStatus = (status: AIStatus) => {
    setLoadingStatus(status);
  };
  
  const loadStudyPlan = async (subjectName: string, boardName: string, classNum: string) => {
    setLoading(true);
    
    try {
      // Check if we have cached study plan first
      const studyPlanKey = `studyPlan_${subjectName}_${boardName}_${classNum}`;
      const cachedPlan = localStorage.getItem(studyPlanKey);
      
      if (cachedPlan) {
        const parsedPlan = JSON.parse(cachedPlan);
        setStudyPlan(parsedPlan);
        
        // Extract topics from study plan
        if (parsedPlan && parsedPlan.weeks) {
          const extractedTopics = extractTopicsFromStudyPlan(parsedPlan);
          setTopics(extractedTopics);
        }
        
        setLoading(false);
        return;
      }
      
      // Otherwise, generate with DeepSeek
      const generatedPlan = await deepSeekService.generateStudyPlan(
        subjectName,
        boardName,
        classNum,
        updateLoadingStatus
      );
      
      setStudyPlan(generatedPlan);
      
      // Extract topics from study plan
      if (generatedPlan && generatedPlan.weeks) {
        const extractedTopics = extractTopicsFromStudyPlan(generatedPlan);
        setTopics(extractedTopics);
      }
      
      // Cache for future use
      localStorage.setItem(studyPlanKey, JSON.stringify(generatedPlan));
    } catch (error) {
      console.error("Error loading study plan:", error);
      toast.error("Error", {
        description: "Failed to load subject content. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const extractTopicsFromStudyPlan = (plan: any) => {
    if (!plan.weeks || !Array.isArray(plan.weeks)) {
      return [];
    }
    
    const allTopics: any[] = [];
    let topicId = 1;
    
    // Extract daily lessons
    plan.weeks.forEach((week: any, weekIndex: number) => {
      if (week.days && Array.isArray(week.days)) {
        week.days.forEach((day: any, dayIndex: number) => {
          if (day.topic) {
            allTopics.push({
              id: `topic-${topicId++}`,
              title: day.topic,
              type: 'lesson',
              dueDate: `Week ${weekIndex + 1}, ${day.day || 'Day ' + (dayIndex + 1)}`,
              description: day.content?.fundamentals?.join('. ') || 'Learn about ' + day.topic,
              status: 'current',
              weekNumber: weekIndex + 1,
              dayNumber: dayIndex + 1,
              estimatedTimeInMinutes: 30,
              content: day.content
            });
          }
        });
      }
      
      // Add weekly quiz
      if (week.weeklyQuiz) {
        allTopics.push({
          id: `quiz-${weekIndex + 1}`,
          title: `Week ${weekIndex + 1} Assessment`,
          type: 'quiz',
          dueDate: `End of Week ${weekIndex + 1}`,
          description: `Test your knowledge on the topics covered in Week ${weekIndex + 1}`,
          status: 'future',
          weekNumber: weekIndex + 1,
          estimatedTimeInMinutes: 20,
          questions: week.weeklyQuiz.questions
        });
      }
    });
    
    return allTopics;
  };
  
  const handleTopicSelect = (topic: any) => {
    // Save the selected topic to localStorage
    localStorage.setItem('currentStudyItem', JSON.stringify({
      ...topic,
      subject: subject,
      className: className,
      board: board
    }));
    
    // Navigate to the appropriate page based on topic type
    if (topic.type === 'quiz') {
      navigate(`/quiz/${topic.id}`);
    } else {
      navigate(`/lesson/${topic.id}`);
    }
  };
  
  const handleRefresh = () => {
    // Clear cache and reload
    const studyPlanKey = `studyPlan_${subject}_${board}_${className}`;
    localStorage.removeItem(studyPlanKey);
    loadStudyPlan(subject, board, className);
  };
  
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: <ChevronLeft className="h-4 w-4" /> },
  ];
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader
        userName="Student"
        level={parseInt(localStorage.getItem('currentLevel') || '1')}
        xp={parseInt(localStorage.getItem('currentXp') || '0')}
        navigation={navigationItems}
      />
      
      <main className="flex-1 container py-6 md:py-12">
        {loading ? (
          <div className="max-w-3xl mx-auto">
            {loadingStatus ? (
              <AIContentLoader
                title={`Creating ${subject} Study Plan`}
                description={`Generating comprehensive study materials for ${board} Class ${className}`}
                stage={loadingStatus.stage}
                progress={loadingStatus.progress}
                provider="DeepSeek AI"
                context={{
                  subject,
                  className,
                  topic: `Complete ${subject} curriculum`
                }}
              />
            ) : (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Loading Curriculum</CardTitle>
                  <CardDescription>Retrieving curriculum data...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold">{subject} Curriculum</h1>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{subject} - Class {className}</CardTitle>
                    <CardDescription>{board} Curriculum</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {topics.length} Topics
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  This curriculum follows the {board} guidelines for {subject} Class {className}. 
                  It includes daily lessons with fundamentals, examples, and visual aids, plus weekly assessments.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    {topics.filter(t => t.type === 'lesson').length} Lessons
                  </Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                    {topics.filter(t => t.type === 'quiz').length} Quizzes
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    {studyPlan?.weeks?.length || 12} Weeks
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <SubjectTopicList 
              subject={subject}
              className={className}
              topics={topics}
              onSelectTopic={handleTopicSelect}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default SubjectDetails;
