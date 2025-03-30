import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import StudyAIHeader from '@/components/StudyAIHeader';
import LessonTest from '@/components/LessonTest';
import { claudeService } from '@/services/claudeService';
import { BookOpen, ChevronLeft, DownloadCloud, Lightbulb, PlayCircle, List, FileText, Star, Clock, BookCheck, Award } from "lucide-react";

// Type for lesson content
interface LessonContent {
  title: string;
  keyPoints: string[];
  explanation: string[];
  examples: {
    title: string;
    content: string;
  }[];
  visualAids?: {
    title: string;
    description: string;
    visualType: string;
  }[];
  activities?: {
    title: string;
    instructions: string;
    learningOutcome: string;
  }[];
  summary: string;
  textbookReferences?: {
    chapter: string;
    pageNumbers: string;
    description: string;
  }[];
  visualLearningResources?: {
    type: string;
    title: string;
    description: string;
  }[];
  interestingFacts?: string[];
  // Add fallback properties that might be in the API response
  exampleProblems?: {
    problem: string;
    solution: string;
  }[];
  furtherReading?: {
    title: string;
    link: string;
  }[];
}

// Sample mathematics lesson content for fallback
const mathLessonSample: LessonContent = {
  title: "Quadratic Equations and Their Applications",
  keyPoints: [
    "A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0",
    "The quadratic formula x = (-b ± √(b² - 4ac))/2a gives the solutions",
    "The discriminant b² - 4ac determines the nature of roots",
    "Quadratic equations can be solved by factoring, completing the square, or using the quadratic formula",
    "Quadratic functions create parabolas when graphed",
    "Real-world applications include projectile motion, area optimization, and economic modeling"
  ],
  explanation: [
    "Quadratic equations are polynomial equations of the second degree, meaning the highest exponent of the variable is 2. The standard form is ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0. These equations appear frequently in mathematics and have numerous applications in physics, engineering, and economics.",
    "There are multiple methods to solve quadratic equations. The most common approaches are factoring (when the equation can be easily factored), completing the square (a technique that transforms the equation), and the quadratic formula x = (-b ± √(b² - 4ac))/2a which works for all quadratic equations.",
    "The discriminant, calculated as b² - 4ac, helps determine the nature of the roots. If the discriminant is positive, there are two distinct real roots. If it equals zero, there is exactly one real root (a repeated root). If the discriminant is negative, there are two complex conjugate roots.",
    "When graphed, a quadratic function f(x) = ax² + bx + c forms a parabola. The coefficient 'a' determines whether the parabola opens upward (a > 0) or downward (a < 0). The vertex of the parabola represents either the minimum or maximum value of the function."
  ],
  examples: [
    {
      title: "Solving by Factoring",
      content: "Example: Solve x² - 5x + 6 = 0\n\nSolution: We can factor this as (x - 2)(x - 3) = 0\nUsing the zero product property: x - 2 = 0 or x - 3 = 0\nTherefore, x = 2 or x = 3"
    },
    {
      title: "Using the Quadratic Formula",
      content: "Example: Solve 2x² - 7x + 3 = 0\n\nSolution: Using the quadratic formula with a = 2, b = -7, and c = 3:\nx = (7 ± √(49 - 24))/4\nx = (7 ± √25)/4\nx = (7 ± 5)/4\nSo x = 3 or x = 0.5"
    },
    {
      title: "Word Problem Application",
      content: "Example: A farmer has 100 meters of fencing to enclose a rectangular garden adjacent to a river. If the river side needs no fencing, what dimensions will maximize the garden's area?\n\nSolution: Let x be the width. Then (100 - 2x)/2 is the length.\nArea = x × length = x(100 - 2x)/2 = 50x - x²\nTo maximize area, we take the derivative: dA/dx = 50 - 2x\nSetting equal to zero: 50 - 2x = 0\nSolving: x = 25\nSo the dimensions should be 25m × 25m for maximum area of 625 square meters."
    }
  ],
  visualAids: [
    {
      title: "Parabola Graph",
      description: "A visual representation of y = x² - 4x + 3, showing the parabola opening upward with vertex at (2, -1) and x-intercepts at x = 1 and x = 3",
      visualType: "Graph"
    },
    {
      title: "Discriminant Cases",
      description: "Three parabolas showing the three cases for the discriminant: two distinct real roots (b² - 4ac > 0), one repeated real root (b² - 4ac = 0), and no real roots (b² - 4ac < 0)",
      visualType: "Comparative Diagram"
    },
    {
      title: "Completing the Square Method",
      description: "Step-by-step visual showing the transformation of x² + 6x + 8 into (x + 3)² - 1, illustrating the geometric principle behind completing the square",
      visualType: "Process Diagram"
    }
  ],
  activities: [
    {
      title: "Projectile Motion Experiment",
      instructions: "Using a ball launcher and measuring tape, launch a ball at different angles. Record the maximum height and distance traveled. Use quadratic equations to model the path and compare your theoretical predictions with actual measurements.",
      learningOutcome: "Understanding how quadratic equations model real physical phenomena"
    },
    {
      title: "Graphical Exploration",
      instructions: "Using graphing software, investigate how changing the coefficients a, b, and c affects the shape, position, and orientation of the parabola y = ax² + bx + c. Record your observations about the vertex, axis of symmetry, and intercepts.",
      learningOutcome: "Visualizing the relationship between algebraic expressions and their graphical representations"
    }
  ],
  summary: "Quadratic equations form a fundamental part of algebra with extensive applications across various fields. The ability to recognize, manipulate, and solve these equations allows us to model curved relationships and optimize values in real-world scenarios. The various solution methods (factoring, completing the square, and the quadratic formula) provide flexibility in approaching different problems, while the discriminant offers quick insight into the nature of solutions. Understanding parabolas as the graphical representation of quadratic functions helps in visualizing and interpreting these mathematical relationships.",
  textbookReferences: [
    {
      chapter: "8",
      pageNumbers: "144-158",
      description: "Quadratic Equations - Methods of Solution"
    },
    {
      chapter: "9",
      pageNumbers: "160-172",
      description: "Applications of Quadratic Equations"
    }
  ],
  interestingFacts: [
    "Ancient Babylonian mathematicians could solve quadratic equations as early as 2000 BCE using geometric methods",
    "The quadratic formula was first published in its modern form by Abraham bar Hiyya Ha-Nasi in his book 'Liber embadorum' published in 1145 CE",
    "The word 'quadratic' comes from the Latin word 'quadratum' meaning square, referring to the squared term in the equation"
  ]
};

