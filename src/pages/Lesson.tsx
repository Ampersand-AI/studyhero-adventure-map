
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import StudyAIHeader from '@/components/StudyAIHeader';
import LessonTest from '@/components/LessonTest';
import { claudeService } from '@/services/claudeService';
import { BookOpen, ChevronLeft, DownloadCloud, Lightbulb, PlayCircle, List, FileText } from "lucide-react";

// Type for lesson content
interface LessonContent {
  title: string;
  keyPoints: string[];
  explanation: string[];
  examples: {
    title: string;
    content: string;
  }[];
  visualAids: {
    title: string;
    description: string;
    visualType: string;
  }[];
  activities: {
    title: string;
    instructions: string;
    learningOutcome: string;
  }[];
  summary: string;
  textbookReferences?: {
    chapter: string;
    pageNumbers: string;
    description: string;
  }[];
  visualLearningResources?: {
    type: string;
    title: string;
    description: string;
  }[];
  interestingFacts?: string[];
}

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [studyItem, setStudyItem] = useState<any>(null);
  
  useEffect(() => {
    const loadLessonContent = async () => {
      setLoading(true);
      
      try {
        // Get study item from localStorage
        const storedStudyItem = localStorage.getItem('currentStudyItem');
        
        if (!storedStudyItem) {
          throw new Error("Missing study item information");
        }
        
        const parsedStudyItem = JSON.parse(storedStudyItem);
        setStudyItem(parsedStudyItem);
        
        if (!parsedStudyItem.title || !parsedStudyItem.subject) {
          throw new Error("Incomplete study item information");
        }
        
        // Show toast for content loading
        toast.loading(`Loading lesson: ${parsedStudyItem.title}`, {
          description: "Retrieving NCERT-aligned learning content...",
        });
        
        // Get lesson content from Claude API
        const result = await claudeService.getLessonContent(
          parsedStudyItem.subject,
          parsedStudyItem.title,
          parsedStudyItem.className || '10'
        );
        
        if (result) {
          setLesson(result);
          
          // Dismiss loading toast and show success toast
          toast.success("Lesson Ready", {
            description: `${parsedStudyItem.title} content has been loaded successfully`,
          });
          
          // Award XP for viewing a lesson
          const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
          localStorage.setItem('currentXp', (currentXp + 10).toString());
        } else {
          throw new Error("Failed to load lesson content");
        }
      } catch (error) {
        console.error("Error loading lesson content:", error);
        setError(error instanceof Error ? error.message : "Failed to load lesson content");
        
        toast.error("Error", {
          description: "There was a problem loading this lesson. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadLessonContent();
  }, [id]); // Only dependency is id
  
  const handleStartTest = () => {
    setShowTest(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const navigationItems = [
    { name: "Back to Subject", href: `/subject/${studyItem?.subject || ''}`, icon: <ChevronLeft className="h-4 w-4" /> },
  ];
  
  if (showTest) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader
          userName="Student"
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="flex-1 container py-6 md:py-12">
          <LessonTest 
            subjectName={studyItem?.subject || ''}
            topicName={studyItem?.title || ''}
            onFinish={() => navigate(`/subject/${studyItem?.subject}`)}
          />
        </main>
      </div>
    );
  }
  
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
              <CardTitle>Loading Lesson</CardTitle>
              <CardDescription>Retrieving learning materials...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Error Loading Lesson</CardTitle>
              <CardDescription>We encountered a problem</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-destructive mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/subject/${studyItem?.subject || ''}`)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Return to Subject
              </Button>
            </CardContent>
          </Card>
        ) : lesson ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(`/subject/${studyItem?.subject || ''}`)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to {studyItem?.subject || 'Subject'}
              </Button>
              
              <Button variant="outline" onClick={handleStartTest}>
                <FileText className="mr-2 h-4 w-4" />
                Test Your Knowledge
              </Button>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {studyItem?.subject || 'Subject'} - Class {studyItem?.className || '10'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                    NCERT Curriculum
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Key Points */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <List className="mr-2 h-5 w-5 text-primary" />
                    Key Points to Remember
                  </h3>
                  <ul className="space-y-2 pl-6 list-disc">
                    {lesson.keyPoints.map((point, index) => (
                      <li key={index} className="text-muted-foreground">{point}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Explanation */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detailed Explanation</h3>
                  {lesson.explanation.map((paragraph, index) => (
                    <p key={index} className="mb-4 text-muted-foreground">{paragraph}</p>
                  ))}
                </div>
                
                {/* Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-primary" />
                    Examples
                  </h3>
                  <div className="space-y-4">
                    {lesson.examples.map((example, index) => (
                      <Card key={index} className="bg-secondary/30">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{example.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{example.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Visual Aids */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <PlayCircle className="mr-2 h-5 w-5 text-primary" />
                    Visual Learning Aids
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {lesson.visualAids.map((aid, index) => (
                      <Card key={index} className="bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{aid.title}</CardTitle>
                          <CardDescription>{aid.visualType}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{aid.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Activities */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                    Learning Activities
                  </h3>
                  <div className="space-y-4">
                    {lesson.activities.map((activity, index) => (
                      <Card key={index} className="bg-green-50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{activity.title}</CardTitle>
                          <CardDescription>Learning outcome: {activity.learningOutcome}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{activity.instructions}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Interesting Facts */}
                {lesson.interestingFacts && lesson.interestingFacts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Interesting Facts</h3>
                    <ul className="space-y-2 pl-6 list-disc">
                      {lesson.interestingFacts.map((fact, index) => (
                        <li key={index} className="text-muted-foreground">{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground">{lesson.summary}</p>
                </div>
                
                {/* Textbook References */}
                {lesson.textbookReferences && lesson.textbookReferences.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <DownloadCloud className="mr-2 h-5 w-5 text-primary" />
                      NCERT Textbook References
                    </h3>
                    <div className="space-y-2">
                      {lesson.textbookReferences.map((ref, index) => (
                        <div key={index} className="flex items-start">
                          <BookOpen className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Chapter {ref.chapter}</p>
                            <p className="text-sm text-muted-foreground">Pages: {ref.pageNumbers}</p>
                            <p className="text-sm text-muted-foreground">{ref.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 flex justify-center">
                  <Button onClick={handleStartTest} size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Test Your Knowledge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Lesson;
