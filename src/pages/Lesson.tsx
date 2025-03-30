import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import StudyAIHeader from '@/components/StudyAIHeader';
import LessonTest from '@/components/LessonTest';
import { claudeService } from '@/services/claudeService';
import { generateEnhancedContent } from '@/services/aiService';
import { BookOpen, ChevronLeft, DownloadCloud, Lightbulb, PlayCircle, List, FileText, Star, Clock, BookCheck, Award } from "lucide-react";

// Type for lesson content
interface LessonContent {
  title: string;
  keyPoints: string[];
  explanation: string[];
  examples: {
    title: string;
    content: string;
  }[];
  visualAids?: {
    title: string;
    description: string;
    visualType: string;
  }[];
  activities?: {
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
  // Add fallback properties that might be in the API response
  exampleProblems?: {
    problem: string;
    solution: string;
  }[];
  furtherReading?: {
    title: string;
    link: string;
  }[];
}

interface GenerationStatus {
  stage: string;
  progress: number;
  provider: string;
}

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [studyItem, setStudyItem] = useState<any>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>({
    stage: "Initializing", 
    progress: 0,
    provider: "AI"
  });
  
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
        toast("Loading lesson: " + parsedStudyItem.title, {
          description: "Retrieving NCERT-aligned learning content...",
        });
        
        setGenerationStatus({
          stage: "Looking for cached content",
          progress: 10,
          provider: "System"
        });
        
        // Try to get cached lesson first
        const cachedLesson = localStorage.getItem(`lesson_${parsedStudyItem.subject}_${parsedStudyItem.title}`);
        if (cachedLesson) {
          setLesson(JSON.parse(cachedLesson));
          setLoading(false);
          return;
        }
        
        setGenerationStatus({
          stage: "Preparing content generation",
          progress: 20,
          provider: "AI Service"
        });
        
        // Try to get lesson content from coordinated AI services
        const prompt = `
          Create a comprehensive educational lesson on "${parsedStudyItem.title}" for the subject "${parsedStudyItem.subject}" for students in class ${parsedStudyItem.className || '10'}.
          
          The lesson should include:
          1. Key learning points (5-7 points)
          2. Detailed explanation (3-5 paragraphs)
          3. Practical examples (2-3)
          4. Visual learning aids (3-4 descriptions)
          5. Hands-on activities (2-3)
          6. A concise summary
          7. References to textbook chapters and pages
          8. Interesting facts to engage students
          
          Base your response on actual NCERT textbook content for class ${parsedStudyItem.className || '10'} ${parsedStudyItem.subject} curriculum.
          
          Format the response as a well-structured JSON object following this schema:
          {
            "title": "full topic title",
            "keyPoints": ["point 1", "point 2", ...],
            "explanation": ["paragraph 1", "paragraph 2", ...],
            "examples": [{"title": "Example 1", "content": "..."}, ...],
            "visualAids": [{"title": "Visual 1", "description": "...", "visualType": "diagram"}, ...],
            "activities": [{"title": "Activity 1", "instructions": "...", "learningOutcome": "..."}, ...],
            "summary": "summary text",
            "textbookReferences": [{"chapter": "1", "pageNumbers": "10-15", "description": "..."}, ...],
            "interestingFacts": ["fact 1", "fact 2", ...]
          }
          
          Ensure the content is accurate, age-appropriate, and aligned with NCERT curriculum for ${parsedStudyItem.subject}.
        `;
        
        // Create a context object for the AI service
        const context = {
          subject: parsedStudyItem.subject,
          topic: parsedStudyItem.title,
          className: parsedStudyItem.className || '10'
        };
        
        // Get lesson content using the coordinated AI services
        const result = await generateEnhancedContent(
          prompt,
          context,
          (status) => {
            // Update loading status
            setGenerationStatus({
              stage: status.stage || "Generating content",
              progress: status.progress || 30,
              provider: status.provider || "AI Service"
            });
            
            toast(`${status.stage || "Generating"} (${status.progress || 30}%)`, {
              description: `Using ${status.provider || "AI"} service to generate content...`,
            });
          }
        );
        
