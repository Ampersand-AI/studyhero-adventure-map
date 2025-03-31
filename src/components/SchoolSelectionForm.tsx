
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import deepSeekService from "../services/deepSeekService";

interface SchoolSelectionFormProps {
  userName?: string;
  level?: number;
  xp?: number;
  board?: string;
  onComplete: (school: { state: string; city: string; school: string }) => void;
}

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({ 
  userName = "Student", 
  level = 1, 
  xp = 0,
  board,
  onComplete 
}) => {
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [school, setSchool] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schools, setSchools] = useState<string[]>([]);

  const handleStateChange = (value: string) => {
    setState(value);
    // Reset city and school when state changes
    setCity("");
    setSchool("");
    setSchools([]);
  };

  const handleCityChange = async (value: string) => {
    setCity(value);
    // Reset school when city changes
    setSchool("");
    
    // Fetch comprehensive list of schools for this city
    if (value && state) {
      setLoadingSchools(true);
      try {
        const schoolList = await deepSeekService.getSchoolsForCity(state, value);
        setSchools(schoolList);
      } catch (error) {
        console.error("Error fetching schools:", error);
        toast("Error loading schools", {
          description: "Could not fetch schools for this city. Using default list."
        });
        setSchools(getDefaultSchools(value));
      } finally {
        setLoadingSchools(false);
      }
    }
  };

  const handleSchoolChange = (value: string) => {
    setSchool(value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form inputs
    if (!state || !city || !school) {
      toast("Required fields missing", {
        description: "Please fill in all required fields."
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
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
      "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belgaum", "Gulbarga", "Davanagere", "Shimoga"],
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy", "Tirunelveli", "Erode", "Vellore"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Prayagraj", "Ghaziabad", "Noida"],
      "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
      "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Sikar", "Bhilwara"],
      "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Baharampur", "Haldia", "Kharagpur"],
      "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda"],
      "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada"],
      // Add more states and cities as needed
    };

    return citiesMap[state] || ["City 1", "City 2", "City 3"]; // Default cities if state is not in the map
  };

  // Function for default schools if API fails
  const getDefaultSchools = (city: string) => {
    // Enhanced with more comprehensive school lists
    const schoolsMap: Record<string, string[]> = {
      "Mumbai": ["St. Xavier's High School", "Don Bosco High School", "R.N. Podar School", "Bombay Scottish School", "Cathedral and John Connon School", "Jamnabai Narsee School", "Dhirubhai Ambani International School", "Arya Vidya Mandir"],
      "New Delhi": ["Delhi Public School (R.K. Puram)", "Modern School (Barakhamba Road)", "Springdales School (Pusa Road)", "Sanskriti School", "The Shri Ram School", "Mother's International School", "St. Columba's School", "Don Bosco School"],
      "Bengaluru": ["Bishop Cotton Boys' School", "National Public School (Indiranagar)", "The Valley School", "Inventure Academy", "Vidyashilp Academy", "Delhi Public School (Bangalore East)", "Mallya Aditi International School", "Ekya School"],
      "Chennai": ["Don Bosco Matriculation Higher Secondary School", "DAV Boys Senior Secondary School", "Chettinad Vidyashram", "P.S. Senior Secondary School", "Sir Mutha School", "Padma Seshadri Bala Bhavan", "Lady Andal Venkatasubba Rao School", "Chennai Public School"],
      "Pune": ["The Bishop's School", "St. Mary's School", "Symbiosis International School", "Delhi Public School Pune", "The Orchid School", "Hutchings High School", "St. Vincent's High School", "Loyola High School"],
      "Hyderabad": ["Hyderabad Public School", "Delhi Public School (Nacharam)", "Oakridge International School", "Chirec International School", "Johnson Grammar School", "Meridian School", "Silver Oaks International School", "Glendale Academy"],
      "Kolkata": ["La Martiniere for Boys/Girls", "Don Bosco School (Park Circus)", "St. Xavier's Collegiate School", "Modern High School for Girls", "South Point High School", "The Heritage School", "Calcutta International School", "St. James' School"],
      "Ahmedabad": ["Delhi Public School (Bopal)", "Anand Niketan School", "Nirma Vidyavihar", "Udgam School", "Riverside School", "Eklavya School", "St. Kabir School", "SGVP International School"],
      // Add more cities and schools as needed
    };

    return schoolsMap[city] || ["School 1", "School 2", "School 3", "School 4", "School 5", "School 6", "School 7", "School 8"]; // Default schools if city is not in the map
  };

  // Get relevant cities based on selections
  const cities = state ? getCitiesForState(state) : [];

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
            <Select value={school} onValueChange={handleSchoolChange} disabled={loading || !city || loadingSchools}>
              <SelectTrigger id="school">
                <SelectValue placeholder={loadingSchools ? "Loading schools..." : "Select School"} />
              </SelectTrigger>
              <SelectContent>
                {loadingSchools ? (
                  <SelectItem value="loading" disabled>Loading schools...</SelectItem>
                ) : (
                  schools.map((schoolName) => (
                    <SelectItem key={schoolName} value={schoolName}>{schoolName}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {loadingSchools && (
              <div className="mt-2">
                <div className="h-1 w-full bg-gray-200 rounded overflow-hidden">
                  <div className="h-full bg-primary animate-pulse rounded" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Searching for schools in {city}...</p>
              </div>
            )}
          </div>
          
          <Button type="submit" disabled={loading || !state || !city || !school || loadingSchools}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SchoolSelectionForm;
