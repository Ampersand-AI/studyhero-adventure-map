
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudyAIHeader } from '@/components/StudyAIHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { claudeService } from '@/services/claudeService';
import LessonTest from '@/components/LessonTest';
import { Award, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface LessonActivity {
  title: string;
  instructions: string;
}

interface LessonExample {
  title: string;
  content: string;
}

interface VisualAid {
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
}

const Lesson = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [currentSection, setCurrentSection] = useState('content'); // 'content' or 'test'
  const [testContent, setTestContent] = useState<any>(null);
  
  // Get the current study item from localStorage
  const currentStudyItem = JSON.parse(localStorage.getItem('currentStudyItem') || '{}');
  
  useEffect(() => {
    const loadLessonContent = async () => {
      setIsLoading(true);
      
      try {
        if (!currentStudyItem || !currentStudyItem.subject || !currentStudyItem.title) {
          throw new Error("Missing study item information");
        }
        
        // Check if we already have content for this lesson
        const cachedContent = localStorage.getItem(`lesson_${id}_content`);
        if (cachedContent) {
          setLessonContent(JSON.parse(cachedContent));
        } else {
          // Generate content
          const content = await claudeService.generateLessonContent(
            currentStudyItem.subject,
            currentStudyItem.title
          );
          
          if (content) {
            setLessonContent(content);
            localStorage.setItem(`lesson_${id}_content`, JSON.stringify(content));
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
  
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: <ChevronLeft className="h-4 w-4" /> },
  ];
  
  if (isLoading || !lessonContent) {
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
            test={testContent}
            onComplete={handleNextLesson}
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
            {/* Key Points */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Key Points</h3>
              <ul className="list-disc pl-6 space-y-2">
                {lessonContent.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </section>
            
            {/* Explanation */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Explanation</h3>
              <div className="space-y-4">
                {lessonContent.explanation.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
            
            {/* Examples */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Examples</h3>
              <div className="space-y-4">
                {lessonContent.examples.map((example, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{example.title}</h4>
                    <p>{example.content}</p>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Visual Aids */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Visual Aids</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonContent.visualAids.map((aid, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">{aid.title}</h4>
                    <p>{aid.description}</p>
                  </div>
                ))}
              </div>
            </section>
            
            {/* Activities */}
            <section>
              <h3 className="text-xl font-semibold mb-4">Activities</h3>
              <div className="space-y-4">
                {lessonContent.activities.map((activity, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-medium mb-2">{activity.title}</h4>
                    <p>{activity.instructions}</p>
                  </div>
                ))}
              </div>
            </section>
            
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
