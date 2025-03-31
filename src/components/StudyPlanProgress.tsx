
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface StudyPlanProgressProps {
  subjects: string[];
  board: string;
  className: string;
  onComplete: () => void;
}

const StudyPlanProgress: React.FC<StudyPlanProgressProps> = ({
  subjects,
  board,
  className,
  onComplete
}) => {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, number>>({});
  const [subjectStatus, setSubjectStatus] = useState<Record<string, 'pending' | 'loading' | 'complete' | 'error'>>({});
  const [overallProgress, setOverallProgress] = useState(0);
  
  // Initialize subject statuses
  useEffect(() => {
    const initialStatuses: Record<string, 'pending' | 'loading' | 'complete' | 'error'> = {};
    const initialProgress: Record<string, number> = {};
    
    subjects.forEach((subject, index) => {
      initialStatuses[subject] = index === 0 ? 'loading' : 'pending';
      initialProgress[subject] = 0;
    });
    
    setSubjectStatus(initialStatuses);
    setSubjectProgress(initialProgress);
  }, [subjects]);
  
  // Effect to simulate loading progress for current subject
  useEffect(() => {
    if (currentSubjectIndex >= subjects.length) {
      // All subjects completed
      setOverallProgress(100);
      onComplete();
      return;
    }
    
    const currentSubject = subjects[currentSubjectIndex];
    
    if (subjectStatus[currentSubject] !== 'loading') {
      return;
    }
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Mark current subject as complete
        setSubjectStatus(prev => ({
          ...prev,
          [currentSubject]: 'complete'
        }));
        
        // Move to next subject
        setTimeout(() => {
          setCurrentSubjectIndex(prev => prev + 1);
          
          // If we have more subjects, mark the next one as loading
          if (currentSubjectIndex + 1 < subjects.length) {
            setSubjectStatus(prev => ({
              ...prev,
              [subjects[currentSubjectIndex + 1]]: 'loading'
            }));
          }
        }, 500);
      }
      
      setSubjectProgress(prev => ({
        ...prev,
        [currentSubject]: progress
      }));
      
      // Update overall progress
      const totalProgress = subjects.reduce((acc, subject, idx) => {
        if (idx < currentSubjectIndex) {
          return acc + 100;
        } else if (idx === currentSubjectIndex) {
          return acc + progress;
        }
        return acc;
      }, 0) / subjects.length;
      
      setOverallProgress(totalProgress);
    }, 300);
    
    return () => clearInterval(interval);
  }, [currentSubjectIndex, subjects, subjectStatus, onComplete]);
  
  const getStatusIcon = (status: 'pending' | 'loading' | 'complete' | 'error') => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'loading':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-300" />;
    }
  };
  
  const getStatusText = (subject: string, status: 'pending' | 'loading' | 'complete' | 'error') => {
    switch (status) {
      case 'complete':
        return `${subject} study plan created`;
      case 'loading':
        return `Creating ${subject} study plan...`;
      case 'error':
        return `Error creating ${subject} study plan`;
      default:
        return `Waiting to create ${subject} study plan`;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Creating Your Study Plans</CardTitle>
        <CardDescription>
          Generating comprehensive study plans for {board} Class {className}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">Creating personalized study plans for {subjects.length} subjects</p>
        </div>
        
        <div className="space-y-3">
          {subjects.map((subject, index) => (
            <div key={subject} className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(subjectStatus[subject])}
                  <span className="text-sm font-medium">{subject}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(subjectProgress[subject] || 0)}%
                </span>
              </div>
              <Progress value={subjectProgress[subject] || 0} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {getStatusText(subject, subjectStatus[subject])}
              </p>
            </div>
          ))}
        </div>
        
        <div className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-md">
          <p className="font-medium">AI is creating your personalized study plan</p>
          <p className="mt-1">Our AI is analyzing the curriculum for {board} Class {className} and generating comprehensive study materials with visual aids and weekly assessments.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyPlanProgress;
