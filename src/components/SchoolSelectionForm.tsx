
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronRight, Search } from "lucide-react";

interface SchoolSelectionFormProps {
  onComplete: (data: {
    name: string;
    board: string;
    class: string;
    school: string;
    city: string;
    state: string;
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

const STATE_OPTIONS = [
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Gujarat",
  "West Bengal"
];

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({
  onComplete
}) => {
  const [name, setName] = useState("");
  const [board, setBoard] = useState("");
  const [classValue, setClassValue] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [school, setSchool] = useState("");
  const [schoolOptions, setSchoolOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [otherSchool, setOtherSchool] = useState("");
  const [showOtherSchool, setShowOtherSchool] = useState(false);

  // Enhanced school search function
  useEffect(() => {
    if (city.trim().length > 2) {
      setLoading(true);
      
      // Simulate API call with a timeout
      setTimeout(() => {
        // Generate more realistic school names based on city and state
        const generateSchoolNames = (cityName: string, stateName: string): string[] => {
          const prefixes = [
            "St.", "Delhi", "Modern", "International", "Central", "City", 
            "Public", "Holy", "Sacred Heart", "National", "Global", "Heritage", 
            "Spring", "Green Valley", "Excellence", "Grammar", "Millennium", 
            "Academy of", "Scholars"
          ];
          
          const suffixes = [
            "Public School", "International School", "Academy", "School", 
            "Convent School", "High School", "Higher Secondary School", 
            "Senior Secondary School", "Grammar School", "Model School", 
            "School of Excellence", "Educational Institute", "Education Centre"
          ];
          
          const specialSchools = [
            `${cityName} Public School`,
            `${stateName} Model School, ${cityName}`,
            `Delhi Public School, ${cityName}`,
            `St. Xavier's School, ${cityName}`,
            `Modern School, ${cityName}`,
            `The ${cityName} International School`,
            `Central Academy, ${cityName}`,
            `Kendriya Vidyalaya, ${cityName}`,
            `DAV Public School, ${cityName}`,
            `Bal Bharati Public School, ${cityName}`,
            `Ryan International School, ${cityName}`,
            `Amity International School, ${cityName}`,
            `Cambridge School, ${cityName}`,
            `Tagore International School, ${cityName}`,
            `Springdales School, ${cityName}`
          ];
          
          // Generate random combinations
          const randomSchools = [...Array(10)].map(() => {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            return `${prefix} ${suffix}, ${cityName}`;
          });
          
          // Combine and remove duplicates
          return [...new Set([...specialSchools, ...randomSchools])];
        };
        
        const mockSchools = generateSchoolNames(city, state || "");
        
        setSchoolOptions(mockSchools);
        setLoading(false);
        
        toast(`Found ${mockSchools.length} schools in ${city}`);
      }, 800);
    } else {
      setSchoolOptions([]);
    }
  }, [city, state]);

  const handleContinue = () => {
    if (!name || !board || !classValue || !city || !state) {
      toast("All fields are required. Please fill in all the fields to continue.");
      return;
    }
    
    // Use either selected school or the manually entered one
    const finalSchool = showOtherSchool ? otherSchool : school;
    
    if (!finalSchool) {
      toast("Please select a school or enter your school name");
      return;
    }

    onComplete({
      name,
      board,
      class: classValue,
      school: finalSchool,
      city,
      state
    });
  };

  const handleSchoolChange = (value: string) => {
    if (value === "other") {
      setShowOtherSchool(true);
      setSchool("other");
    } else {
      setShowOtherSchool(false);
      setSchool(value);
    }
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
          <Label htmlFor="state">Which state do you live in?</Label>
          <Select value={state} onValueChange={setState}>
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {STATE_OPTIONS.map((stateName) => (
                <SelectItem key={stateName} value={stateName}>
                  {stateName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Which city do you live in?</Label>
          <div className="flex space-x-2">
            <Input 
              id="city" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              placeholder="Enter your city" 
              className="flex-1"
            />
            {city.length > 0 && !loading && schoolOptions.length === 0 && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  if (city.length > 2) {
                    setLoading(true);
                    // Trigger search effect
                    setCity(city + " ");
                    setTimeout(() => setCity(city), 10);
                  }
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>
          {city.length > 0 && city.length < 3 && (
            <p className="text-xs text-muted-foreground">Type at least 3 characters to search for schools</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="school">Which school do you go to?</Label>
          <Select 
            value={school} 
            onValueChange={handleSchoolChange}
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
          
          {showOtherSchool && (
            <div className="mt-2">
              <Input 
                value={otherSchool} 
                onChange={(e) => setOtherSchool(e.target.value)} 
                placeholder="Enter your school name" 
                className="mt-2" 
              />
            </div>
          )}
          
          {loading && (
            <div className="flex items-center justify-center py-2">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary"></div>
              <span className="ml-2 text-xs text-muted-foreground">Searching for schools in {city}...</span>
            </div>
          )}
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
