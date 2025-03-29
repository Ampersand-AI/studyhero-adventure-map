
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingCard from '@/components/OnboardingCard';
import { Button } from "@/components/ui/button";
import { Book, Rocket, GraduationCap, User, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [board, setBoard] = useState('');
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const boards = [
    'CBSE', 
    'ICSE', 
    'State Board - Maharashtra', 
    'State Board - Tamil Nadu',
    'State Board - Karnataka',
    'State Board - UP',
    'International Baccalaureate'
  ];
  
  const classes = ['6', '7', '8', '9', '10', '11', '12'];
  
  const subjects = {
    "6-10": ['Mathematics', 'Science', 'Social Studies', 'English', 'Hindi', 'Sanskrit'],
    "11-12": ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Economics']
  };

  const getSubjectsForClass = (className: string) => {
    const classNum = parseInt(className);
    if (classNum >= 6 && classNum <= 10) {
      return subjects["6-10"];
    } else {
      return subjects["11-12"];
    }
  };

  const handleNext = () => {
    if (step === 1 && !board) {
      toast({
        title: "Please select a board",
        description: "You need to select your board to continue",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && !className) {
      toast({
        title: "Please select a class",
        description: "You need to select your class to continue",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 3 && !subject) {
      toast({
        title: "Please select a subject",
        description: "You need to select a subject to continue",
        variant: "destructive"
      });
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save to localStorage
      localStorage.setItem('studyHeroProfile', JSON.stringify({
        board,
        className,
        subject,
        completed: false
      }));
      
      // Navigate to dashboard
      navigate('/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex flex-col">
      <div className="flex-1 container flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display text-primary mb-2">StudyHero</h1>
          <p className="text-lg text-muted-foreground">Your adventure map to academic success</p>
        </div>

        <div className="w-full max-w-md">
          {step === 1 && (
            <OnboardingCard
              title="Select Your Board"
              description="Choose the educational board you're studying under"
              options={boards}
              selectedOption={board}
              onOptionSelect={setBoard}
              icon={<Book className="h-5 w-5" />}
            />
          )}

          {step === 2 && (
            <OnboardingCard
              title="Select Your Class"
              description="Which class are you currently studying in?"
              options={classes}
              selectedOption={className}
              onOptionSelect={setClassName}
              icon={<GraduationCap className="h-5 w-5" />}
            />
          )}

          {step === 3 && (
            <OnboardingCard
              title="Select Your Subject"
              description="Choose the subject you want to study"
              options={getSubjectsForClass(className)}
              selectedOption={subject}
              onOptionSelect={setSubject}
              icon={<BookOpen className="h-5 w-5" />}
            />
          )}

          <div className="flex justify-between mt-8">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              className="gradient-button"
            >
              <span className="gradient-button-bg"></span>
              <span className="gradient-button-text">
                {step < 3 ? 'Next' : 'Create My Adventure Map'}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <footer className="py-6 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2023 StudyHero. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button variant="ghost" size="sm">Privacy</Button>
            <Button variant="ghost" size="sm">Terms</Button>
            <Button variant="ghost" size="sm">Help</Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
