
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress"; 
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

// Props interface for SchoolSelectionForm
interface SchoolSelectionFormProps {
  board?: string;
  onComplete: (school: { state: string; city: string; school: string; }) => void;
}

// City data with real schools
interface City {
  id: string;
  name: string;
  schools: School[];
}

interface School {
  id: string;
  name: string;
  board: string;
}

// Expanded list of Indian cities with schools
const cities: City[] = [
  {
    id: "delhi",
    name: "Delhi",
    schools: [
      { id: "dps-rk", name: "Delhi Public School, R.K. Puram", board: "CBSE" },
      { id: "modern-school", name: "Modern School, Barakhamba Road", board: "CBSE" },
      { id: "st-columba", name: "St. Columba's School", board: "CBSE" },
      { id: "vasant-valley", name: "Vasant Valley School", board: "CBSE" },
      { id: "spv", name: "Sanskriti School", board: "CBSE" },
      { id: "mount-st-mary", name: "Mount St. Mary's School", board: "CBSE" },
      { id: "mother-int", name: "Mother's International School", board: "CBSE" },
      { id: "springdales", name: "Springdales School, Pusa Road", board: "CBSE" },
      { id: "amity-saket", name: "Amity International School, Saket", board: "CBSE" },
      { id: "carmel-conv", name: "Carmel Convent School", board: "CBSE" }
    ]
  },
  {
    id: "mumbai",
    name: "Mumbai",
    schools: [
      { id: "cathedral", name: "Cathedral and John Connon School", board: "ICSE" },
      { id: "dhirubhai", name: "Dhirubhai Ambani International School", board: "IB/IGCSE" },
      { id: "jamnabai", name: "Jamnabai Narsee School", board: "ICSE" },
      { id: "bombay-scottish", name: "Bombay Scottish School", board: "ICSE" },
      { id: "rns", name: "R.N. Shah High School", board: "SSC" },
      { id: "ambani", name: "Ambani School", board: "ICSE/IB" },
      { id: "podar", name: "Podar International School", board: "ICSE" },
      { id: "ecole", name: "Ecole Mondiale World School", board: "IB" },
      { id: "bai-avabai", name: "Bai Avabai F. Petit Girls' High School", board: "ICSE" },
      { id: "hiranandani", name: "Hiranandani Foundation School", board: "ICSE" }
    ]
  },
  {
    id: "bangalore",
    name: "Bangalore",
    schools: [
      { id: "bis", name: "Bishop Cotton Boys' School", board: "ICSE" },
      { id: "nps", name: "National Public School, Indiranagar", board: "CBSE" },
      { id: "dps-bangalore", name: "Delhi Public School, Bangalore East", board: "CBSE" },
      { id: "christ-academy", name: "Christ Academy", board: "CBSE" },
      { id: "inventure", name: "Inventure Academy", board: "ICSE/IGCSE" },
      { id: "ryan-inter", name: "Ryan International School", board: "CBSE" },
      { id: "sophia-high", name: "Sophia High School", board: "ICSE" },
      { id: "baldwins", name: "Baldwin Boys' High School", board: "ICSE" },
      { id: "indus", name: "Indus International School", board: "IB/IGCSE" },
      { id: "vibgyor", name: "Vibgyor High School", board: "ICSE" }
    ]
  },
  {
    id: "chennai",
    name: "Chennai",
    schools: [
      { id: "dav", name: "DAV Boys Senior Secondary School", board: "CBSE" },
      { id: "chettinad", name: "Chettinad Vidyashram", board: "CBSE" },
      { id: "psbb", name: "PSBB Senior Secondary School", board: "CBSE" },
      { id: "vidya-mandir", name: "Vidya Mandir Senior Secondary School", board: "CBSE" },
      { id: "cs-academy", name: "CS Academy", board: "CBSE" },
      { id: "chinmaya", name: "Chinmaya Vidyalaya", board: "CBSE" },
      { id: "lady-andal", name: "Lady Andal Venkatasubba Rao School", board: "ICSE" },
      { id: "sir-sivaswami", name: "Sir Sivaswami Kalalaya", board: "State Board" },
      { id: "maharishi", name: "Maharishi Vidya Mandir", board: "CBSE" },
      { id: "avm-rajeswari", name: "AVM Rajeswari Matriculation", board: "State Board" }
    ]
  },
  {
    id: "kolkata",
    name: "Kolkata",
    schools: [
      { id: "la-martiniere", name: "La Martiniere for Boys", board: "ICSE" },
      { id: "modern-high", name: "Modern High School for Girls", board: "ICSE" },
      { id: "don-bosco", name: "Don Bosco School, Park Circus", board: "ICSE" },
      { id: "st-xaviers", name: "St. Xavier's Collegiate School", board: "ICSE" },
      { id: "south-point", name: "South Point High School", board: "CBSE" },
      { id: "birla-high", name: "Birla High School", board: "ICSE" },
      { id: "loreto-house", name: "Loreto House", board: "ICSE" },
      { id: "calcutta-boys", name: "Calcutta Boys' School", board: "ICSE" },
      { id: "apeejay", name: "Apeejay School, Park Street", board: "CBSE" },
      { id: "the-heritage", name: "The Heritage School", board: "ICSE" }
    ]
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    schools: [
      { id: "hyderabad-ps", name: "Hyderabad Public School", board: "ICSE/CBSE" },
      { id: "dps-hyderabad", name: "Delhi Public School", board: "CBSE" },
      { id: "chirec", name: "Chirec International School", board: "CBSE/IGCSE" },
      { id: "oakridge", name: "Oakridge International School", board: "IB/IGCSE" },
      { id: "johnson", name: "Johnson Grammar School", board: "ICSE" },
      { id: "meridian", name: "Meridian School", board: "CBSE" },
      { id: "jubilee-hills", name: "Jubilee Hills Public School", board: "CBSE" },
      { id: "sreenidhi", name: "Sreenidhi International School", board: "IB" },
      { id: "glendale", name: "Glendale Academy", board: "CBSE/IGCSE" },
      { id: "keystone", name: "Keystone School", board: "State Board" }
    ]
  },
  {
    id: "pune",
    name: "Pune",
    schools: [
      { id: "bishops", name: "The Bishop's School", board: "ICSE" },
      { id: "st-marys", name: "St. Mary's School", board: "ICSE" },
      { id: "symbiosis", name: "Symbiosis International School", board: "IB" },
      { id: "delhi-ps-pune", name: "Delhi Public School, Pune", board: "CBSE" },
      { id: "vibgyor-pune", name: "Vibgyor High School", board: "ICSE" },
      { id: "city-international", name: "City International School", board: "CBSE" },
      { id: "indus-pune", name: "Indus International School", board: "IB" },
      { id: "ejs", name: "Epiphany Junior School", board: "ICSE" },
      { id: "jnv", name: "Jawahar Navodaya Vidyalaya", board: "CBSE" },
      { id: "hutchings", name: "Hutchings High School", board: "ICSE" }
    ]
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    schools: [
      { id: "riverside", name: "Riverside School", board: "ICSE" },
      { id: "ahmedabad-int", name: "Ahmedabad International School", board: "IB" },
      { id: "delhi-ps-ahmd", name: "Delhi Public School", board: "CBSE" },
      { id: "anand-niketan", name: "Anand Niketan School", board: "CBSE" },
      { id: "udgam", name: "Udgam School for Children", board: "CBSE" },
      { id: "zydus", name: "Zydus School for Excellence", board: "CBSE" },
      { id: "navrachana", name: "Navrachana School", board: "CBSE" },
      { id: "satyameva", name: "Satyameva Jayate International School", board: "CBSE/IGCSE" },
      { id: "nirma", name: "Nirma Vidyavihar", board: "CBSE" },
      { id: "cosmos", name: "Cosmos Castle International School", board: "ICSE" }
    ]
  }
];

