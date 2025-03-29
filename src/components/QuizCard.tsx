
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface QuizCardProps {
  question: string;
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  onSubmitAnswer: () => void;
  isAnswered: boolean;
}

const QuizCard = ({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  onSelectAnswer,
  onSubmitAnswer,
  isAnswered
}: QuizCardProps) => {
  return (
    <Card className="study-card max-w-2xl w-full animate-scale-in">
      <CardHeader>
        <CardTitle className="text-xl">{question}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedAnswer || ""} className="space-y-3">
          {options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 p-3 rounded-lg border-2 ${
                isAnswered && correctAnswer === option
                  ? "border-study-green bg-study-green/10"
                  : isAnswered && selectedAnswer === option && correctAnswer !== option
                  ? "border-destructive bg-destructive/10"
                  : "border-gray-200"
              }`}
            >
              <RadioGroupItem
                value={option}
                id={`option-${index}`}
                disabled={isAnswered}
                onClick={() => onSelectAnswer(option)}
              />
              <Label htmlFor={`option-${index}`} className="flex-grow cursor-pointer">
                {option}
              </Label>
              {isAnswered && correctAnswer === option && (
                <CheckCircle className="h-5 w-5 text-study-green" />
              )}
              {isAnswered && selectedAnswer === option && correctAnswer !== option && (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onSubmitAnswer}
          disabled={!selectedAnswer || isAnswered}
          className="w-full"
        >
          {isAnswered ? "Next Question" : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
