
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calculator, 
  FlaskRound, 
  Atom, 
  GraduationCap, 
  ChartLine
} from "lucide-react";

interface SubjectCardGridProps {
  subjects: string[];
  onSelectSubject: (subject: string) => void;
}

const SubjectCardGrid: React.FC<SubjectCardGridProps> = ({ subjects, onSelectSubject }) => {
  // Function to get an appropriate icon for each subject
  const getSubjectIcon = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    
    if (subjectLower.includes('math')) {
      return <Calculator className="h-10 w-10 text-green-600" />;
    } else if (subjectLower.includes('science') || subjectLower.includes('physics')) {
      return <Atom className="h-10 w-10 text-blue-600" />;
    } else if (subjectLower.includes('chemistry')) {
      return <FlaskRound className="h-10 w-10 text-purple-600" />;
    } else if (subjectLower.includes('english') || subjectLower.includes('literature')) {
      return <BookOpen className="h-10 w-10 text-yellow-600" />;
    } else if (subjectLower.includes('economics') || subjectLower.includes('geography')) {
      return <ChartLine className="h-10 w-10 text-red-600" />;
    } else {
      return <GraduationCap className="h-10 w-10 text-indigo-600" />;
    }
  };
  
  // Function to get a background color class based on subject
  const getSubjectBackground = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    
    if (subjectLower.includes('math')) {
      return "bg-green-50";
    } else if (subjectLower.includes('science') || subjectLower.includes('physics')) {
      return "bg-blue-50";
    } else if (subjectLower.includes('chemistry')) {
      return "bg-purple-50";
    } else if (subjectLower.includes('english') || subjectLower.includes('literature')) {
      return "bg-yellow-50";
    } else if (subjectLower.includes('economics') || subjectLower.includes('geography')) {
      return "bg-red-50";
    } else {
      return "bg-indigo-50";
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subjects.map((subject) => (
        <Card 
          key={subject} 
          className={`overflow-hidden transition-all hover:shadow-md cursor-pointer ${getSubjectBackground(subject)}`}
          onClick={() => onSelectSubject(subject)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>{subject}</CardTitle>
              {getSubjectIcon(subject)}
            </div>
            <CardDescription>
              NCERT curriculum-aligned lessons
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm">
              {subject === 'Mathematics' && 'Master mathematical concepts from algebra to calculus.'}
              {subject === 'Science' && 'Explore the fundamentals of scientific principles and methods.'}
              {subject === 'English' && 'Develop language skills through grammar, literature, and writing.'}
              {subject === 'Social Studies' && 'Learn about human societies, history, and geographical concepts.'}
              {subject === 'Physics' && 'Understand the laws that govern the physical world.'}
              {subject === 'Chemistry' && 'Study matter, its properties, and transformations.'}
              {subject === 'Biology' && 'Explore living organisms and their vital processes.'}
              {subject === 'Computer Science' && 'Learn programming, algorithms, and computational thinking.'}
              {!['Mathematics', 'Science', 'English', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science'].includes(subject) && 
                'Comprehensive curriculum with structured lessons and practice.'}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full mt-2">
              View Curriculum
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SubjectCardGrid;
