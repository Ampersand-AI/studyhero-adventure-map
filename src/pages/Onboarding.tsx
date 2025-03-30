
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingCard from '@/components/OnboardingCard';
import { Button } from "@/components/ui/button";
import { Book, Rocket, GraduationCap, User, BookOpen, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [board, setBoard] = useState('');
  const [className, setClassName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
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
  
  const getSubjectsForClass = (className: string) => {
    const classNum = parseInt(className);
    if (classNum >= 6 && classNum <= 10) {
      return {
        compulsory: ['Mathematics', 'Science', 'Social Studies', 'English'],
        optional: ['Hindi', 'Sanskrit', 'Computer Science', 'Physical Education', 'Arts']
      };
    } else {
      return {
        compulsory: ['English'],
        optional: [
          'Physics', 
          'Chemistry', 
          'Mathematics', 
          'Biology', 
          'Computer Science', 
          'Economics',
          'Business Studies',
          'Accountancy',
          'Political Science',
          'History',
          'Geography',
          'Psychology'
        ]
      };
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
    
    if (step === 3) {
      const { compulsory } = getSubjectsForClass(className);
      
      // Check if at least one optional subject is selected
      const selectedOptionalSubjects = selectedSubjects.filter(sub => !compulsory.includes(sub));
      
      if (selectedOptionalSubjects.length === 0) {
        toast({
          title: "Please select at least one optional subject",
          description: "You need to select at least one optional subject to continue",
          variant: "destructive"
        });
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
      
      // If moving from class selection to subject selection, automatically select compulsory subjects
      if (step === 2) {
        const { compulsory } = getSubjectsForClass(className);
        setSelectedSubjects([...compulsory]);
      }
    } else {
      // Save to localStorage
      localStorage.setItem('studyHeroProfile', JSON.stringify({
        board,
        className,
        subjects: selectedSubjects,
        mainSubject: selectedSubjects[0], // Set first subject as main subject for initial dashboard view
        completed: false,
        lastUpdated: new Date().toISOString()
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

  const handleSubjectToggle = (subject: string) => {
    const { compulsory } = getSubjectsForClass(className);
    
    // Check if the subject is compulsory
    if (compulsory.includes(subject)) {
      // If trying to deselect a compulsory subject, show an error
      if (selectedSubjects.includes(subject)) {
        toast({
          title: "Compulsory subject",
          description: `${subject} is a compulsory subject and cannot be deselected`,
          variant: "destructive"
        });
      }
      return;
    }
    
    // Toggle optional subject
    setSelectedSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
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

          {step === 3 && className && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Select Your Subjects</CardTitle>
                </div>
                <CardDescription>
                  Compulsory subjects are automatically selected. Choose optional subjects based on your curriculum.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Compulsory Subjects</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {getSubjectsForClass(className).compulsory.map((subject) => (
                        <div key={subject} className="flex items-center space-x-2 rounded-md border p-3 bg-muted/40">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Optional Subjects (Select at least one)</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {getSubjectsForClass(className).optional.map((subject) => (
                        <div 
                          key={subject} 
                          className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-muted/40 ${
                            selectedSubjects.includes(subject) ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => handleSubjectToggle(subject)}
                        >
                          <Checkbox 
                            checked={selectedSubjects.includes(subject)}
                            onCheckedChange={() => handleSubjectToggle(subject)}
                            id={`subject-${subject}`}
                          />
                          <Label 
                            htmlFor={`subject-${subject}`}
                            className="flex-grow cursor-pointer"
                          >
                            {subject}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
