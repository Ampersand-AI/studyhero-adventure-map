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
import { generateLessonContent, LessonContent, generateLessonContentWithDeepSearch } from '@/services/aiCoordinationService';
import { BookOpen, ChevronLeft, DownloadCloud, Lightbulb, PlayCircle, List, FileText, Star, Clock, BookCheck, Award } from "lucide-react";

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
  const [useDeepSearch, setUseDeepSearch] = useState<boolean>(true);
  
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
          description: useDeepSearch ? 
            "Researching educational content from global sources and the web..." :
            "Researching educational content from global sources...",
        });
        
        setGenerationStatus({
          stage: "Looking for cached content",
          progress: 10,
          provider: "System"
        });
        
        // Try to get cached lesson first
        const cacheKey = `lesson_${parsedStudyItem.subject}_${parsedStudyItem.title.replace(/\s+/g, '_')}`;
        const cachedLesson = localStorage.getItem(cacheKey);
        if (cachedLesson) {
          setLesson(JSON.parse(cachedLesson));
          setLoading(false);
          return;
        }
        
        setGenerationStatus({
          stage: "Preparing content generation",
          progress: 20,
          provider: useDeepSearch ? "AI Research Service" : "AI Service"
        });
        
        // Use the coordinated AI service to generate lesson content
        // If deep search is enabled, use that service instead
        const lessonContent = useDeepSearch ?
          await generateLessonContentWithDeepSearch(
            {
              subject: parsedStudyItem.subject,
              topic: parsedStudyItem.title,
              className: parsedStudyItem.className || '10',
              includeVisuals: true,
              includeActivities: true,
              board: parsedStudyItem.board || 'NCERT',
              deepSearch: true
            },
            (status) => {
              // Update loading status
              setGenerationStatus({
                stage: status.stage || "Searching educational content",
                progress: status.progress || 30,
                provider: status.provider || "AI Research Service"
              });
              
              toast(`${status.stage || "Researching"} (${status.progress || 30}%)`, {
                description: `Using ${status.provider || "AI Research"} service to find content...`,
              });
            }
          ) :
          await generateLessonContent(
            {
              subject: parsedStudyItem.subject,
              topic: parsedStudyItem.title,
              className: parsedStudyItem.className || '10',
              includeVisuals: true,
              includeActivities: true
            },
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
        
        if (lessonContent) {
          setLesson(lessonContent);
          setGenerationStatus({
            stage: "Completed",
            progress: 100,
            provider: "System"
          });
          
          // Award XP for viewing a lesson
          const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
          localStorage.setItem('currentXp', (currentXp + 10).toString());
          
          toast.success("Lesson Ready - " + parsedStudyItem.title + " content has been loaded successfully");
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
  }, [id, useDeepSearch]); // Added useDeepSearch as a dependency
  
  const handleStartTest = () => {
    setShowTest(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const navigationItems = [
    { name: "Back to Subject", href: `/subject/${studyItem?.subject || ''}`, icon: <ChevronLeft className="h-4 w-4" /> },
  ];

  // Add a toggle for deep search
  const toggleDeepSearch = () => {
    setUseDeepSearch(prev => !prev);
    toast(useDeepSearch ? "Switched to standard content generation" : "Switched to deep web search", {
      description: useDeepSearch ? 
        "Content will be generated using AI without web search" : 
        "Content will be researched from educational websites"
    });
  };
  
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
              <CardDescription>
                {useDeepSearch ? 
                  `Researching ${studyItem?.subject || 'subject'} content from educational websites...` :
                  `Retrieving ${studyItem?.subject || 'subject'} learning materials...`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">{generationStatus.stage}</p>
                    <span className="text-sm text-muted-foreground">{generationStatus.progress}%</span>
                  </div>
                  <Progress value={generationStatus.progress} variant={generationStatus.progress >= 100 ? "success" : "default"} />
                  <p className="text-xs text-muted-foreground">
                    Using {generationStatus.provider} to {useDeepSearch ? "research" : "generate"} {studyItem?.board || 'NCERT'}-aligned content
                  </p>
                </div>
                
                <div className="pt-4 space-y-2">
                  <p className="text-sm">This content is being {useDeepSearch ? "researched" : "generated"} based on:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    {useDeepSearch ? (
                      <>
                        <li>{studyItem?.board || 'NCERT'} curriculum guidelines</li>
                        <li>Educational websites and resources</li>
                        <li>Academic publications and teaching materials</li>
                        <li>Standard Class {studyItem?.className || '10'} learning objectives</li>
                      </>
                    ) : (
                      <>
                        <li>{studyItem?.board || 'NCERT'} curriculum guidelines</li>
                        <li>Class {studyItem?.className || '10'} textbook content</li>
                        <li>Standard {studyItem?.subject || 'subject'} learning objectives</li>
                      </>
                    )}
                  </ul>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" size="sm" onClick={toggleDeepSearch} disabled={generationStatus.progress > 20}>
                    Switch to {useDeepSearch ? "Standard Generation" : "Deep Web Search"}
                  </Button>
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
