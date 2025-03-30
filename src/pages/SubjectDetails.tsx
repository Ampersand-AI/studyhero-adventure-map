import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import StudyAIHeader from '@/components/StudyAIHeader';
import SubjectTopicList from '@/components/SubjectTopicList';
import { claudeService } from '@/services/claudeService';
import { BookOpen, ChevronLeft, RefreshCw } from "lucide-react";

const SubjectDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<string>('');
  const [className, setClassName] = useState<string>('10');
  const [topics, setTopics] = useState<any[]>([]);
  
  useEffect(() => {
    // Get subject info from location state or localStorage
    const subjectData = location.state?.subject || localStorage.getItem('selectedSubject');
    const classData = location.state?.className || localStorage.getItem('selectedClass') || '10';
    
    if (subjectData) {
      const subjectName = typeof subjectData === 'string' ? subjectData : JSON.parse(subjectData);
      setSubject(subjectName);
      setClassName(classData);
      
      // Load topics for this subject
      loadSubjectTopics(subjectName, classData);
    } else {
      // Navigate back to dashboard if no subject is selected
      navigate('/dashboard');
    }
  }, [location, navigate]);
  
  const loadSubjectTopics = async (subjectName: string, classNum: string) => {
    setLoading(true);
    
    try {
      // Check if we have cached topics first
      const cachedTopics = localStorage.getItem(`topics_${subjectName}_${classNum}`);
      if (cachedTopics) {
        setTopics(JSON.parse(cachedTopics));
        setLoading(false);
        return;
      }
      
      // Otherwise, fetch from Claude API
      const result = await claudeService.getSubjectTopics(subjectName, classNum);
      
      if (result && result.topics && result.topics.length > 0) {
        setTopics(result.topics);
        // Cache for future use
        localStorage.setItem(`topics_${subjectName}_${classNum}`, JSON.stringify(result.topics));
      } else {
        toast.error("Error", {
          description: "Failed to load subject topics. Please try again."
        });
      }
    } catch (error) {
      console.error("Error loading subject topics:", error);
      toast.error("Error", {
        description: "Failed to load subject topics. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTopicSelect = (topic: any) => {
    // Save the selected topic to localStorage
    localStorage.setItem('currentStudyItem', JSON.stringify({
      ...topic,
      subject: subject,
      className: className
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
    localStorage.removeItem(`topics_${subject}_${className}`);
    loadSubjectTopics(subject, className);
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
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Loading Curriculum</CardTitle>
              <CardDescription>Retrieving NCERT curriculum data...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
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
                    <CardDescription>NCERT Curriculum</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {topics.length} Topics
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  This curriculum follows the NCERT guidelines for {subject} Class {className}. 
                  It covers all essential topics and is designed to provide comprehensive learning.
                </p>
                <Button 
                  variant="outline" 
                  className="text-blue-600"
                  onClick={() => window.open(`https://ncert.nic.in/textbook.php`, '_blank')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  View NCERT Textbook
                </Button>
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