// Subject data with compulsory and optional subjects
interface SubjectGroup {
  id: string;
  name: string;
  subjects: Subject[];
}

interface Subject {
  id: string;
  name: string;
  isCompulsory: boolean;
}

const subjectGroups: SubjectGroup[] = [
  {
    id: "core",
    name: "Core Subjects",
    subjects: [
      { id: "math", name: "Mathematics", isCompulsory: true },
      { id: "english", name: "English", isCompulsory: true },
      { id: "hindi", name: "Hindi", isCompulsory: true },
      { id: "science", name: "Science", isCompulsory: true },
      { id: "social", name: "Social Studies", isCompulsory: true }
    ]
  },
  {
    id: "science",
    name: "Science Stream",
    subjects: [
      { id: "physics", name: "Physics", isCompulsory: false },
      { id: "chemistry", name: "Chemistry", isCompulsory: false },
      { id: "biology", name: "Biology", isCompulsory: false },
      { id: "computer", name: "Computer Science", isCompulsory: false },
      { id: "bio-tech", name: "Biotechnology", isCompulsory: false },
      { id: "electronics", name: "Electronics", isCompulsory: false },
      { id: "env-science", name: "Environmental Science", isCompulsory: false },
      { id: "geology", name: "Geology", isCompulsory: false },
      { id: "psychology", name: "Psychology", isCompulsory: false },
      { id: "mathematics", name: "Advanced Mathematics", isCompulsory: false }
    ]
  },
  {
    id: "commerce",
    name: "Commerce Stream",
    subjects: [
      { id: "accounts", name: "Accountancy", isCompulsory: false },
      { id: "business", name: "Business Studies", isCompulsory: false },
      { id: "economics", name: "Economics", isCompulsory: false },
      { id: "statistics", name: "Statistics", isCompulsory: false },
      { id: "finance", name: "Financial Markets", isCompulsory: false },
      { id: "law", name: "Business Law", isCompulsory: false },
      { id: "management", name: "Management", isCompulsory: false },
      { id: "entrepreneurship", name: "Entrepreneurship", isCompulsory: false },
      { id: "banking", name: "Banking", isCompulsory: false },
      { id: "marketing", name: "Marketing", isCompulsory: false }
    ]
  },
  {
    id: "arts",
    name: "Arts Stream",
    subjects: [
      { id: "history", name: "History", isCompulsory: false },
      { id: "geography", name: "Geography", isCompulsory: false },
      { id: "political", name: "Political Science", isCompulsory: false },
      { id: "psychology", name: "Psychology", isCompulsory: false },
      { id: "sociology", name: "Sociology", isCompulsory: false },
      { id: "philosophy", name: "Philosophy", isCompulsory: false },
      { id: "economics", name: "Economics", isCompulsory: false },
      { id: "literature", name: "Literature", isCompulsory: false },
      { id: "fine-arts", name: "Fine Arts", isCompulsory: false },
      { id: "music", name: "Music", isCompulsory: false },
      { id: "dance", name: "Dance", isCompulsory: false },
      { id: "drama", name: "Drama", isCompulsory: false },
      { id: "journalism", name: "Journalism", isCompulsory: false },
      { id: "anthropology", name: "Anthropology", isCompulsory: false }
    ]
  },
  {
    id: "languages",
    name: "Additional Languages",
    subjects: [
      { id: "sanskrit", name: "Sanskrit", isCompulsory: false },
      { id: "french", name: "French", isCompulsory: false },
      { id: "german", name: "German", isCompulsory: false },
      { id: "spanish", name: "Spanish", isCompulsory: false },
      { id: "japanese", name: "Japanese", isCompulsory: false },
      { id: "chinese", name: "Chinese", isCompulsory: false },
      { id: "bengali", name: "Bengali", isCompulsory: false },
      { id: "tamil", name: "Tamil", isCompulsory: false },
      { id: "telugu", name: "Telugu", isCompulsory: false },
      { id: "kannada", name: "Kannada", isCompulsory: false },
      { id: "malayalam", name: "Malayalam", isCompulsory: false },
      { id: "marathi", name: "Marathi", isCompulsory: false },
      { id: "punjabi", name: "Punjabi", isCompulsory: false },
      { id: "gujarati", name: "Gujarati", isCompulsory: false }
    ]
  }
];

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({ board, onComplete }) => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("10");
  const [selectedStream, setSelectedStream] = useState<string>("science");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchTermSchool, setSearchTermSchool] = useState<string>("");
  const [searchTermSubject, setSearchTermSubject] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({});
  
  // Initialize with compulsory subjects
  React.useEffect(() => {
    const compulsorySubjects = subjectGroups
      .flatMap(group => group.subjects)
      .filter(subject => subject.isCompulsory)
      .map(subject => subject.id);
    
    setSelectedSubjects(compulsorySubjects);
  }, []);
  
  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setSelectedSchool("");
  };
  
  const handleSchoolChange = (value: string) => {
    setSelectedSchool(value);
  };
  
  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };
  
  const handleStreamChange = (value: string) => {
    setSelectedStream(value);
  };
  
  const handleSubjectToggle = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      // Only allow unchecking if not compulsory
      const subject = subjectGroups
        .flatMap(group => group.subjects)
        .find(s => s.id === subjectId);
      
      if (!subject?.isCompulsory) {
        setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
      }
    }
  };

  const toggleExpand = (groupId: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCity || !selectedSchool || !selectedClass) {
      toast.error("Please complete all required fields");
      return;
    }
    
    if (selectedSubjects.length < 5) {
      toast.error("Please select at least 5 subjects");
      return;
    }
    
    // Get selected school info
    const city = cities.find(c => c.id === selectedCity);
    const school = city?.schools.find(s => s.id === selectedSchool);
    
    // Call the onComplete callback with the school info
    onComplete({
      state: "India", // Default state for now
      city: city?.name || selectedCity,
      school: school?.name || selectedSchool
    });
    
    // Save selections to localStorage
    localStorage.setItem('selectedCity', selectedCity);
    localStorage.setItem('selectedSchool', JSON.stringify({
      id: selectedSchool,
      name: school?.name || selectedSchool,
      board: school?.board || board || "CBSE"
    }));
    localStorage.setItem('selectedClass', selectedClass);
    localStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
    
    toast.success("School information saved successfully!");
  };

  // Filter schools based on search term
  const filteredSchools = selectedCity ? 
    cities.find(city => city.id === selectedCity)?.schools.filter(
      school => school.name.toLowerCase().includes(searchTermSchool.toLowerCase())
    ) || [] : [];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>School Information</CardTitle>
        <CardDescription>Please select your school and class to personalize your learning experience</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Select value={selectedCity} onValueChange={handleCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="school">School</Label>
              <div className="space-y-2">
                <input 
                  type="text"
                  placeholder="Search for your school..."
                  className="w-full border rounded-md px-3 py-2"
                  value={searchTermSchool}
                  onChange={(e) => setSearchTermSchool(e.target.value)}
                  disabled={!selectedCity}
                />
                <Select 
                  value={selectedSchool} 
                  onValueChange={handleSchoolChange}
                  disabled={!selectedCity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCity ? "Select your school" : "Select a city first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSchools.map(school => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name} ({school.board})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  {[6, 7, 8, 9, 10, 11, 12].map(classNumber => (
                    <SelectItem key={classNumber} value={classNumber.toString()}>
                      Class {classNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="stream">Academic Stream (for class 11-12)</Label>
              <Select 
                value={selectedStream} 
                onValueChange={handleStreamChange}
                disabled={parseInt(selectedClass) < 11}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select academic stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {parseInt(selectedClass) < 11 
                  ? "Stream selection is available for Classes 11 and 12"
                  : "Choose your academic stream for specialized subjects"
                }
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Subjects</Label>
              <input 
                type="text"
                placeholder="Search subjects..."
                className="border rounded-md px-3 py-1 text-sm w-1/3"
                value={searchTermSubject}
                onChange={(e) => setSearchTermSubject(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Compulsory subjects are pre-selected. Choose additional optional subjects based on your interests.
            </p>
            
            {/* Compulsory Subjects */}
            <div className="bg-secondary/20 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">Compulsory Subjects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subjectGroups
                  .flatMap(group => group.subjects)
                  .filter(subject => subject.isCompulsory)
                  .map(subject => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={subject.id} 
                        checked={selectedSubjects.includes(subject.id)}
                        disabled={true}
                      />
                      <Label htmlFor={subject.id} className="cursor-not-allowed">
                        {subject.name}
                      </Label>
                    </div>
                  ))
                }
              </div>
            </div>
            
            {/* Optional Subjects by Group */}
            {subjectGroups
              .filter(group => 
                // Show science/commerce/arts streams for classes 11-12 if selected
                (group.id !== "science" && group.id !== "commerce" && group.id !== "arts") || 
                (parseInt(selectedClass) >= 11 && group.id === selectedStream) ||
                // Always show languages
                group.id === "languages"
              )
              .map(group => {
                // Filter subjects based on search
                const filteredSubjects = group.subjects
                  .filter(subject => !subject.isCompulsory)
                  .filter(subject => 
                    searchTermSubject === "" || 
                    subject.name.toLowerCase().includes(searchTermSubject.toLowerCase())
                  );
                
                if (filteredSubjects.length === 0 && searchTermSubject !== "") return null;
                
                return (
                  <div key={group.id} className="bg-secondary/10 p-4 rounded-md mb-2">
                    <div 
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleExpand(group.id)}
                    >
                      <h3 className="font-medium">{group.name}</h3>
                      <button type="button" className="text-sm font-medium text-primary">
                        {isExpanded[group.id] ? "Collapse" : "Expand"}
                      </button>
                    </div>
                    
                    {(isExpanded[group.id] || searchTermSubject !== "") && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        {filteredSubjects.map(subject => (
                          <div key={subject.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={subject.id} 
                              checked={selectedSubjects.includes(subject.id)}
                              onCheckedChange={(checked) => 
                                handleSubjectToggle(subject.id, checked as boolean)
                              }
                            />
                            <Label htmlFor={subject.id}>{subject.name}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            }
          </div>
          
          <Button type="submit" className="w-full">Continue</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SchoolSelectionForm;
