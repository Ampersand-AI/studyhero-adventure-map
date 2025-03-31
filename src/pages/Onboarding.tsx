
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StudyHeroHeader from '@/components/StudyHeroHeader';
import OnboardingCard from '@/components/OnboardingCard';
import SchoolSelectionForm from '@/components/SchoolSelectionForm';
import SubjectSelectionForm from '@/components/SubjectSelectionForm';
import StudyPlanProgress from '@/components/StudyPlanProgress';
import { BookOpen, ChevronRight, GraduationCap, School, Home, BookOpenCheck } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [board, setBoard] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [schoolInfo, setSchoolInfo] = useState<{
    state: string;
    city: string;
    school: string;
  } | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [studyPlanGenerated, setStudyPlanGenerated] = useState(false);
  
  const handleBoardSelect = (selectedBoard: string) => {
    setBoard(selectedBoard);
    localStorage.setItem('selectedBoard', selectedBoard);
    
    toast.success("Board Selected", {
      description: `You've selected the ${selectedBoard} curriculum.`,
    });
    
    setStep(2);
  };
  
  const handleClassSelect = (selectedClass: string) => {
    setClassName(selectedClass);
    localStorage.setItem('selectedClass', selectedClass);
    
    toast.success("Class Selected", {
      description: `You've selected Class ${selectedClass}.`,
    });
    
    setStep(3);
  };
  
  const handleSchoolSelection = (school: {
    state: string;
    city: string;
    school: string;
  }) => {
    setSchoolInfo(school);
    localStorage.setItem('selectedSchool', JSON.stringify(school));
    
    // Move to subject selection
    setStep(4);
  };
  
  const handleSubjectSelection = (subjects: string[]) => {
    setSelectedSubjects(subjects);
    localStorage.setItem('selectedSubjects', JSON.stringify(subjects));
    
    // Move to study plan generation
    setStep(5);
  };
  
  const handleStudyPlanComplete = () => {
    setStudyPlanGenerated(true);
    // Move to final step
    setStep(6);
  };
  
  const handleGetStarted = () => {
    // Initialize XP and level
    localStorage.setItem('currentXp', '0');
    localStorage.setItem('currentLevel', '1');
    
    // Initialize profile with selected data
    const studyHeroProfile = {
      subjects: selectedSubjects,
      board,
      class: className,
      school: schoolInfo?.school,
      city: schoolInfo?.city,
      state: schoolInfo?.state
    };
    
    // Save the profile to localStorage
    localStorage.setItem('studyHeroProfile', JSON.stringify(studyHeroProfile));
    
    navigate('/dashboard');
  };
  
  // Define navigation items for the header
  const navigationItems = [
    { name: "Home", href: "/", icon: <Home className="h-4 w-4" /> }
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <StudyHeroHeader 
        userName="New Student"
        level={1}
        xp={0}
        navigation={[]}
      />
      
      <main className="flex-1 container py-10 mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                1
              </div>
              <div className={`h-1 w-12 ${step > 1 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <div className={`h-1 w-12 ${step > 2 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                3
              </div>
              <div className={`h-1 w-12 ${step > 3 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                4
              </div>
              <div className={`h-1 w-12 ${step > 4 ? 'bg-primary' : 'bg-muted'}`}></div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 5 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                5
              </div>
            </div>
          </div>
          
          {step === 1 && (
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Select Your Educational Board</CardTitle>
                <CardDescription className="text-center">Choose the curriculum that your school follows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="cursor-pointer">
                    <OnboardingCard
                      title="CBSE"
                      description="Central Board of Secondary Education"
                      icon={<BookOpen className="h-8 w-8" />}
                      onClick={() => handleBoardSelect('CBSE')}
                    />
                  </div>
                  <div className="cursor-pointer">
                    <OnboardingCard
                      title="ICSE"
                      description="Indian Certificate of Secondary Education"
                      icon={<BookOpen className="h-8 w-8" />}
                      onClick={() => handleBoardSelect('ICSE')}
                    />
                  </div>
                  <div className="cursor-pointer">
                    <OnboardingCard
                      title="State Board"
                      description="State Education Board Curriculum"
                      icon={<BookOpen className="h-8 w-8" />}
                      onClick={() => handleBoardSelect('State Board')}
                    />
                  </div>
                  <div className="cursor-pointer">
                    <OnboardingCard
                      title="International"
                      description="IB, Cambridge & Other International Curricula"
                      icon={<BookOpen className="h-8 w-8" />}
                      onClick={() => handleBoardSelect('International')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {step === 2 && (
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Select Your Class</CardTitle>
                <CardDescription className="text-center">Choose your current class level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {[6, 7, 8, 9, 10, 11, 12].map(classNum => (
                    <div key={classNum} className="cursor-pointer">
                      <OnboardingCard
                        key={classNum}
                        title={`Class ${classNum}`}
                        description={`${board} Curriculum`}
                        icon={<GraduationCap className="h-8 w-8" />}
                        onClick={() => handleClassSelect(classNum.toString())}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-start">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Board Selection
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 3 && (
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Select Your School</CardTitle>
                <CardDescription className="text-center">Help us find your school for personalized learning</CardDescription>
              </CardHeader>
              <CardContent>
                <SchoolSelectionForm 
                  userName="New Student"
                  level={1}
                  xp={0}
                  board={board}
                  onComplete={handleSchoolSelection} 
                />
              </CardContent>
              <CardFooter className="flex justify-start">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back to Class Selection
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 4 && (
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Select Your Subjects</CardTitle>
                <CardDescription className="text-center">Choose the subjects you want to study</CardDescription>
              </CardHeader>
              <CardContent>
                <SubjectSelectionForm 
                  board={board}
                  className={className}
                  onComplete={handleSubjectSelection}
                />
              </CardContent>
              <CardFooter className="flex justify-start">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back to School Selection
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {step === 5 && (
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Creating Your Study Plans</CardTitle>
                <CardDescription className="text-center">Our AI is generating personalized learning content</CardDescription>
              </CardHeader>
              <CardContent>
                <StudyPlanProgress 
                  subjects={selectedSubjects}
                  board={board}
                  className={className}
                  onComplete={handleStudyPlanComplete}
                />
              </CardContent>
            </Card>
          )}
          
          {step === 6 && (
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Ready to Start Learning!</CardTitle>
                <CardDescription className="text-center">Your personalized learning plan is ready</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Curriculum</p>
                      <p className="text-muted-foreground">{board}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Class</p>
                      <p className="text-muted-foreground">Class {className}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <School className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">School</p>
                      <p className="text-muted-foreground">{schoolInfo?.school}</p>
                      <p className="text-sm text-muted-foreground">{schoolInfo?.city}, {schoolInfo?.state}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <BookOpenCheck className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-medium">Subjects</p>
                      <p className="text-muted-foreground">{selectedSubjects.join(', ')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="font-medium">What's next?</h3>
                  <p className="text-muted-foreground">
                    We've prepared personalized learning materials following the {board} curriculum
                    for Class {className}. Daily lessons include fundamentals, examples, and visual aids.
                    Weekly quizzes will help track your progress.
                  </p>
                </div>
                
                <Button onClick={handleGetStarted} className="w-full" size="lg">
                  Get Started with Your Learning Journey
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
              <CardFooter className="flex justify-start">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back to Subject Selection
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
