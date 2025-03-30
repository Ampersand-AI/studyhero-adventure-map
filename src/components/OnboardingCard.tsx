import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface OnboardingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  options?: string[];
  selectedOption?: string;
  onOptionSelect?: (option: string) => void;
}

const OnboardingCard = ({
  title,
  description,
  icon,
  onClick,
  options,
  selectedOption,
  onOptionSelect
}: OnboardingCardProps) => {
  // If options are provided, render as selectable card with options
  if (options && options.length > 0 && onOptionSelect) {
    return (
      <Card className="study-card max-w-md w-full animate-float">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-3">
            {options.map((option) => (
              <Button
                key={option}
                variant={selectedOption === option ? "default" : "outline"}
                className={`h-12 justify-start relative ${
                  selectedOption === option ? "bg-primary text-primary-foreground" : ""
                }`}
                onClick={() => onOptionSelect(option)}
              >
                <span className="flex-1 text-left">{option}</span>
                {selectedOption === option && (
                  <Check className="h-4 w-4 opacity-70 absolute right-4" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Otherwise, render as simple clickable card
  return (
    <Card 
      className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md" 
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default OnboardingCard;
