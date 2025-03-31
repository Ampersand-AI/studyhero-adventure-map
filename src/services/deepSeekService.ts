
import { toast } from "sonner";

export interface AIStatus {
  stage: string;
  progress: number;
  provider?: string;
}

// Interface for subjects returned from API
interface SubjectsResponse {
  compulsorySubjects: string[];
  optionalSubjects: string[];
}

// Interface for study plans returned from API
interface StudyPlanResponse {
  subject: string;
  board: string;
  className: string;
  chapters: Chapter[];
  lastUpdated: string;
}

interface Chapter {
  title: string;
  progress: number;
  lessons: Lesson[];
}

interface Lesson {
  title: string;
  type: string;
}

const API_KEY = "sk-a6632f7d3f794d76b60fbe4a40d80058";

// Default/fallback subjects for different boards and classes
const DEFAULT_SUBJECTS: Record<string, Record<string, SubjectsResponse>> = {
  'CBSE': {
    '7': {
      compulsorySubjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"],
      optionalSubjects: ["Computer Science", "Sanskrit", "Art Education", "Physical Education"]
    },
    '8': {
      compulsorySubjects: ["English", "Hindi", "Mathematics", "Science", "Social Science"],
      optionalSubjects: ["Computer Science", "Sanskrit", "Art Education", "Physical Education"]
    },
    '9': {
      compulsorySubjects: ["English", "Mathematics", "Science", "Social Science", "Second Language"],
      optionalSubjects: ["Information Technology", "Art Education", "Physical Education", "Hindi", "Sanskrit"]
    },
    '10': {
      compulsorySubjects: ["English", "Mathematics", "Science", "Social Science", "Second Language"],
      optionalSubjects: ["Information Technology", "Art Education", "Physical Education", "Hindi", "Sanskrit"]
    },
    '11': {
      compulsorySubjects: ["English"],
      optionalSubjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "Economics", "Business Studies", "Accountancy", "History", "Geography", "Political Science", "Psychology", "Sociology", "Physical Education"]
    },
    '12': {
      compulsorySubjects: ["English"],
      optionalSubjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "Economics", "Business Studies", "Accountancy", "History", "Geography", "Political Science", "Psychology", "Sociology", "Physical Education"]
    }
  },
  'ICSE': {
    '7': {
      compulsorySubjects: ["English", "Mathematics", "Science", "Social Studies", "Second Language"],
      optionalSubjects: ["Computer Applications", "Art", "Music", "Physical Education"]
    },
    '8': {
      compulsorySubjects: ["English", "Mathematics", "Science", "Social Studies", "Second Language"],
      optionalSubjects: ["Computer Applications", "Art", "Music", "Physical Education"]
    },
    '9': {
      compulsorySubjects: ["English", "Mathematics", "Science (Physics, Chemistry, Biology)", "History & Civics", "Geography"],
      optionalSubjects: ["Computer Applications", "Economic Applications", "Modern Foreign Language", "Classical Language", "Art", "Physical Education"]
    },
    '10': {
      compulsorySubjects: ["English", "Mathematics", "Science (Physics, Chemistry, Biology)", "History & Civics", "Geography"],
      optionalSubjects: ["Computer Applications", "Economic Applications", "Modern Foreign Language", "Classical Language", "Art", "Physical Education"]
    },
    '11': {
      compulsorySubjects: ["English"],
      optionalSubjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "Economics", "Commerce", "Accounts", "History", "Geography", "Political Science", "Psychology", "Sociology", "Physical Education"]
    },
    '12': {
      compulsorySubjects: ["English"],
      optionalSubjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "Economics", "Commerce", "Accounts", "History", "Geography", "Political Science", "Psychology", "Sociology", "Physical Education"]
    }
  },
  'State Board': {
    '7': {
      compulsorySubjects: ["English", "Regional Language", "Mathematics", "Science", "Social Science"],
      optionalSubjects: ["Computer Education", "Arts", "Physical Education"]
    },
    '8': {
      compulsorySubjects: ["English", "Regional Language", "Mathematics", "Science", "Social Science"],
      optionalSubjects: ["Computer Education", "Arts", "Physical Education"]
    },
    '9': {
      compulsorySubjects: ["English", "Regional Language", "Mathematics", "Science", "Social Science"],
      optionalSubjects: ["Computer Science", "Arts", "Physical Education", "Third Language"]
    },
    '10': {
      compulsorySubjects: ["English", "Regional Language", "Mathematics", "Science", "Social Science"],
      optionalSubjects: ["Computer Science", "Arts", "Physical Education", "Third Language"]
    },
    '11': {
      compulsorySubjects: ["English", "Regional Language"],
      optionalSubjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "Economics", "Commerce", "Accountancy", "History", "Geography", "Political Science"]
    },
    '12': {
      compulsorySubjects: ["English", "Regional Language"],
      optionalSubjects: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "Economics", "Commerce", "Accountancy", "History", "Geography", "Political Science"]
    }
  },
  'International': {
    '7': {
      compulsorySubjects: ["English", "Mathematics", "Science", "Humanities"],
      optionalSubjects: ["Second Language", "Digital Literacy", "Art & Design", "Music", "Drama", "Physical Education"]
    },
    '8': {
      compulsorySubjects: ["English", "Mathematics", "Science", "Humanities"],
      optionalSubjects: ["Second Language", "Digital Literacy", "Art & Design", "Music", "Drama", "Physical Education"]
    },
    '9': {
      compulsorySubjects: ["English", "Mathematics", "Science (Physics, Chemistry, Biology)", "Humanities"],
      optionalSubjects: ["Second Language", "Computer Science", "Business Studies", "Economics", "Art & Design", "Music", "Drama", "Physical Education"]
    },
    '10': {
      compulsorySubjects: ["English", "Mathematics", "Science (Physics, Chemistry, Biology)", "Humanities"],
      optionalSubjects: ["Second Language", "Computer Science", "Business Studies", "Economics", "Art & Design", "Music", "Drama", "Physical Education"]
    },
    '11': {
      compulsorySubjects: ["English"],
      optionalSubjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Economics", "Business Management", "Psychology", "History", "Geography", "Global Politics", "Visual Arts", "Music", "Theatre", "Foreign Languages"]
    },
    '12': {
      compulsorySubjects: ["English"],
      optionalSubjects: ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Economics", "Business Management", "Psychology", "History", "Geography", "Global Politics", "Visual Arts", "Music", "Theatre", "Foreign Languages"]
    }
  }
};

