
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudyAIHeader from '@/components/StudyAIHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { claudeService } from '@/services/claudeService';
import LessonTest from '@/components/LessonTest';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Award, BookOpen, ChevronLeft, ChevronRight, Info, BookOpenText, ExternalLink } from 'lucide-react';

interface LessonActivity {
  title: string;
  instructions: string;
  learningOutcome?: string;
}

interface LessonExample {
  title: string;
  content: string;
}

interface VisualAid {
  title: string;
  description: string;
  visualType?: string;
}

interface TextbookReference {
  chapter: string;
  pageNumbers: string;
  description: string;
}

interface VisualLearningResource {
  type: string;
  title: string;
  description: string;
}

interface LessonContent {
  title: string;
  keyPoints: string[];
  explanation: string[];
  examples: LessonExample[];
  visualAids: VisualAid[];
  activities: LessonActivity[];
  summary: string;
  textbookReferences?: TextbookReference[];
  visualLearningResources?: VisualLearningResource[];
}

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [currentSection, setCurrentSection] = useState('content'); // 'content' or 'test'
  const [testContent, setTestContent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Get the current study item from localStorage
  const currentStudyItem = JSON.parse(localStorage.getItem('currentStudyItem') || '{}');
  
  useEffect(() => {
    const loadLessonContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!currentStudyItem || !currentStudyItem.subject || !currentStudyItem.title) {
          throw new Error("Missing study item information");
        }
        
        // Check if we already have content for this lesson
        const cachedContent = localStorage.getItem(`lesson_${id}_content`);
        if (cachedContent) {
          const parsedContent = JSON.parse(cachedContent);
          // Check if the cached content has all required fields
          if (parsedContent && 
              parsedContent.keyPoints && 
              parsedContent.explanation && 
              parsedContent.examples && 
              parsedContent.visualAids && 
              parsedContent.activities && 
              parsedContent.summary) {
            setLessonContent(parsedContent);
          } else {
            // If cached content is missing fields, regenerate it
            throw new Error("Cached lesson content is incomplete");
          }
        } else {
          // Generate content
          const content = await claudeService.generateLessonContent(
            currentStudyItem.subject,
            currentStudyItem.title
          );
          
          if (content && 
              content.keyPoints && 
              content.explanation && 
              content.examples && 
              content.visualAids && 
              content.activities && 
              content.summary) {
            setLessonContent(content);
            localStorage.setItem(`lesson_${id}_content`, JSON.stringify(content));
          } else {
            throw new Error("Generated lesson content is incomplete");
          }
        }
        
        // Load test content too (for later)
        const cachedTest = localStorage.getItem(`lesson_${id}_test`);
        if (cachedTest) {
          setTestContent(JSON.parse(cachedTest));
        } else {
          // We'll lazy load this when needed
        }
      } catch (error) {
        console.error("Error loading lesson content:", error);
        
        // If we've tried less than 2 times, retry with a delay
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
          toast({
            title: "Retrying",
            description: "Attempting to load lesson content again...",
          });
          
          // Wait 2 seconds before retrying
          setTimeout(() => {
            loadLessonContent();
          }, 2000);
          return;
        }
        
        setError("Failed to load lesson content. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load lesson content. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLessonContent();
  }, [id, currentStudyItem]);
  
  const handleNextLesson = () => {
    if (!lessonCompleted) {
      // Mark this lesson as completed
      setLessonCompleted(true);
      
      // Update the study plan item
      const studyPlans = JSON.parse(localStorage.getItem('studyPlans') || '[]');
      const subject = currentStudyItem.subject;
      
      const updatedPlans = studyPlans.map((plan: any) => {
        if (plan.subject === subject) {
          const updatedItems = plan.items.map((item: any) => {
            if (item.id === id) {
              return {
                ...item,
                status: 'completed',
              };
            }
            
            // Find the next item and mark it as current
            const currentIndex = plan.items.findIndex((i: any) => i.id === id);
            if (currentIndex >= 0 && currentIndex + 1 < plan.items.length) {
              const nextItem = plan.items[currentIndex + 1];
              if (item.id === nextItem.id) {
                return {
                  ...item,
                  status: 'current',
                };
              }
            }
            
            return item;
          });
          
          return {
            ...plan,
            items: updatedItems,
          };
        }
        return plan;
      });
      
      localStorage.setItem('studyPlans', JSON.stringify(updatedPlans));
      
      // Award XP
      const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
      const currentLevel = parseInt(localStorage.getItem('currentLevel') || '1');
      
      const newXp = currentXp + 50; // 50 XP for completing a lesson
      localStorage.setItem('currentXp', newXp.toString());
      
      // Check if level up (every 100 XP)
      if (Math.floor(newXp / 100) > Math.floor(currentXp / 100)) {
        const newLevel = currentLevel + 1;
        localStorage.setItem('currentLevel', newLevel.toString());
        
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${newLevel}`,
        });
      }
      
      toast({
        title: "Lesson Completed!",
        description: "You've earned 50 XP",
      });
    }
    
    // Navigate back to dashboard
    navigate('/dashboard');
  };
  
  const handleStartTest = async () => {
    // If we don't have test content yet, generate it
    if (!testContent) {
      setIsLoading(true);
      try {
        const test = await claudeService.generateLessonTest(
          currentStudyItem.subject,
          currentStudyItem.title,
          5  // 5 questions
        );
        
        if (test) {
          setTestContent(test);
          localStorage.setItem(`lesson_${id}_test`, JSON.stringify(test));
        }
      } catch (error) {
        console.error("Error generating test:", error);
        toast({
          title: "Error",
          description: "Failed to generate test. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    // Switch to test view
    setCurrentSection('test');
  };
  
  // Function to get textbook URL based on subject
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
  
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: <ChevronLeft className="h-4 w-4" /> },
  ];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader 
          userName="Student"
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading lesson content...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (error || !lessonContent) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader 
          userName="Student"
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Error Loading Lesson</CardTitle>
              <CardDescription>We couldn't load the lesson content</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{error || "Something went wrong while loading this lesson."}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/dashboard')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button className="ml-2" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  if (currentSection === 'test' && testContent) {
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
            lessonId={id || ''}
            lessonTitle={lessonContent.title}
            questions={testContent.questions}
            onComplete={handleNextLesson}
            onCancel={() => setCurrentSection('content')}
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
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl md:text-3xl">{lessonContent.title}</CardTitle>
                <CardDescription className="mt-2">{currentStudyItem.subject}</CardDescription>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Textbook Reference Notice */}
            <Alert className="bg-blue-50 border-blue-200">
              <div className="flex items-center">
                <BookOpenText className="h-4 w-4 mr-2 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800">
                    This lesson follows the NCERT curriculum for {currentStudyItem.subject}. Access the official textbook for additional reference.
                  </p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  className="ml-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => window.open(getTextbookUrl(currentStudyItem.subject), '_blank')}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Open NCERT Textbook
                </Button>
              </div>
            </Alert>
            
            {/* Key Points */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Key Points</h3>
              <ul className="list-disc pl-6 space-y-2">
                {lessonContent.keyPoints && lessonContent.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </section>
            
            {/* Explanation */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Explanation</h3>
              <div className="space-y-4">
                {lessonContent.explanation && lessonContent.explanation.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
            
            {/* Examples */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Examples</h3>
              <div className="space-y-4">
                {lessonContent.examples && lessonContent.examples.map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-medium mb-2">{example.title}</h4>
                    <p>{example.content}</p>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Visual Aids */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Visual Learning Aids</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonContent.visualAids && lessonContent.visualAids.map((aid, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">{aid.title}</h4>
                    <p className="mb-2">{aid.description}</p>
                    {aid.visualType && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {aid.visualType}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </section>
            
            {/* Textbook References if available */}
            {lessonContent.textbookReferences && lessonContent.textbookReferences.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-4">NCERT Textbook References</h3>
                <div className="space-y-4">
                  {lessonContent.textbookReferences.map((reference, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-blue-50">
                      <h4 className="font-medium mb-2">
                        Chapter {reference.chapter} {reference.pageNumbers ? `(Pages ${reference.pageNumbers})` : ''}
                      </h4>
                      <p>{reference.description}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-blue-700"
                        onClick={() => window.open(getTextbookUrl(currentStudyItem.subject), '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View in Textbook
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Activities */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Activities</h3>
              <div className="space-y-4">
                {lessonContent.activities && lessonContent.activities.map((activity, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-medium mb-2">{activity.title}</h4>
                    <p>{activity.instructions}</p>
                    {activity.learningOutcome && (
                      <div className="mt-2 p-2 bg-white rounded border">
                        <span className="text-xs font-medium text-primary">Learning Outcome:</span>
                        <p className="text-sm">{activity.learningOutcome}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            
            {/* Additional Visual Learning Resources if available */}
            {lessonContent.visualLearningResources && lessonContent.visualLearningResources.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold mb-4">Additional Visual Learning Resources</h3>
                <div className="space-y-3">
                  {lessonContent.visualLearningResources.map((resource, index) => (
                    <div key={index} className="p-3 bg-primary/5 rounded-md">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          <p className="text-sm">{resource.description}</p>
                          <Badge variant="outline" className="mt-1">
                            {resource.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Summary */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Summary</h3>
              <p>{lessonContent.summary}</p>
            </section>
          </CardContent>
          
          <CardFooter className="flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-end">
            <Button onClick={handleNextLesson} variant="outline">
              <Award className="mr-2 h-4 w-4" />
              Mark as Completed 
            </Button>
            <Button onClick={handleStartTest}>
              <BookOpen className="mr-2 h-4 w-4" />
              Take Test
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Lesson;
