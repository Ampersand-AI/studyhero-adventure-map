
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export interface SubjectCardGridProps {
  subjects: string[];
  onSelectSubject?: (subject: string) => void;
}

const SubjectCardGrid = ({ subjects, onSelectSubject }: SubjectCardGridProps) => {
  const navigate = useNavigate();

  const handleSelectSubject = (subject: string) => {
    if (onSelectSubject) {
      onSelectSubject(subject);
    } else {
      navigate(`/subject/${subject}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject, index) => (
        <Card key={index} className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="bg-primary/5 pb-2">
            <CardTitle className="flex items-center text-lg">
              <BookOpen className="h-5 w-5 mr-2" />
              {subject}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-2">
            <p className="text-sm text-muted-foreground">
              Explore {subject} topics and lessons
            </p>
          </CardContent>
          <CardFooter className="px-4 py-3 bg-background flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary"
              onClick={() => handleSelectSubject(subject)}
            >
              Explore <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SubjectCardGrid;
