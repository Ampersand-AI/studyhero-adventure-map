import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { claudeService } from '@/services/claudeService';
import QuizCard from '@/components/QuizCard'; // Fixed import statement
import StudyAIHeader from '@/components/StudyAIHeader';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ChevronLeft, ChevronRight, Home, Trophy, Award, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface StudyItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  status: "completed" | "current" | "future";
  dueDate: string;
  content: string;
  estimatedTimeInMinutes: number;
  subject?: string;
  isWeeklyTest?: boolean;
  weekNumber?: number;
}

interface TestScore {
  id: string;
  subject: string;
  weekNumber: number;
  score: number;
  date: string;
}

const Quiz = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizItem, setQuizItem] = useState<StudyItem | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart className="h-4 w-4" /> },
  ];
  
  useEffect(() => {
    const loadQuizContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if we have a saved item matching the ID in the URL
        const savedItem = localStorage.getItem('currentStudyItem');
        if (!savedItem) {
          throw new Error("Quiz item not found. Please return to the dashboard and try again.");
        }
        
        const parsedItem = JSON.parse(savedItem) as StudyItem;
        if (parsedItem.id !== id) {
          throw new Error("Quiz item ID mismatch. Please return to the dashboard and try again.");
        }
        
        setQuizItem(parsedItem);
        
        // Get subject from the item
        const subject = parsedItem.subject || '';
        const topic = parsedItem.title || '';
        
        // For weekly tests, we need more questions
        const questionCount = parsedItem.isWeeklyTest ? 10 : 5;
        
        // Generate quiz questions
        if (parsedItem.isWeeklyTest) {
          toast({
            title: "Loading Weekly Test",
            description: `Preparing your Week ${parsedItem.weekNumber} assessment...`,
          });
        }
        
        const quizData = await claudeService.generateLessonTest(subject, topic, questionCount);
        
        if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          throw new Error("Failed to load quiz questions.");
        }
        
        setQuestions(quizData.questions);
        
      } catch (err: any) {
        console.error("Error loading quiz:", err);
        setError(err.message || "Failed to load quiz content.");
        toast({
          title: "Error",
          description: "Failed to load quiz content. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadQuizContent();
  }, [id]);
  
  const handleOptionSelect = (optionIndex: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(optionIndex);
    }
  };
  
  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === questions[currentQuestionIndex].correctIndex;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Calculate final score
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(finalScore);
      setIsQuizCompleted(true);
      
      // Handle completion rewards
      const xpGained = questions.length * 10;
      const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
      const newXp = currentXp + xpGained;
      localStorage.setItem('currentXp', newXp.toString());
      
      // Update weekly test score if this is a weekly test
      if (quizItem?.isWeeklyTest && quizItem.weekNumber) {
        saveWeeklyTestScore(quizItem.id, quizItem.subject || '', quizItem.weekNumber, finalScore);
      }
      
      // Mark as completed in the study plan
      updateStudyItemStatus();
      
      toast({
        title: `Quiz Completed!`,
        description: `Your score: ${finalScore}%. You earned ${xpGained} XP!`,
      });
    }
  };
  
  const saveWeeklyTestScore = (testId: string, subject: string, weekNumber: number, testScore: number) => {
    try {
      // Get existing scores
      const savedScores = localStorage.getItem('weeklyTestScores');
      let scores: TestScore[] = savedScores ? JSON.parse(savedScores) : [];
      
      // Check if this test score already exists
      const existingScoreIndex = scores.findIndex(s => s.id === testId);
      
      const newScore: TestScore = {
        id: testId,
        subject,
        weekNumber,
        score: testScore,
        date: new Date().toISOString()
      };
      
      if (existingScoreIndex >= 0) {
        // Update existing score
        scores[existingScoreIndex] = newScore;
      } else {
        // Add new score
        scores.push(newScore);
      }
      
      // Save back to localStorage
      localStorage.setItem('weeklyTestScores', JSON.stringify(scores));
      
    } catch (err) {
      console.error("Error saving test score:", err);
    }
  };
  
  const updateStudyItemStatus = () => {
    if (!quizItem) return;
    
    try {
      // Get all study plans
      const savedPlans = localStorage.getItem('studyPlans');
      if (!savedPlans) return;
      
      const plans = JSON.parse(savedPlans);
      
      // Find the current subject plan
      const subjectPlan = plans.find((p: any) => p.subject === quizItem.subject);
      if (!subjectPlan) return;
      
      // Update item status to completed
      const updatedItems = subjectPlan.items.map((item: any) => {
        if (item.id === quizItem.id) {
          return { ...item, status: "completed" };
        }
        return item;
      });
      
      // Update the subject plan
      const updatedPlans = plans.map((p: any) => {
        if (p.subject === quizItem.subject) {
          return { ...p, items: updatedItems };
        }
        return p;
      });
      
      // Save back to localStorage
      localStorage.setItem('studyPlans', JSON.stringify(updatedPlans));
      
    } catch (err) {
      console.error("Error updating study item status:", err);
    }
  };
  
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader userName="Student" level={1} xp={0} navigation={navigationItems} />
        <main className="flex-1 container py-6 flex justify-center items-center">
          <Card className="w-full max-w-3xl text-center p-8">
            <CardHeader>
              <CardTitle>Loading Quiz</CardTitle>
              <CardDescription>Preparing your questions...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader userName="Student" level={1} xp={0} navigation={navigationItems} />
        <main className="flex-1 container py-6 flex justify-center items-center">
          <Card className="w-full max-w-3xl text-center">
            <CardHeader>
              <CardTitle>Error Loading Quiz</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleReturnToDashboard}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  if (isQuizCompleted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader userName="Student" level={1} xp={0} navigation={navigationItems} />
        <main className="flex-1 container py-6 flex justify-center items-center">
          <Card className="w-full max-w-3xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              <CardDescription>
                {quizItem?.isWeeklyTest 
                  ? `You've completed the Week ${quizItem.weekNumber} assessment for ${quizItem.subject}`
                  : `You've completed the quiz on ${quizItem?.title}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center my-8">
                <div className="relative h-36 w-36 flex items-center justify-center mb-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className={`${
                        score >= 80 ? "text-green-500" : 
                        score >= 60 ? "text-yellow-500" : 
                        "text-red-500"
                      }`}
                      strokeWidth="8"
                      strokeDasharray={`${score * 2.51} 1000`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{score}%</span>
                    <span className="text-sm text-muted-foreground">Score</span>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-lg font-medium">
                    You answered {correctAnswers} out of {questions.length} questions correctly.
                  </p>
                  {score >= 80 ? (
                    <p className="text-green-600 flex items-center justify-center mt-2">
                      <Award className="h-5 w-5 mr-1" /> Excellent work!
                    </p>
                  ) : score >= 60 ? (
                    <p className="text-yellow-600">Good job! Keep practicing to improve.</p>
                  ) : (
                    <p className="text-red-600">You might need to review this material again.</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button size="lg" onClick={handleReturnToDashboard}>
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader userName="Student" level={1} xp={0} navigation={navigationItems} />
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={handleReturnToDashboard}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {quizItem?.isWeeklyTest 
                ? `Week ${quizItem.weekNumber} Assessment` 
                : `Quiz: ${quizItem?.title}`}
            </h1>
            <p className="text-muted-foreground">
              {quizItem?.subject} • Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          <Progress value={(currentQuestionIndex / questions.length) * 100} />
        </div>
        
        {currentQuestion && (
          <QuizCard
            question={currentQuestion.question}
            options={currentQuestion.options}
            selectedAnswer={selectedOption !== null ? currentQuestion.options[selectedOption] : null}
            correctAnswer={isAnswerSubmitted ? currentQuestion.options[currentQuestion.correctIndex] : null}
            onSelectAnswer={(answer) => {
              const index = currentQuestion.options.indexOf(answer);
              if (index !== -1) {
                handleOptionSelect(index);
              }
            }}
            onSubmitAnswer={isAnswerSubmitted ? handleNextQuestion : handleSubmitAnswer}
            isAnswered={isAnswerSubmitted}
          />
        )}
        
        <div className="mt-6 flex justify-end">
          {isAnswerSubmitted ? (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? (
                <>
                  Next Question <ChevronRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Complete Quiz <Check className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={selectedOption === null}
            >
              Submit Answer
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
