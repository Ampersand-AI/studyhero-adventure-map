
import React, { useEffect, useState } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { School, MapPin, Search } from "lucide-react";

// Define a schema for the form
const formSchema = z.object({
  state: z.string().min(1, { message: "Please select a state" }),
  city: z.string().min(1, { message: "Please select a city" }),
  school: z.string().min(1, { message: "Please select a school" }),
});

interface SchoolSelectionFormProps {
  board: string;
  onComplete: (schoolInfo: { state: string; city: string; school: string }) => void;
}

const SchoolSelectionForm: React.FC<SchoolSelectionFormProps> = ({ board, onComplete }) => {
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<{ [state: string]: string[] }>({});
  const [schools, setSchools] = useState<{ [city: string]: string[] }>({});
  const [loading, setLoading] = useState(true);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [schoolSearchTerm, setSchoolSearchTerm] = useState("");
  
  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: "",
      city: "",
      school: "",
    },
  });
  
  // Function to load states
  useEffect(() => {
    const loadStates = async () => {
      setLoading(true);
      try {
        // In a real app, we would fetch from an API
        // For now, using mock data for demo
        const mockStates = [
          "Andhra Pradesh", "Assam", "Bihar", "Delhi", "Gujarat", 
          "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", 
          "Maharashtra", "Odisha", "Punjab", "Rajasthan", 
          "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
        ];
        
        setStates(mockStates);
        
        // Generate mock cities for each state
        const mockCities: { [state: string]: string[] } = {};
        mockStates.forEach(state => {
          if (state === "Maharashtra") {
            mockCities[state] = ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"];
          } else if (state === "Karnataka") {
            mockCities[state] = ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"];
          } else if (state === "Tamil Nadu") {
            mockCities[state] = ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"];
          } else if (state === "Delhi") {
            mockCities[state] = ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"];
          } else {
            mockCities[state] = [`${state} City 1`, `${state} City 2`, `${state} City 3`];
          }
        });
        
        setCities(mockCities);
        
        // Generate realistic school names for demonstration
        const mockSchools: { [city: string]: string[] } = {};
        Object.values(mockCities).flat().forEach(city => {
          if (city === "Mumbai") {
            mockSchools[city] = [
              "Don Bosco High School, Matunga", 
              "Cathedral and John Connon School, Fort", 
              "Bombay Scottish School, Mahim",
              "St. Mary's School, Mazagaon",
              "Campion School, Cooperage",
              "Jamnabai Narsee School, Juhu",
              "R.N. Podar School, Santacruz",
              "Dhirubhai Ambani International School, BKC",
              "The Aditya Birla World Academy, Tardeo",
              "Chatrabhuj Narsee School, Ville Parle",
              "Greenlawns High School, Breach Candy",
              "Arya Vidya Mandir, Bandra",
              "G.D. Somani Memorial School, Cuffe Parade"
            ];
          } else if (city === "Delhi" || city === "New Delhi") {
            mockSchools[city] = [
              "Delhi Public School, R.K. Puram", 
              "Modern School, Barakhamba Road", 
              "The Shri Ram School, Vasant Vihar",
              "Sanskriti School, Chanakyapuri",
              "Mother's International School, Sri Aurobindo Marg",
              "St. Columba's School, Ashok Place",
              "Vasant Valley School, Vasant Kunj",
              "Delhi Public School, Mathura Road",
              "St. George's School, Alaknanda",
              "Springdales School, Pusa Road",
              "Amity International School, Saket",
              "Mount St. Mary's School, Delhi Cantt",
              "Army Public School, Dhaula Kuan"
            ];
          } else if (city === "Bangalore") {
            mockSchools[city] = [
              "National Public School, Indiranagar", 
              "Bishop Cotton Boys' School, St. Mark's Road", 
              "Delhi Public School Bangalore, East",
              "St. Joseph's Boys' High School, Museum Road",
              "The Valley School, Kanakapura Road",
              "Inventure Academy, Whitefield",
              "Greenwood High International School, Bannerghatta",
              "Vidyashilp Academy, Jakkur",
              "New Horizon Public School, Indiranagar",
              "Bethany High School, Koramangala",
              "Ekya School, JP Nagar",
              "Indus International School, Sarjapur Road",
              "Mallya Aditi International School, Yelahanka"
            ];
          } else if (city === "Chennai") {
            mockSchools[city] = [
              "P.S. Senior Secondary School, Mylapore",
              "Chettinad Vidyashram, RA Puram",
              "DAV Boys Senior Secondary School, Gopalapuram",
              "Don Bosco Matriculation Higher Secondary School, Egmore",
              "Good Shepherd International School, Alwarpet",
              "P.S.B.B. Senior Secondary School, KK Nagar",
              "Vidya Mandir Senior Secondary School, Mylapore",
              "St. Michael's Academy, Adyar",
              "Lady Andal Venkatasubba Rao Matriculation School, Chetpet",
              "Chennai Public School, Anna Nagar",
              "SBOA School and Junior College, Anna Nagar",
              "Maharishi Vidya Mandir, Chetpet"
            ];
          } else if (city === "Pune") {
            mockSchools[city] = [
              "The Bishop's School, Camp",
              "St. Mary's School, Pune Cantonment",
              "Delhi Public School, Pune",
              "Symbiosis International School, Viman Nagar",
              "The Orbis School, Keshavnagar",
              "Lexicon International School, Kalyani Nagar",
              "VIBGYOR High School, NIBM Road",
              "Indus International School, Bhukum",
              "City International School, Aundh",
              "Sanskriti School, Bhugaon",
              "The Orchid School, Baner",
              "St. Helena's School, Pune"
            ];
          } else if (city === "Kolkata" || city.includes("West Bengal")) {
            mockSchools[city] = [
              "La Martiniere for Boys, Loudon Street",
              "Don Bosco School, Park Circus",
              "St. Xavier's Collegiate School, Park Street",
              "South Point High School, Ballygunge",
              "Modern High School for Girls, Syed Amir Ali Avenue",
              "The Heritage School, Kolkata",
              "Birla High School, Moira Street",
              "Calcutta International School, Shakespeare Sarani",
              "Delhi Public School Ruby Park, Kasba",
              "St. James' School, AJC Bose Road",
              "Lakshmipat Singhania Academy, Alipore",
              "Mahadevi Birla World Academy, Hungerford Street"
            ];
          } else {
            // Generate generic school names for other cities with more realistic naming
            mockSchools[city] = [
              `${board} Model School, ${city}`,
              `NCERT Exemplar School, ${city}`,
              `National Public School, ${city}`,
              `City International School, ${city}`,
              `${city} International School`,
              `St. Xavier's School, ${city}`,
              `Modern Academy, ${city}`,
              `Divine Public School, ${city}`,
              `Holy Child School, ${city}`,
              `Kendriya Vidyalaya, ${city}`,
              `DAV Public School, ${city}`,
              `Bharatiya Vidya Bhavan's School, ${city}`,
              `Delhi Public School, ${city}`,
              `Greenwood High School, ${city}`,
              `St. Mary's Convent School, ${city}`,
              `Bal Bharati Public School, ${city}`
            ];
          }
        });
        
        setSchools(mockSchools);
      } catch (error) {
        console.error("Error loading location data:", error);
        toast.error("Failed to load location data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadStates();
  }, [board]);
  
  // Watch for state changes to reset city and school
  const watchState = form.watch("state");
  const watchCity = form.watch("city");
  
  useEffect(() => {
    form.setValue("city", "");
    form.setValue("school", "");
    setCitySearchTerm("");
  }, [watchState, form]);
  
  useEffect(() => {
    form.setValue("school", "");
    setSchoolSearchTerm("");
  }, [watchCity, form]);
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Create a schoolInfo object with all required fields
    const schoolInfo = {
      state: values.state,
      city: values.city,
      school: values.school
    };
    
    // Send complete school info to parent component
    onComplete(schoolInfo);
    
    // Save to localStorage
    localStorage.setItem('selectedState', values.state);
    localStorage.setItem('selectedCity', values.city);
    localStorage.setItem('selectedSchool', values.school);
    
    toast.success(`School Selected - You've selected ${values.school} in ${values.city}, ${values.state}`);
  };
  
  // Filter cities and schools based on search
  const filteredCities = watchState && cities[watchState] ? 
    cities[watchState].filter(city => 
      city.toLowerCase().includes(citySearchTerm.toLowerCase())
    ) : [];
    
  const filteredSchools = watchCity && schools[watchCity] ? 
    schools[watchCity].filter(school => 
      school.toLowerCase().includes(schoolSearchTerm.toLowerCase())
    ) : [];
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Select Your School</h2>
        <p className="text-muted-foreground">Choose your location and school following {board} curriculum</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* State selection */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* City selection with search */}
            {watchState && (
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <div className="mb-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search cities..."
                          className="pl-8"
                          value={citySearchTerm}
                          onChange={(e) => setCitySearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredCities.length > 0 ? (
                          filteredCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-muted-foreground">
                            No cities found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* School selection with search */}
            {watchState && watchCity && (
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School</FormLabel>
                    <div className="mb-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search schools..."
                          className="pl-8"
                          value={schoolSearchTerm}
                          onChange={(e) => setSchoolSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSchools.length > 0 ? (
                          filteredSchools.map((school) => (
                            <SelectItem key={school} value={school}>
                              {school}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-muted-foreground">
                            No schools found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!watchState || !watchCity || !form.getValues("school")}
              >
                <School className="mr-2 h-4 w-4" />
                Continue with Selected School
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default SchoolSelectionForm;
