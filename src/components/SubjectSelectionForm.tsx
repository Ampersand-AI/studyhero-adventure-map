
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import deepSeekService from "../services/deepSeekService";

interface SubjectSelectionFormProps {
  board: string;
  className: string;
  onComplete: (subjects: string[]) => void;
}

const SubjectSelectionForm: React.FC<SubjectSelectionFormProps> = ({
  board,
  className,
  onComplete
}) => {
  const [loading, setLoading] = useState(true);
  const [compulsorySubjects, setCompulsorySubjects] = useState<string[]>([]);
  const [optionalSubjects, setOptionalSubjects] = useState<string[]>([]);
  const [selectedOptionalSubjects, setSelectedOptionalSubjects] = useState<string[]>([]);
  
  // Fetch subjects based on board and class
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const subjects = await deepSeekService.getSubjectsForBoardAndClass(board, className);
        setCompulsorySubjects(subjects.compulsorySubjects);
        setOptionalSubjects(subjects.optionalSubjects);
      } catch (error) {
        console.error("Error fetching subjects:", error);
        toast("Error loading subjects", {
          description: "Could not fetch subjects for this board and class. Using default list."
        });
        // Set default subjects
        setCompulsorySubjects(["Mathematics", "Science", "English", "Social Studies", "Hindi"]);
        setOptionalSubjects(["Computer Science", "Sanskrit", "Physical Education", "Art", "Music"]);
      } finally {
        setLoading(false);
      }
    };

    if (board && className) {
      fetchSubjects();
    }
  }, [board, className]);

  const handleOptionalSubjectToggle = (subject: string) => {
    setSelectedOptionalSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Combine compulsory and selected optional subjects
    const selectedSubjects = [...compulsorySubjects, ...selectedOptionalSubjects];
    
    if (selectedSubjects.length === 0) {
      toast("No subjects selected", {
        description: "Please select at least one subject to continue."
      });
      return;
    }
    
    onComplete(selectedSubjects);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading subjects for {board} Class {className}...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Compulsory Subjects</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {compulsorySubjects.map(subject => (
              <div key={subject} className="flex items-center space-x-2 border p-3 rounded-md bg-muted/30">
                <Checkbox id={`subject-${subject}`} checked readOnly />
                <Label htmlFor={`subject-${subject}`} className="font-medium">{subject}</Label>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">These subjects are required based on your curriculum</p>
        </div>

        {optionalSubjects.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-2">Optional Subjects</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {optionalSubjects.map(subject => (
                <div 
                  key={subject} 
                  className={`flex items-center space-x-2 border p-3 rounded-md ${
                    selectedOptionalSubjects.includes(subject) ? 'bg-primary/10 border-primary/30' : 'bg-background'
                  } cursor-pointer transition-colors`}
                  onClick={() => handleOptionalSubjectToggle(subject)}
                >
                  <Checkbox 
                    id={`subject-${subject}`} 
                    checked={selectedOptionalSubjects.includes(subject)}
                    // Remove the onCheckedChange to prevent duplicate state changes
                  />
                  <Label 
                    htmlFor={`subject-${subject}`} 
                    className="cursor-pointer font-medium"
                  >
                    {subject}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Select any additional subjects you want to study</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Continue with {compulsorySubjects.length + selectedOptionalSubjects.length} Subjects
        </Button>
      </div>
    </form>
  );
};

export default SubjectSelectionForm;