/**
 * Gets the appropriate subjects for a given board and class
 */
async function getSubjectsForBoardAndClass(board: string, className: string): Promise<SubjectsResponse> {
  try {
    console.log(`Getting subjects for ${board} class ${className}`);
    
    // Try to fetch from DeepSeek API
    const prompt = `List the compulsory and optional subjects for ${board} curriculum in class ${className}. Format as JSON with compulsorySubjects and optionalSubjects arrays.`;
    
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an educational curriculum expert. Provide accurate information about school subjects."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content returned from API");
    }
    
    // Extract JSON from the response (which might contain markdown and other text)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/```\n([\s\S]*?)\n```/) || 
                      content.match(/{[\s\S]*?}/);
    
    let jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    
    // Clean up the string to ensure it's valid JSON
    jsonStr = jsonStr.replace(/^```json\n|^```\n|```$/g, '').trim();
    
    try {
      const result = JSON.parse(jsonStr);
      
      // Validate the result has the expected structure
      if (Array.isArray(result.compulsorySubjects) && Array.isArray(result.optionalSubjects)) {
        console.log("Successfully parsed subjects from API:", result);
        return result;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (parseError) {
      console.error("Error parsing DeepSeek response:", parseError);
      throw new Error("Failed to parse API response");
    }
  } catch (error) {
    console.error("DeepSeek subjects error:", error);
    
    // Fallback to default subjects
    const defaultSubjects = DEFAULT_SUBJECTS[board]?.[className];
    
    if (defaultSubjects) {
      console.log("Using default subjects for", board, "class", className);
      return defaultSubjects;
    }
    
    // Fallback for any board/class combination not in our defaults
    return {
      compulsorySubjects: ["English", "Mathematics", "Science"],
      optionalSubjects: ["Social Studies", "Computer Science", "Arts", "Physical Education"]
    };
  }
}

/**
 * Generate study plan for a subject
 */
async function generateStudyPlan(
  subject: string, 
  board: string, 
  className: string,
  onStatusUpdate?: (status: AIStatus) => void
): Promise<StudyPlanResponse> {
  const updateStatus = onStatusUpdate || (() => {});
  
  try {
    updateStatus({
      stage: "Initializing DeepSeek API",
      progress: 10,
      provider: "DeepSeek AI"
    });
    
    const prompt = `Create a detailed study plan for ${subject} for class ${className} following the ${board} curriculum. Format as JSON with a chapters array containing title and lessons fields.`;
    
    updateStatus({
      stage: "Requesting curriculum data",
      progress: 30,
      provider: "DeepSeek AI"
    });
    
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert educational curriculum designer."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.5
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    updateStatus({
      stage: "Processing curriculum data",
      progress: 70,
      provider: "DeepSeek AI"
    });
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content returned from API");
    }
    
    // Extract JSON from the response (which might contain markdown and other text)
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/```\n([\s\S]*?)\n```/) || 
                      content.match(/{[\s\S]*?}/);
    
    let jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
    
    // Clean up the string to ensure it's valid JSON
    jsonStr = jsonStr.replace(/^```json\n|^```\n|```$/g, '').trim();
    
    try {
      const result = JSON.parse(jsonStr);
      
      // Validate the result has the expected structure
      if (result.chapters && Array.isArray(result.chapters)) {
        updateStatus({
          stage: "Study plan successfully generated",
          progress: 100,
          provider: "DeepSeek AI"
        });
        
        return {
          subject,
          board,
          className,
          chapters: result.chapters,
          lastUpdated: new Date().toISOString()
        };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (parseError) {
      console.error("Error parsing DeepSeek response:", parseError);
      throw new Error("Failed to parse API response");
    }
  } catch (error) {
    console.error("DeepSeek study plan error:", error);
    updateStatus({
      stage: "Error generating study plan, using fallback",
      progress: 50,
      provider: "System Fallback"
    });
    
    // Fallback with generic chapters
    const defaultChapters = generateDefaultChapters(subject);
    
    updateStatus({
      stage: "Generated fallback study plan",
      progress: 100,
      provider: "System Fallback"
    });
    
    return {
      subject,
      board,
      className,
      chapters: defaultChapters,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * Generate default chapters for fallback
 */
function generateDefaultChapters(subject: string): Chapter[] {
  const subjectLower = subject.toLowerCase();
  let topics: string[] = [];
  
  if (subjectLower.includes('math')) {
    topics = [
      'Numbers and Number Systems',
      'Algebra: Linear Equations',
      'Geometry: Triangles and Quadrilaterals',
      'Statistics: Data Handling',
      'Mensuration: Areas and Volumes'
    ];
  } else if (subjectLower.includes('science')) {
    topics = [
      'Matter in Our Surroundings',
      'Cell Structure and Functions',
      'Force and Laws of Motion',
      'Work and Energy',
      'Natural Resources and Conservation'
    ];
  } else if (subjectLower.includes('english')) {
    topics = [
      'Reading Comprehension',
      'Grammar: Parts of Speech',
      'Essay Writing',
      'Literature: Poetry Analysis',
      'Vocabulary Building'
    ];
  } else if (subjectLower.includes('social') || subjectLower.includes('history')) {
    topics = [
      'The French Revolution',
      'Physical Features of India',
      'Democracy and Constitution',
      'Resources and Development',
      'The Industrial Revolution'
    ];
  } else if (subjectLower.includes('physics')) {
    topics = [
      'Mechanics: Laws of Motion',
      'Electrostatics and Current Electricity',
      'Magnetism and Electromagnetic Induction',
      'Optics: Light and Reflection',
      'Thermodynamics'
    ];
  } else if (subjectLower.includes('chemistry')) {
    topics = [
      'Classification of Elements: Periodic Table',
      'Chemical Bonding and Molecular Structure',
      'Acids, Bases and Salts',
      'Organic Chemistry: Hydrocarbons',
      'Electrochemistry'
    ];
  } else if (subjectLower.includes('biology')) {
    topics = [
      'Cell Biology and Cell Division',
      'Plant Physiology',
      'Human Physiology: Digestive System',
      'Genetics and Evolution',
      'Ecology and Ecosystem'
    ];
  } else {
    topics = [
      'Introduction to the Subject',
      'Fundamental Concepts',
      'Advanced Applications',
      'Practical Techniques',
      'Modern Developments'
    ];
  }
  
  return topics.map((topic, index) => ({
    title: topic,
    progress: 0,
    lessons: [
      { title: `Introduction to ${topic}`, type: "lesson" },
      { title: `${topic} Practice`, type: "practice" },
      { title: `${topic} Quiz`, type: "quiz" }
    ]
  }));
}

// Export default and named functions
const deepSeekService = {
  getSubjectsForBoardAndClass,
  generateStudyPlan
};

export default deepSeekService;
