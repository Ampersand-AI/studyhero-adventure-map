
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Medal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { claudeService } from '@/services/claudeService';
import { toast } from 'sonner';

interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface LessonTestProps {
  lessonId?: string;
  lessonTitle: string;
  subjectName: string;
  topicName: string;
  questions?: TestQuestion[];
  onComplete?: (score: number, total: number) => void;
  onFinish: () => void;
  onCancel?: () => void;
}

const LessonTest = ({ 
  lessonId, 
  lessonTitle, 
  subjectName, 
  topicName, 
  questions: initialQuestions, 
  onComplete, 
  onCancel, 
  onFinish 
}: LessonTestProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        if (initialQuestions && initialQuestions.length > 0) {
          setQuestions(initialQuestions);
          setSelectedAnswers(Array(initialQuestions.length).fill(''));
        } else {
          // Fetch questions from Claude service
          const result = await claudeService.getQuizQuestions(subjectName, topicName, 10);
          
          if (result && result.questions) {
            // Process questions to ensure they have the correct structure
            const processedQuestions: TestQuestion[] = result.questions.map((q: any, i: number) => ({
              id: q.id || `q${i+1}`,
              question: q.question || `Question ${i+1}`,
              options: q.options || ["Option A", "Option B", "Option C", "Option D"],
              correctAnswer: q.correctAnswer || q.options?.[0] || "Option A",
              explanation: q.explanation || "Explanation not provided"
            }));
            
            setQuestions(processedQuestions);
            setSelectedAnswers(Array(processedQuestions.length).fill(''));
          } else {
            toast.error("Error", {
              description: "Failed to load quiz questions. Please try again.",
            });
            
            // Set empty array to avoid errors
            setQuestions([]);
          }
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        toast.error("Error", {
          description: "Failed to load quiz questions. Please try again.",
        });
        
        // Set empty array to avoid errors
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [initialQuestions, subjectName, topicName]);
  
  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsSubmitted(true);
      calculateScore();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score++;
      }
    });
    setShowResults(true);
    if (onComplete) {
      onComplete(score, questions.length);
    }
    
    // Award XP for completing a quiz
    const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
    localStorage.setItem('currentXp', (currentXp + 25).toString());
  };

  if (loading) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-display">{topicName} - Loading Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-display">No Questions Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Sorry, we couldn't load questions for this topic. Please try again later.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onFinish}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (showResults) {
    const score = questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length;
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <Card className="w-full max-w-3xl mx-auto animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Test Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-muted stroke-current" 
                  strokeWidth="10" 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent"
                />
                <circle 
                  className="text-primary stroke-current" 
                  strokeWidth="10" 
                  strokeLinecap="round" 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="transparent"
                  strokeDasharray={`${percentage * 2.51} 251`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-display font-bold">
                  {score}/{questions.length}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">Your score: {percentage}%</p>
            {percentage >= 80 ? (
              <div className="flex items-center justify-center gap-2 text-study-green">
                <Medal className="h-5 w-5" />
                <span>Excellent work!</span>
              </div>
            ) : percentage >= 60 ? (
              <p className="text-study-blue">Good job!</p>
            ) : (
              <p className="text-amber-500">You might need to review this lesson again.</p>
            )}
          </div>
          
          <div className="space-y-4 pt-4">
            <h3 className="font-medium text-lg">Question Review:</h3>
            {questions.map((question, index) => (
              <div key={index} className="p-3 rounded-lg border">
                <div className="flex items-start gap-2">
                  {selectedAnswers[index] === question.correctAnswer ? (
                    <CheckCircle className="h-5 w-5 text-study-green mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{question.question}</p>
                    <p className="text-sm mt-1">
                      Your answer: <span className={selectedAnswers[index] === question.correctAnswer ? "text-study-green" : "text-destructive"}>
                        {selectedAnswers[index]}
                      </span>
                    </p>
                    {selectedAnswers[index] !== question.correctAnswer && (
                      <p className="text-sm text-study-green">Correct answer: {question.correctAnswer}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">{question.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={onFinish}>
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== '';
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-display">{topicName} - Test</CardTitle>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={(currentQuestionIndex / questions.length) * 100} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          
          <RadioGroup value={selectedAnswers[currentQuestionIndex]} className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-3 rounded-lg border-2 border-gray-200 hover:border-primary/50 transition-colors"
              >
                <RadioGroupItem
                  value={option}
                  id={`option-${index}`}
                  onClick={() => handleSelectAnswer(option)}
                />
                <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        <Button
          onClick={onFinish}
          variant="ghost"
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isAnswered}
        >
          {isLastQuestion ? "Submit" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LessonTest;
