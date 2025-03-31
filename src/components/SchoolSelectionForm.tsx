
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ChevronRight } from "lucide-react";

interface SchoolSelectionFormProps {
  onComplete: (data: {
    name: string;
    board: string;
    class: string;
    school: string;
    city: string;
  }) => void;
}

const BOARD_TYPES = [
  { value: "CBSE", label: "CBSE" },
  { value: "ICSE", label: "ICSE" },
  { value: "State Board", label: "State Board" },
  { value: "International", label: "International" }
];

const CLASS_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Class ${i + 1}`
}));

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({
  onComplete
}) => {
  const [name, setName] = useState("");
  const [board, setBoard] = useState("");
  const [classValue, setClassValue] = useState("");
  const [city, setCity] = useState("");
  const [school, setSchool] = useState("");
  const [schoolOptions, setSchoolOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // This useEffect is updated to create mock school options instead of using a non-existent API
  useEffect(() => {
    if (city.trim().length > 0) {
      setLoading(true);
      
      // Simulate API call with a timeout
      setTimeout(() => {
        // Generate mock school names based on city
        const mockSchools = [
          `${city} Public School`,
          `${city} International School`,
          `St. Xavier's School, ${city}`,
          `Delhi Public School, ${city}`,
          `Modern School, ${city}`
        ];
        
        setSchoolOptions(mockSchools);
        setLoading(false);
      }, 500);
    }
  }, [city]);

  const handleContinue = () => {
    if (!name || !board || !classValue || !city || !school) {
      toast({
        title: "All fields are required",
        description: "Please fill in all the fields to continue.",
        variant: "destructive",
      });
      return;
    }

    onComplete({
      name,
      board,
      class: classValue,
      school,
      city
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Let's set up your profile</CardTitle>
        <CardDescription>Tell us about yourself to customize your learning experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">What's your name?</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="board">Which board are you studying under?</Label>
          <Select value={board} onValueChange={setBoard}>
            <SelectTrigger id="board">
              <SelectValue placeholder="Select board" />
            </SelectTrigger>
            <SelectContent>
              {BOARD_TYPES.map((boardType) => (
                <SelectItem key={boardType.value} value={boardType.value}>
                  {boardType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class">Which class are you in?</Label>
          <Select value={classValue} onValueChange={setClassValue}>
            <SelectTrigger id="class">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Which city do you live in?</Label>
          <Input 
            id="city" 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            placeholder="Enter your city" 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">Which school do you go to?</Label>
          <Select 
            value={school} 
            onValueChange={setSchool} 
            disabled={schoolOptions.length === 0 || loading}
          >
            <SelectTrigger id="school">
              <SelectValue placeholder={loading ? "Loading schools..." : "Select school"} />
            </SelectTrigger>
            <SelectContent>
              {schoolOptions.map((schoolName) => (
                <SelectItem key={schoolName} value={schoolName}>
                  {schoolName}
                </SelectItem>
              ))}
              <SelectItem value="other">Other (not listed)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleContinue}>
          Continue
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SchoolSelectionForm;
