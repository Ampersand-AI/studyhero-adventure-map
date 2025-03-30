import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateStudyPlan } from '@/services/openaiService';
import { Progress } from "@/components/ui/progress";
import StudyAIHeader from '@/components/StudyAIHeader';
import { ChevronLeft } from "lucide-react";

interface StudyItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  status: "current" | "future";
  dueDate: string;
  estimatedTimeInMinutes: number;
  subject: string;
  content: string;
  textbookReference: string;
  hasVisualAids: boolean;
}

interface SchoolSelectionFormProps {
  userName: string;
  level: number;
  xp: number;
}

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({ userName, level, xp }) => {
  const [board, setBoard] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [stream, setStream] = useState<string>("");
  const [studyPlan, setStudyPlan] = useState<{ items: StudyItem[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState<string>("Initializing");

  useEffect(() => {
    // Load values from localStorage if available
    const storedBoard = localStorage.getItem('selectedBoard');
    const storedClassName = localStorage.getItem('selectedClassName');
    const storedSubject = localStorage.getItem('selectedSubject');
    const storedStream = localStorage.getItem('selectedStream');

    if (storedBoard) setBoard(storedBoard);
    if (storedClassName) setClassName(storedClassName);
    if (storedSubject) setSubject(storedSubject);
    if (storedStream) setStream(storedStream);
  }, []);

  const handleBoardChange = (value: string) => {
    setBoard(value);
    localStorage.setItem('selectedBoard', value);
  };

  const handleClassNameChange = (value: string) => {
    setClassName(value);
    localStorage.setItem('selectedClassName', value);
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    localStorage.setItem('selectedSubject', value);
  };

  const handleStreamChange = (value: string) => {
    setStream(value);
    localStorage.setItem('selectedStream', value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form inputs
    if (!board || !className || !subject) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Clear any previous errors
    setError(null);
    setLoading(true);
    setProgress(0);
    setGenerationStage("Initializing");

    try {
      // Show initial toast
      toast({
        title: "Generating Study Plan",
        description: "Creating a personalized study plan based on your selections...",
      });

      // Update generation stage
      setGenerationStage("Connecting to AI");
      setProgress(10);

      // Call OpenAI to generate study plan
      const generatedStudyPlan = await generateStudyPlan(board, className, subject);

      if (!generatedStudyPlan || !generatedStudyPlan.items) {
        throw new Error("Failed to generate study plan");
      }

      // Update generation stage
      setGenerationStage("Processing Study Plan");
      setProgress(75);

      // Set the generated study plan
      setStudyPlan(generatedStudyPlan);

      // Store study plan in localStorage
      localStorage.setItem('studyPlan', JSON.stringify(generatedStudyPlan));

      // Update generation stage
      setGenerationStage("Finalizing");
      setProgress(90);

      // Navigate to the study plan page
      navigate('/study-plan');

      // Show success toast
      toast.success("Study plan generated successfully!");
    } catch (e: any) {
      console.error("Error generating study plan:", e);
      setError(e.message || "Failed to generate study plan. Please try again.");
      toast({
        title: "Error",
        description: "Failed to generate study plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setProgress(100);
      setGenerationStage("Completed");
    }
  };

  const navigationItems = [
    { name: "Back to Dashboard", href: "/", icon: <ChevronLeft className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader
        userName={userName}
        level={level}
        xp={xp}
        navigation={navigationItems}
      />

      <main className="flex-1 container py-6 md:py-12">
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Personalize Your Study Plan</CardTitle>
            <CardDescription>
              Select your board, class, and subject to generate a personalized study plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="board">Board</Label>
                  <Select value={board} onValueChange={handleBoardChange} disabled={loading}>
                    <SelectTrigger id="board">
                      <SelectValue placeholder="Select Board" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CBSE">CBSE</SelectItem>
                      <SelectItem value="ICSE">ICSE</SelectItem>
                      <SelectItem value="State Board">State Board</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={className} onValueChange={handleClassNameChange} disabled={loading}>
                    <SelectTrigger id="class">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Class 1</SelectItem>
                      <SelectItem value="2">Class 2</SelectItem>
                      <SelectItem value="3">Class 3</SelectItem>
                      <SelectItem value="4">Class 4</SelectItem>
                      <SelectItem value="5">Class 5</SelectItem>
                      <SelectItem value="6">Class 6</SelectItem>
                      <SelectItem value="7">Class 7</SelectItem>
                      <SelectItem value="8">Class 8</SelectItem>
                      <SelectItem value="9">Class 9</SelectItem>
                      <SelectItem value="10">Class 10</SelectItem>
                      <SelectItem value="11">Class 11</SelectItem>
                      <SelectItem value="12">Class 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={handleSubjectChange} disabled={loading}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Social Science">Social Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Hindi">Hindi</SelectItem>
                      {className === "11" || className === "12" ? (
                        <>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="Economics">Economics</SelectItem>
                          <SelectItem value="Accountancy">Accountancy</SelectItem>
                          <SelectItem value="Business Studies">Business Studies</SelectItem>
                          {/* Add stream selection based on subject */}
                          {subject === "Physics" || subject === "Chemistry" || subject === "Biology" ? (
                            <div>
                              <Label htmlFor="stream">Stream</Label>
                              <Select value={stream} onValueChange={handleStreamChange} disabled={loading}>
                                <SelectTrigger id="stream">
                                  <SelectValue placeholder="Select Stream" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="science">Science</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : null}
                          {subject === "Economics" || subject === "Accountancy" || subject === "Business Studies" ? (
                            <div>
                              <Label htmlFor="stream">Stream</Label>
                              <Select value={stream} onValueChange={handleStreamChange} disabled={loading}>
                                <SelectTrigger id="stream">
                                  <SelectValue placeholder="Select Stream" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="commerce">Commerce</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
                {className === "11" || className === "12" ? (
                  <div>
                    {/* Conditionally render stream selection for Arts */}
                    {subject === "History" || subject === "Political Science" || subject === "Geography" ? (
                      <div>
                        <Label htmlFor="stream">Stream</Label>
                        <Select value={stream} onValueChange={handleStreamChange} disabled={loading}>
                          <SelectTrigger id="stream">
                            <SelectValue placeholder="Select Stream" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="arts">Arts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                    {/* Conditionally render stream selection for Languages */}
                    {subject === "English" || subject === "Hindi" || subject === "Sanskrit" ? (
                      <div>
                        <Label htmlFor="stream">Stream</Label>
                        <Select value={stream} onValueChange={handleStreamChange} disabled={loading}>
                          <SelectTrigger id="stream">
                            <SelectValue placeholder="Select Stream" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="languages">Languages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <Button type="submit" disabled={loading}>
                  {loading ? "Generating..." : "Generate Study Plan"}
                </Button>
              </div>
            </form>
            {loading && (
              <div className="w-full">
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-medium">Generating Study Plan</span>
                  <span className="text-sm text-muted-foreground">{generationStage} ({progress}%)</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
            {error && (
              <p className="text-red-500 mt-4">Error: {error}</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SchoolSelectionForm;
