
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import StudyAIHeader from '@/components/StudyAIHeader';
import { claudeService } from '@/services/claudeService';
import { ChevronLeft } from 'lucide-react';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [studyItem, setStudyItem] = useState<any>(null);
  
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      
      try {
        // Get study item from localStorage
        const storedStudyItem = localStorage.getItem('currentStudyItem');
        
        if (!storedStudyItem) {
          throw new Error("Missing study item information");
        }
        
        const parsedStudyItem = JSON.parse(storedStudyItem);
        setStudyItem(parsedStudyItem);
        
        // Show toast for quiz loading
        toast("Loading quiz for " + parsedStudyItem.title + "...");
        
        // Get quiz from Claude API
        const result = await claudeService.getQuizQuestions(
          parsedStudyItem.subject,
          parsedStudyItem.title,
          5
        );
        
        if (result && result.questions && result.questions.length > 0) {
          setQuiz({
            title: parsedStudyItem.title,
            questions: result.questions
          });
        } else {
          // If no questions returned, use placeholder
          setQuiz({
            title: parsedStudyItem.title,
            questions: [
              {
                id: "q1",
                question: "What is the main concept of this topic?",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: "Option A",
                explanation: "This is the correct explanation for this question."
              }
            ]
          });
          
          toast("Using demo questions - Couldn't load specific questions for this topic.");
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        
        // Use placeholder data on error
        setQuiz({
          title: studyItem?.title || "Quiz",
          questions: [
            {
              id: "q1",
              question: "Sample question about this topic?",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: "Option A",
              explanation: "This is the explanation for the sample question."
            }
          ]
        });
        
        toast("Error - There was a problem loading this quiz. Using sample questions.");
      } finally {
        setLoading(false);
      }
    };
    
    loadQuiz();
  }, [id]);
  
  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };
  
  const handleNextQuestion = () => {
    // Check if the answer is correct
    if (selectedAnswer === quiz.questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    // Move to next question or end quiz
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer("");
    } else {
      setIsSubmitted(true);
      
      // Award XP for completing a quiz
      const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
      localStorage.setItem('currentXp', (currentXp + 15).toString());
    }
  };
  
  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setIsSubmitted(false);
    setScore(0);
  };
  
  const navigationItems = [
    { name: "Back to Dashboard", href: "/dashboard", icon: <ChevronLeft className="h-4 w-4" /> },
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader
          userName="Student"
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="flex-1 container py-6 md:py-12">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Loading Quiz</CardTitle>
              <CardDescription>Preparing your questions...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader
          userName="Student"
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="flex-1 container py-6 md:py-12">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Quiz Unavailable</CardTitle>
              <CardDescription>We couldn't load this quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground mb-4">
                Sorry, there was a problem loading the quiz. Please try again later.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  if (isSubmitted) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader
          userName="Student"
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="flex-1 container py-6 md:py-12">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Quiz Results</CardTitle>
              <CardDescription>{quiz.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold">{score} / {quiz.questions.length}</h2>
                <p className="text-lg text-muted-foreground">Your Score: {percentage}%</p>
                
                {percentage >= 80 ? (
                  <p className="text-green-600 font-medium mt-2">Excellent!</p>
                ) : percentage >= 60 ? (
                  <p className="text-blue-600 font-medium mt-2">Good job!</p>
                ) : (
                  <p className="text-amber-600 font-medium mt-2">Keep practicing!</p>
                )}
              </div>
              
              <div className="space-y-4 pt-4">
                <h3 className="font-medium">Question Review:</h3>
                {quiz.questions.map((q: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <p className="font-medium">{q.question}</p>
                    <p className="text-sm mt-2">Correct answer: <span className="text-green-600">{q.correctAnswer}</span></p>
                    <p className="text-sm text-muted-foreground mt-1">{q.explanation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleRetry}>
                Try Again
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }
  
  const currentQ = quiz.questions[currentQuestion];
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader
        userName="Student"
        level={parseInt(localStorage.getItem('currentLevel') || '1')}
        xp={parseInt(localStorage.getItem('currentXp') || '0')}
        navigation={navigationItems}
      />
      <main className="flex-1 container py-6 md:py-12">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>{quiz.title} - Quiz</CardTitle>
            <CardDescription>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-medium">{currentQ.question}</h3>
            
            <RadioGroup value={selectedAnswer} className="space-y-3">
              {currentQ.options.map((option: string, i: number) => (
                <div
                  key={i}
                  className={`flex items-center space-x-2 p-3 rounded-lg border-2 ${
                    selectedAnswer === option ? 'border-primary/70' : 'border-gray-200 hover:border-primary/50'
                  } transition-colors`}
                >
                  <RadioGroupItem
                    value={option}
                    id={`option-${i}`}
                    onClick={() => handleSelectAnswer(option)}
                  />
                  <Label htmlFor={`option-${i}`} className="flex-grow cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <span className="text-sm text-muted-foreground">
                Score: {score}/{currentQuestion}
              </span>
            </div>
            <Button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
            >
              {currentQuestion === quiz.questions.length - 1 ? "Finish" : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Quiz;