        if (result) {
          setGenerationStatus({
            stage: "Processing response",
            progress: 90,
            provider: "System"
          });
          
          // Transform result if needed to match our expected format
          const formattedLesson: LessonContent = {
            title: result.title || parsedStudyItem.title,
            keyPoints: result.keyPoints || [],
            explanation: Array.isArray(result.explanation) ? result.explanation : 
              (typeof result.explanation === 'string' ? [result.explanation] : 
              (typeof result.summary === 'string' ? [result.summary] : [])),
            examples: Array.isArray(result.examples) ? result.examples : 
              (result.exampleProblems ? result.exampleProblems.map(ep => ({
                title: "Example",
                content: `Problem: ${ep.problem}\nSolution: ${ep.solution}`
              })) : []),
            summary: result.summary || "",
            visualAids: result.visualAids || [],
            activities: result.activities || [],
            textbookReferences: result.textbookReferences || [],
            interestingFacts: result.interestingFacts || []
          };
          
          setLesson(formattedLesson);
          
          // Cache the lesson for future use
          localStorage.setItem(
            `lesson_${parsedStudyItem.subject}_${parsedStudyItem.title}`, 
            JSON.stringify(formattedLesson)
          );
          
          setGenerationStatus({
            stage: "Completed",
            progress: 100,
            provider: "System"
          });
          
          // Show success toast
          toast.success("Lesson Ready - " + parsedStudyItem.title + " content has been loaded successfully");
          
          // Award XP for viewing a lesson
          const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
          localStorage.setItem('currentXp', (currentXp + 10).toString());
        } else {
          throw new Error("Failed to load lesson content");
        }
      } catch (error) {
        console.error("Error loading lesson content:", error);
        
        setGenerationStatus({
          stage: "Trying fallback content source",
          progress: 50,
          provider: "Claude AI"
        });
        
        // Try one more time with claudeService as fallback
        try {
          toast("Attempting to load content from alternative source...");
          
          const fallbackResult = await claudeService.getLessonContent(
            studyItem?.subject || "General", 
            studyItem?.title || "Lesson",
            studyItem?.className || "10"
          );
          
          if (fallbackResult) {
            setLesson(fallbackResult);
            setGenerationStatus({
              stage: "Content loaded from alternative source",
              progress: 100,
              provider: "Claude AI"
            });
            toast.success("Content loaded from alternative source");
          } else {
            throw new Error("Fallback source also failed");
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError);
          setError("Failed to load lesson content. Please try refreshing the page.");
          toast.error("Unable to load lesson content");
          setGenerationStatus({
            stage: "Generation failed",
            progress: 0,
            provider: "System"
          });
        }
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
            lessonTitle={studyItem?.title || 'Lesson Test'}
            onFinish={() => navigate(`/subject/${studyItem?.subject}`)}
            topicName={studyItem?.title || ''}
            subjectName={studyItem?.subject || ''}
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
              <CardDescription>Retrieving {studyItem?.subject || 'subject'} learning materials...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{generationStatus.stage}</p>
                    <span className="text-sm text-muted-foreground">{generationStatus.progress}%</span>
                  </div>
                  <Progress value={generationStatus.progress} variant={generationStatus.progress >= 100 ? "success" : "default"} />
                  <p className="text-xs text-muted-foreground">Using {generationStatus.provider} to generate NCERT-aligned content</p>
                </div>
                
                <div className="pt-4 space-y-2">
                  <p className="text-sm">This content is being generated based on:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>NCERT curriculum guidelines</li>
                    <li>Class {studyItem?.className || '10'} textbook content</li>
                    <li>Standard {studyItem?.subject || 'subject'} learning objectives</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Error Loading Content</CardTitle>
              <CardDescription>We encountered a problem</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-500 mb-4">{error}</p>
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
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Estimated Time</p>
                      <p className="text-sm text-blue-600">20-30 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <BookCheck className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">Complexity</p>
                      <p className="text-sm text-green-600">Intermediate</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                    <Award className="h-5 w-5 text-amber-600 mr-2" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">XP Reward</p>
                      <p className="text-sm text-amber-600">25 XP for completion</p>
                    </div>
                  </div>
                </div>
                
                {/* Key Points */}
                {lesson.keyPoints && lesson.keyPoints.length > 0 && (
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
                )}
                
                {/* Explanation */}
                {lesson.explanation && lesson.explanation.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Detailed Explanation</h3>
                    {lesson.explanation.map((paragraph, index) => (
                      <p key={index} className="mb-4 text-muted-foreground">{paragraph}</p>
                    ))}
                  </div>
                )}
                
                {/* Examples */}
                {lesson.examples && lesson.examples.length > 0 && (
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
                            <p className="text-muted-foreground whitespace-pre-line">{example.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Visual Aids */}
                {lesson.visualAids && lesson.visualAids.length > 0 && (
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
                )}
                
                {/* Activities */}
                {lesson.activities && lesson.activities.length > 0 && (
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
                )}
                
                {/* Interesting Facts */}
                {lesson.interestingFacts && lesson.interestingFacts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Star className="mr-2 h-5 w-5 text-amber-500" />
                      Interesting Facts
                    </h3>
                    <ul className="space-y-2 pl-6 list-disc">
                      {lesson.interestingFacts.map((fact, index) => (
                        <li key={index} className="text-muted-foreground">{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Summary */}
                {lesson.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <p className="text-muted-foreground">{lesson.summary}</p>
                  </div>
                )}
                
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
