
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Calculator, 
  FlaskRound, 
  Atom, 
  GraduationCap, 
  ChartLine,
  Globe,
  Code,
  Dna,
  BookOpenText,
  History,
  FileSpreadsheet
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
    } else if (subjectLower.includes('physics')) {
      return <Atom className="h-10 w-10 text-blue-600" />;
    } else if (subjectLower.includes('chemistry')) {
      return <FlaskRound className="h-10 w-10 text-purple-600" />;
    } else if (subjectLower.includes('english') || subjectLower.includes('literature')) {
      return <BookOpen className="h-10 w-10 text-yellow-600" />;
    } else if (subjectLower.includes('economics')) {
      return <ChartLine className="h-10 w-10 text-red-600" />;
    } else if (subjectLower.includes('geography')) {
      return <Globe className="h-10 w-10 text-blue-500" />;
    } else if (subjectLower.includes('computer')) {
      return <Code className="h-10 w-10 text-indigo-500" />;
    } else if (subjectLower.includes('biology')) {
      return <Dna className="h-10 w-10 text-green-500" />;
    } else if (subjectLower.includes('social')) {
      return <History className="h-10 w-10 text-amber-600" />;
    } else if (subjectLower.includes('language')) {
      return <BookOpenText className="h-10 w-10 text-pink-500" />;
    } else if (subjectLower.includes('science') && !subjectLower.includes('computer')) {
      return <FlaskRound className="h-10 w-10 text-teal-600" />;
    } else if (subjectLower.includes('account') || subjectLower.includes('business')) {
      return <FileSpreadsheet className="h-10 w-10 text-cyan-600" />;
    } else {
      return <GraduationCap className="h-10 w-10 text-indigo-600" />;
    }
  };
  
  // Function to get a background color class based on subject
  const getSubjectBackground = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    
    if (subjectLower.includes('math')) {
      return "bg-green-50 hover:bg-green-100";
    } else if (subjectLower.includes('physics')) {
      return "bg-blue-50 hover:bg-blue-100";
    } else if (subjectLower.includes('chemistry')) {
      return "bg-purple-50 hover:bg-purple-100";
    } else if (subjectLower.includes('english') || subjectLower.includes('literature')) {
      return "bg-yellow-50 hover:bg-yellow-100";
    } else if (subjectLower.includes('economics')) {
      return "bg-red-50 hover:bg-red-100";
    } else if (subjectLower.includes('geography')) {
      return "bg-blue-50 hover:bg-blue-100";
    } else if (subjectLower.includes('computer')) {
      return "bg-indigo-50 hover:bg-indigo-100";
    } else if (subjectLower.includes('biology')) {
      return "bg-green-50 hover:bg-green-100";
    } else if (subjectLower.includes('social')) {
      return "bg-amber-50 hover:bg-amber-100";
    } else if (subjectLower.includes('language')) {
      return "bg-pink-50 hover:bg-pink-100";
    } else if (subjectLower.includes('science') && !subjectLower.includes('computer')) {
      return "bg-teal-50 hover:bg-teal-100";
    } else if (subjectLower.includes('account') || subjectLower.includes('business')) {
      return "bg-cyan-50 hover:bg-cyan-100";
    } else {
      return "bg-indigo-50 hover:bg-indigo-100";
    }
  };
  
  // Function to get a description of the subject
  const getSubjectDescription = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    
    if (subjectLower.includes('math')) {
      return 'Master mathematical concepts from algebra to calculus.';
    } else if (subjectLower.includes('physics')) {
      return 'Understand the laws that govern the physical world.';
    } else if (subjectLower.includes('chemistry')) {
      return 'Study matter, its properties, and transformations.';
    } else if (subjectLower.includes('english')) {
      return 'Develop language skills through grammar, literature, and writing.';
    } else if (subjectLower.includes('economics')) {
      return 'Learn about markets, resources, and economic systems.';
    } else if (subjectLower.includes('geography')) {
      return "Explore Earth's landscapes, environments, and human interactions.";
    } else if (subjectLower.includes('computer')) {
      return 'Learn programming, algorithms, and computational thinking.';
    } else if (subjectLower.includes('biology')) {
      return 'Explore living organisms and their vital processes.';
    } else if (subjectLower.includes('social')) {
      return 'Learn about human societies, history, and geographical concepts.';
    } else if (subjectLower.includes('science') && !subjectLower.includes('computer')) {
      return 'Explore the fundamentals of scientific principles and methods.';
    } else {
      return 'Comprehensive curriculum with structured lessons and practice.';
    }
  };

  // Function to get textbook URL based on subject
  const getTextbookUrl = (subject: string) => {
    const subjectLower = subject.toLowerCase();
    const baseUrl = "https://ncert.nic.in/textbook.php";
    
    if (subjectLower.includes('math')) {
      return `${baseUrl}?lemh1=0-10`;
    } else if (subjectLower.includes('physics')) {
      return `${baseUrl}?leph1=0-8`;
    } else if (subjectLower.includes('chemistry')) {
      return `${baseUrl}?lech1=0-14`;
    } else if (subjectLower.includes('english')) {
      return `${baseUrl}?lefl1=0-11`;
    } else if (subjectLower.includes('economics')) {
      return `${baseUrl}?leec1=0-10`;
    } else if (subjectLower.includes('geography')) {
      return `${baseUrl}?legy1=0-7`;
    } else if (subjectLower.includes('computer')) {
      return `${baseUrl}?lecs1=0-10`;
    } else if (subjectLower.includes('biology')) {
      return `${baseUrl}?lebo1=0-16`;
    } else if (subjectLower.includes('social')) {
      return `${baseUrl}?less1=0-9`;
    } else if (subjectLower.includes('science') && !subjectLower.includes('computer')) {
      return `${baseUrl}?lesc1=0-18`;
    } else {
      return baseUrl;
    }
  };
  
  const handleViewTextbook = (e: React.MouseEvent<HTMLButtonElement>, subject: string) => {
    e.stopPropagation(); // Prevent card click from triggering
    window.open(getTextbookUrl(subject), '_blank');
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects.map((subject) => (
        <Card 
          key={subject} 
          className={`overflow-hidden transition-all hover:shadow-md cursor-pointer h-full ${getSubjectBackground(subject)}`}
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
              {getSubjectDescription(subject)}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={(e) => handleViewTextbook(e, subject)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              View NCERT Textbook
            </Button>
            <Button 
              variant="default" 
              className="w-full"
              onClick={() => onSelectSubject(subject)}
            >
              Start Learning
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SubjectCardGrid;