// Sample science lesson content for fallback
const scienceLessonSample: LessonContent = {
  title: "Periodic Table and Element Classification",
  keyPoints: [
    "The periodic table organizes elements by increasing atomic number",
    "Elements are arranged in periods (rows) and groups (columns)",
    "Elements in the same group have similar chemical properties",
    "The periodic table is divided into metals, nonmetals, and metalloids",
    "Electron configuration determines an element's position in the periodic table",
    "Periodic trends include atomic radius, ionization energy, and electronegativity"
  ],
  explanation: [
    "The periodic table is one of the most significant achievements in science, offering a logical organization of all known chemical elements. Developed by Dmitri Mendeleev in 1869, the modern periodic table arranges elements by increasing atomic number (the number of protons in an atom's nucleus) from left to right and top to bottom.",
    "Elements are organized into periods (horizontal rows) and groups (vertical columns). Elements in the same group have similar chemical properties because they have the same number of electrons in their outermost energy level or valence shell. This organization allows scientists to predict the behavior of elements based on their position in the table.",
    "The periodic table is broadly divided into metals (left and middle of the table), nonmetals (upper right), and metalloids (along the zigzag line separating metals and nonmetals). Metals generally conduct electricity, are malleable and ductile, and tend to lose electrons in chemical reactions. Nonmetals typically do not conduct electricity well, are brittle in solid form, and tend to gain electrons. Metalloids have properties intermediate between metals and nonmetals.",
    "The modern periodic table is based on the periodic law, which states that when elements are arranged by increasing atomic number, there is a periodic repetition of their physical and chemical properties. This periodicity is directly related to the electron configuration of atoms. Elements in the same group have similar valence electron configurations, which explains their similar chemical behavior."
  ],
  examples: [
    {
      title: "Group 1: Alkali Metals",
      content: "Elements: Lithium (Li), Sodium (Na), Potassium (K), Rubidium (Rb), Cesium (Cs), Francium (Fr)\n\nCommon properties:\n- One valence electron\n- Highly reactive metals\n- React vigorously with water to produce hydrogen gas and metal hydroxides\n- Form +1 ions in compounds\n- Soft and have low melting points\n\nExample reaction: 2Na + 2H₂O → 2NaOH + H₂"
    },
    {
      title: "Group 17: Halogens",
      content: "Elements: Fluorine (F), Chlorine (Cl), Bromine (Br), Iodine (I), Astatine (At), Tennessine (Ts)\n\nCommon properties:\n- Seven valence electrons\n- Highly reactive nonmetals\n- Exist as diatomic molecules (F₂, Cl₂, etc.)\n- Form -1 ions (halides) in compounds\n- React with metals to form salts\n\nExample reaction: Cl₂ + 2KI → 2KCl + I₂"
    },
    {
      title: "Transition Metals: Period 4",
      content: "Elements: Scandium (Sc) through Zinc (Zn)\n\nCommon properties:\n- Electrons fill the d-orbital\n- Good conductors of heat and electricity\n- Many form colored compounds\n- Often exhibit multiple oxidation states\n- Generally hard and have high melting points\n\nExample: Copper (Cu) can form Cu⁺ (copper(I)) and Cu²⁺ (copper(II)) ions, giving different colored compounds (Cu₂O is red, CuO is black)"
    }
  ],
  visualAids: [
    {
      title: "Modern Periodic Table",
      description: "Color-coded periodic table showing metals, nonmetals, and metalloids, with atomic numbers, symbols, atomic weights, and electron configurations for each element",
      visualType: "Chart"
    },
    {
      title: "Electron Orbital Filling",
      description: "Diagram showing the order of filling of electron orbitals (1s, 2s, 2p, etc.) and how this relates to the structure of the periodic table",
      visualType: "Diagram"
    },
    {
      title: "Periodic Trends",
      description: "Visual representation of how atomic radius, ionization energy, and electronegativity change across periods and down groups in the periodic table",
      visualType: "Trend Graph"
    }
  ],
  activities: [
    {
      title: "Element Identification Lab",
      instructions: "Observe the physical properties and chemical reactions of several unknown elemental samples. Based on your observations and reference to the periodic table, identify each element and explain your reasoning.",
      learningOutcome: "Applying knowledge of periodic trends to identify elements based on their properties"
    },
    {
      title: "Periodic Table Puzzle",
      instructions: "Using a blank periodic table grid and element cards containing properties (but not names), place each element in its correct position based on the provided information about atomic number, electron configuration, and chemical behavior.",
      learningOutcome: "Understanding the logical organization of the periodic table and the relationship between electron configuration and element position"
    }
  ],
  summary: "The periodic table stands as one of science's most powerful organizational tools, arranging elements by atomic number in a way that reveals patterns in their properties. This arrangement into periods and groups creates a roadmap for understanding chemical behavior, as elements in the same group share similar properties due to their valence electron configurations. The division into metals, nonmetals, and metalloids further helps categorize elements by their physical and chemical characteristics. Periodic trends such as atomic radius, ionization energy, and electronegativity provide additional insights into element behavior. The predictive power of the periodic table has allowed scientists to discover new elements and understand the fundamental nature of matter.",
  textbookReferences: [
    {
      chapter: "5",
      pageNumbers: "98-115",
      description: "Periodic Table and Periodic Properties"
    },
    {
      chapter: "6",
      pageNumbers: "116-130",
      description: "Chemical Bonding and Molecular Structure"
    }
  ],
  interestingFacts: [
    "When Mendeleev created his periodic table, he left gaps for undiscovered elements and accurately predicted their properties, including gallium, scandium, and germanium",
    "Technetium was the first artificially produced element and was discovered in 1937, filling a gap in the periodic table",
    "Hydrogen is usually placed in Group 1 but doesn't fully belong there - it has properties similar to both alkali metals and halogens, making it unique in the periodic table"
  ]
};

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [studyItem, setStudyItem] = useState<any>(null);
  
  useEffect(() => {
    const loadLessonContent = async () => {
      setLoading(true);
      
      try {
        // Get study item from localStorage
        const storedStudyItem = localStorage.getItem('currentStudyItem');
        
        if (!storedStudyItem) {
          throw new Error("Missing study item information");
        }
        
        const parsedStudyItem = JSON.parse(storedStudyItem);
        setStudyItem(parsedStudyItem);
        
        if (!parsedStudyItem.title || !parsedStudyItem.subject) {
          throw new Error("Incomplete study item information");
        }
        
        // Show toast for content loading
        toast.loading(`Loading lesson: ${parsedStudyItem.title}`, {
          description: "Retrieving NCERT-aligned learning content...",
        });
        
        // Get lesson content from Claude API - with fallback to sample data
        let result;
        try {
          result = await claudeService.getLessonContent(
            parsedStudyItem.subject,
            parsedStudyItem.title,
            parsedStudyItem.className || '10'
          );
        } catch (apiError) {
          console.error("API Error:", apiError);
          // Use the appropriate sample data based on subject
          result = parsedStudyItem.subject.toLowerCase().includes('math') 
            ? mathLessonSample 
            : scienceLessonSample;
            
          // Customize the title to match the requested topic
          result.title = parsedStudyItem.title;
          
          toast({
            title: "Using example lesson",
            description: "Connected to sample data for demonstration",
          });
        }
        
        if (result) {
          // Transform result if needed to match our expected format
          const formattedLesson: LessonContent = {
            title: result.title || parsedStudyItem.title,
            keyPoints: result.keyPoints || [],
            explanation: Array.isArray(result.explanation) ? result.explanation : 
              (typeof result.explanation === 'string' ? [result.explanation] : 
              (typeof result.summary === 'string' ? [result.summary] : [])),
            examples: Array.isArray(result.examples) ? result.examples : 
              (result.exampleProblems ? result.exampleProblems.map(ep => ({
                title: "Example",
                content: `Problem: ${ep.problem}\nSolution: ${ep.solution}`
              })) : []),
            summary: result.summary || "",
            visualAids: result.visualAids || [],
            activities: result.activities || [],
            textbookReferences: result.textbookReferences || [],
            interestingFacts: result.interestingFacts || []
          };
          
          setLesson(formattedLesson);
          
          // Dismiss loading toast and show success toast
          toast.success("Lesson Ready", {
            description: `${parsedStudyItem.title} content has been loaded successfully`,
          });
          
          // Award XP for viewing a lesson
          const currentXp = parseInt(localStorage.getItem('currentXp') || '0');
          localStorage.setItem('currentXp', (currentXp + 10).toString());
        } else {
          throw new Error("Failed to load lesson content");
        }
      } catch (error) {
        console.error("Error loading lesson content:", error);
        
        // Use sample data as fallback
        const fallbackLesson = mathLessonSample;
        fallbackLesson.title = studyItem?.title || "Mathematics Lesson";
        setLesson(fallbackLesson);
        
        setError("Failed to load specific lesson content. Using sample data instead.");
        
        toast.error("Using Sample Content", {
          description: "There was a problem loading this lesson. Using example content.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadLessonContent();
  }, [id]); // Only dependency is id
  
  const handleStartTest = () => {
    setShowTest(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const navigationItems = [
    { name: "Back to Subject", href: `/subject/${studyItem?.subject || ''}`, icon: <ChevronLeft className="h-4 w-4" /> },
  ];
  
  if (showTest) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <StudyAIHeader
          userName="Student"
          level={parseInt(localStorage.getItem('currentLevel') || '1')}
          xp={parseInt(localStorage.getItem('currentXp') || '0')}
          navigation={navigationItems}
        />
        <main className="flex-1 container py-6 md:py-12">
          <LessonTest 
            lessonTitle={studyItem?.title || 'Lesson Test'}
            onFinish={() => navigate(`/subject/${studyItem?.subject}`)}
            topicName={studyItem?.title || ''}
            subjectName={studyItem?.subject || ''}
          />
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudyAIHeader
        userName="Student"
        level={parseInt(localStorage.getItem('currentLevel') || '1')}
        xp={parseInt(localStorage.getItem('currentXp') || '0')}
        navigation={navigationItems}
      />
      
      <main className="flex-1 container py-6 md:py-12">
        {loading ? (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Loading Lesson</CardTitle>
              <CardDescription>Retrieving learning materials...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Using Sample Lesson Content</CardTitle>
              <CardDescription>We're showing example materials</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-500 mb-4">{error}</p>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/subject/${studyItem?.subject || ''}`)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Return to Subject
              </Button>
            </CardContent>
          </Card>
        ) : lesson ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate(`/subject/${studyItem?.subject || ''}`)}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to {studyItem?.subject || 'Subject'}
              </Button>
              
              <Button variant="outline" onClick={handleStartTest}>
                <FileText className="mr-2 h-4 w-4" />
                Test Your Knowledge
              </Button>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {studyItem?.subject || 'Subject'} - Class {studyItem?.className || '10'}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">
                    NCERT Curriculum
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Estimated Time</p>
                      <p className="text-sm text-blue-600">20-30 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <BookCheck className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-green-800 font-medium">Complexity</p>
                      <p className="text-sm text-green-600">Intermediate</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-amber-50 rounded-lg">
                    <Award className="h-5 w-5 text-amber-600 mr-2" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">XP Reward</p>
                      <p className="text-sm text-amber-600">25 XP for completion</p>
                    </div>
                  </div>
                </div>
                
                {/* Key Points */}
                {lesson.keyPoints && lesson.keyPoints.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <List className="mr-2 h-5 w-5 text-primary" />
                      Key Points to Remember
                    </h3>
                    <ul className="space-y-2 pl-6 list-disc">
                      {lesson.keyPoints.map((point, index) => (
                        <li key={index} className="text-muted-foreground">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Explanation */}
                {lesson.explanation && lesson.explanation.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Detailed Explanation</h3>
                    {lesson.explanation.map((paragraph, index) => (
                      <p key={index} className="mb-4 text-muted-foreground">{paragraph}</p>
                    ))}
                  </div>
                )}
                
                {/* Examples */}
                {lesson.examples && lesson.examples.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-primary" />
                      Examples
                    </h3>
                    <div className="space-y-4">
                      {lesson.examples.map((example, index) => (
                        <Card key={index} className="bg-secondary/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{example.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground whitespace-pre-line">{example.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Visual Aids */}
                {lesson.visualAids && lesson.visualAids.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <PlayCircle className="mr-2 h-5 w-5 text-primary" />
                      Visual Learning Aids
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {lesson.visualAids.map((aid, index) => (
                        <Card key={index} className="bg-primary/5">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{aid.title}</CardTitle>
                            <CardDescription>{aid.visualType}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{aid.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Activities */}
                {lesson.activities && lesson.activities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                      Learning Activities
                    </h3>
                    <div className="space-y-4">
                      {lesson.activities.map((activity, index) => (
                        <Card key={index} className="bg-green-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">{activity.title}</CardTitle>
                            <CardDescription>Learning outcome: {activity.learningOutcome}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{activity.instructions}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Interesting Facts */}
                {lesson.interestingFacts && lesson.interestingFacts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Star className="mr-2 h-5 w-5 text-amber-500" />
                      Interesting Facts
                    </h3>
                    <ul className="space-y-2 pl-6 list-disc">
                      {lesson.interestingFacts.map((fact, index) => (
                        <li key={index} className="text-muted-foreground">{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Summary */}
                {lesson.summary && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <p className="text-muted-foreground">{lesson.summary}</p>
                  </div>
                )}
                
                {/* Textbook References */}
                {lesson.textbookReferences && lesson.textbookReferences.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <DownloadCloud className="mr-2 h-5 w-5 text-primary" />
                      NCERT Textbook References
                    </h3>
                    <div className="space-y-2">
                      {lesson.textbookReferences.map((ref, index) => (
                        <div key={index} className="flex items-start">
                          <BookOpen className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Chapter {ref.chapter}</p>
                            <p className="text-sm text-muted-foreground">Pages: {ref.pageNumbers}</p>
                            <p className="text-sm text-muted-foreground">{ref.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 flex justify-center">
                  <Button onClick={handleStartTest} size="lg">
                    <FileText className="mr-2 h-5 w-5" />
                    Test Your Knowledge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default Lesson;
