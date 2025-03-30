
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
  onComplete: (school: { state: string; city: string; school: string }) => void;
}

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({ 
  userName = "Student", 
  level = 1, 
  xp = 0,
  onComplete 
}) => {
  const [board, setBoard] = useState<string>("");
  const [className, setClassName] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [stream, setStream] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [school, setSchool] = useState<string>("");
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

  const handleStateChange = (value: string) => {
    setState(value);
    // Reset city and school when state changes
    setCity("");
    setSchool("");
  };

  const handleCityChange = (value: string) => {
    setCity(value);
    // Reset school when city changes
    setSchool("");
  };

  const handleSchoolChange = (value: string) => {
    setSchool(value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form inputs
    if (!state || !city || !school) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Call the onComplete callback with the selected school data
    onComplete({
      state,
      city,
      school
    });
  };

  // States data
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", 
    "Chandigarh"
  ];

  // Function to get cities based on state
  const getCitiesForState = (state: string) => {
    // This is a simplified example. In a real app, you would fetch this from an API
    const citiesMap: Record<string, string[]> = {
      "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
      "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut"],
      // Add more states and cities as needed
    };

    return citiesMap[state] || ["City 1", "City 2", "City 3"]; // Default cities if state is not in the map
  };

  // Function to get schools based on city
  const getSchoolsForCity = (city: string) => {
    // This is a simplified example. In a real app, you would fetch this from an API
    const schoolsMap: Record<string, string[]> = {
      "Mumbai": ["St. Xavier's School", "Don Bosco High School", "R.N. Podar School", "Bombay Scottish School"],
      "New Delhi": ["Delhi Public School", "Modern School", "Springdales School", "Sanskriti School"],
      "Bengaluru": ["Bishop Cotton Boys' School", "National Public School", "The Valley School", "Inventure Academy"],
      "Chennai": ["Don Bosco Matriculation School", "DAV Boys School", "Chettinad Vidyashram", "P.S. Senior Secondary School"],
      // Add more cities and schools as needed
    };

    return schoolsMap[city] || ["School 1", "School 2", "School 3"]; // Default schools if city is not in the map
  };

  const navigationItems = [
    { name: "Back to Dashboard", href: "/", icon: <ChevronLeft className="h-4 w-4" /> },
  ];

  // Get relevant cities and schools based on selections
  const cities = state ? getCitiesForState(state) : [];
  const schools = city ? getSchoolsForCity(city) : [];

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <Select value={state} onValueChange={handleStateChange} disabled={loading}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((stateName) => (
                  <SelectItem key={stateName} value={stateName}>{stateName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="city">City</Label>
            <Select value={city} onValueChange={handleCityChange} disabled={loading || !state}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((cityName) => (
                  <SelectItem key={cityName} value={cityName}>{cityName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="school">School</Label>
            <Select value={school} onValueChange={handleSchoolChange} disabled={loading || !city}>
              <SelectTrigger id="school">
                <SelectValue placeholder="Select School" />
              </SelectTrigger>
              <SelectContent>
                {schools.map((schoolName) => (
                  <SelectItem key={schoolName} value={schoolName}>{schoolName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" disabled={loading || !state || !city || !school}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SchoolSelectionForm;
