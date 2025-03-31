
import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, ChevronRight } from "lucide-react";
import deepSeekService from '@/services/deepSeekService';

interface SubjectSelectionFormProps {
  board: string;
  className: string;
  onComplete: (selectedSubjects: string[]) => void;
  onBack: () => void;
}

const SubjectSelectionForm: React.FC<SubjectSelectionFormProps> = ({
  board,
  className,
  onComplete,
  onBack
}) => {
  const [compulsorySubjects, setCompulsorySubjects] = useState<string[]>([]);
  const [optionalSubjects, setOptionalSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoading(true);
        const result = await deepSeekService.getSubjectsForBoardAndClass(board, className);
        
        setCompulsorySubjects(result.compulsorySubjects);
        setOptionalSubjects(result.optionalSubjects);
        
        // Automatically select all compulsory subjects
        setSelectedSubjects(result.compulsorySubjects);
      } catch (error) {
        console.error("Error loading subjects:", error);
        toast({
          title: "Failed to load subjects",
          description: "There was an error loading the subjects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [board, className]);

  const handleOptionalSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleContinue = () => {
    if (selectedSubjects.length === 0) {
      toast({
        title: "Please select at least one subject",
        description: "You need to select at least one subject to continue.",
        variant: "destructive",
      });
      return;
    }

    onComplete(selectedSubjects);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Loading Subjects</CardTitle>
          <CardDescription>Please wait while we load the subjects for {board} Class {className}...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Select Your Subjects</CardTitle>
        <CardDescription>Choose the subjects you want to study for {board} Class {className}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Compulsory Subjects</h3>
          <div className="grid grid-cols-1 gap-2">
            {compulsorySubjects.map(subject => (
              <div key={subject} className="flex items-center space-x-3 p-2 rounded-md border bg-muted/50">
                <Checkbox 
                  id={subject} 
                  checked={true} 
                  disabled={true}
                />
                <label htmlFor={subject} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {subject}
                </label>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Optional Subjects</h3>
          <div className="grid grid-cols-1 gap-2">
            {optionalSubjects.map(subject => (
              <div 
                key={subject} 
                className="flex items-center space-x-3 p-2 rounded-md border hover:bg-muted cursor-pointer"
                onClick={() => handleOptionalSubjectToggle(subject)}
              >
                <Checkbox 
                  id={subject} 
                  checked={selectedSubjects.includes(subject)}
                />
                <label htmlFor={subject} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {subject}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubjectSelectionForm;
