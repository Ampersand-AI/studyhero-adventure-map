
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizCard from '@/components/QuizCard';
import StudyHeroHeader from '@/components/StudyHeroHeader';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, XCircle, Home, Map, Trophy, BarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { claudeService } from '@/services/claudeService';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [quizItem, setQuizItem] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: <Home className="h-4 w-4" /> },
    { name: "Timeline", href: "/dashboard", icon: <Map className="h-4 w-4" /> },
    { name: "Achievements", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        // Get the quiz details from the study plan
        const studyPlan = JSON.parse(localStorage.getItem('studyPlan') || '[]');
        const quiz = studyPlan.find((item: any) => item.id === id);
        
        if (!quiz) {
          toast({
            title: "Quiz not found",
            description: "The quiz you're looking for doesn't exist",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        setQuizItem(quiz);
        
        // Check if quiz questions are already in localStorage
        const storedQuestions = localStorage.getItem(`quiz_${id}`);
        if (storedQuestions) {
          setQuestions(JSON.parse(storedQuestions));
          setLoading(false);
        } else {
          // Generate 5 questions for this quiz topic
          const quizQuestions = [];
          for (let i = 0; i < 5; i++) {
            const profileInfo = JSON.parse(localStorage.getItem('studyHeroProfile') || '{}');
            const question = await claudeService.generateQuizQuestion(profileInfo.subject, quiz.title);
            quizQuestions.push(question);
          }
          
          localStorage.setItem(`quiz_${id}`, JSON.stringify(quizQuestions));
          setQuestions(quizQuestions);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        toast({
          title: "Error loading quiz",
          description: "Please try again later",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    };
    
    loadQuiz();
  }, [id, navigate, toast]);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      toast({
        title: "Correct!",
        description: currentQuestion.explanation,
      });
    } else {
      toast({
        title: "Incorrect",
        description: currentQuestion.explanation,
        variant: "destructive"
      });
    }
    
    setIsAnswered(true);
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setQuizCompleted(true);
        
        // Update the study plan to mark this quiz as completed
        const studyPlan = JSON.parse(localStorage.getItem('studyPlan') || '[]');
        const updatedPlan = studyPlan.map((item: any) => {
          if (item.id === id) {
            return { ...item, status: "completed" };
          } else if (item.status === "future" && studyPlan.filter((i: any) => i.status === "current").length === 0) {
            return { ...item, status: "current" };
          }
          return item;
        });
        
        localStorage.setItem('studyPlan', JSON.stringify(updatedPlan));
      }
    }, 2000);
  };

  const handleFinishQuiz = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyHeroHeader 
          userName="Student Hero" 
          level={3} 
          xp={750}
          navigation={navigationItems}
        />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyHeroHeader 
        userName="Student Hero" 
        level={3} 
        xp={750}
        navigation={navigationItems}
      />
      
      <main className="flex-1 container py-6">
        {!quizCompleted ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-display mb-2">{quizItem?.title} Quiz</h1>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium">
                  {correctAnswers} correct
                </span>
              </div>
              <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2" />
            </div>
            
            {questions.length > 0 && (
              <QuizCard
                question={questions[currentQuestionIndex].question}
                options={questions[currentQuestionIndex].options}
                selectedAnswer={selectedAnswer}
                correctAnswer={isAnswered ? questions[currentQuestionIndex].correctAnswer : null}
                onSelectAnswer={handleSelectAnswer}
                onSubmitAnswer={handleSubmitAnswer}
                isAnswered={isAnswered}
              />
            )}
          </div>
        ) : (
          <Card className="max-w-md mx-auto study-card animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
              <CardDescription>
                You've completed the {quizItem?.title} quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center my-4">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl font-display">
                    {correctAnswers}/{questions.length}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-study-green" />
                  <span>Correct answers: {correctAnswers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span>Incorrect answers: {questions.length - correctAnswers}</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="w-full" onClick={handleFinishQuiz}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Quiz;
