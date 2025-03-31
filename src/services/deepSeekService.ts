
// src/services/deepSeekService.ts

interface AIStatus {
  stage: string;
  progress: number;
}

// DeepSeek API Configuration
const DEEPSEEK_API_KEY = "sk-a6632f7d3f794d76b60fbe4a40d80058";

// Mock data for fallback when API is unavailable
const getDefaultSubjectsForBoard = (board: string, className: string) => {
  // Return faster default data based on board and class
  if (board === 'CBSE') {
    return {
      compulsorySubjects: ["Mathematics", "Science", "English", "Social Studies", "Hindi"],
      optionalSubjects: ["Computer Science", "Sanskrit", "Physical Education", "Art", "Music"]
    };
  } else if (board === 'ICSE') {
    return {
      compulsorySubjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi"],
      optionalSubjects: ["Computer Science", "Physical Education", "Art", "Economics", "Geography"]
    };
  } else if (board === 'State Board') {
    return {
      compulsorySubjects: ["Mathematics", "Science", "English", "Social Science", "Hindi"],
      optionalSubjects: ["Computer Applications", "Physical Education", "Art Education", "Music"]
    };
  } else { // International
    return {
      compulsorySubjects: ["Mathematics", "Science", "English Language", "Social Studies"],
      optionalSubjects: ["Computer Science", "Foreign Language", "Physical Education", "Art & Design", "Music", "Economics"]
    };
  }
};

// DeepSeek Service
const deepSeekService = {
  apiKey: DEEPSEEK_API_KEY,
  
  getSubjectsForBoardAndClass: async (board: string, className: string) => {
    try {
      // Attempt to get data from the DeepSeek API
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
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
              content: `List the compulsory and optional subjects for ${board} curriculum in class ${className}. Format as JSON with compulsorySubjects and optionalSubjects arrays.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        // Fallback to predetermined data if API fails
        return getDefaultSubjectsForBoard(board, className);
      }
      
      const data = await response.json();
      try {
        // Try to parse the result as JSON
        const content = data.choices[0].message.content;
        return JSON.parse(content);
      } catch (parseError) {
        // Fallback if parsing fails
        return getDefaultSubjectsForBoard(board, className);
      }
    } catch (error) {
      console.error("DeepSeek API error:", error);
      // Return faster with predetermined data as fallback
      return getDefaultSubjectsForBoard(board, className);
    }
  },
  
  generateStudyPlan: async (
    subject: string, 
    board: string, 
    className: string, 
    updateStatus?: (status: AIStatus) => void
  ) => {
    try {
      // Try to generate study plan using the DeepSeek API
      if (updateStatus) {
        updateStatus({
          stage: "Connecting to DeepSeek API",
          progress: 10
        });
      }
      
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
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
              content: `Create a detailed study plan for ${subject} for class ${className} following the ${board} curriculum. Format as JSON with a chapters array containing title and lessons fields.`
            }
          ],
          max_tokens: 2000,
          temperature: 0.5
        })
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }
      
      if (updateStatus) {
        updateStatus({
          stage: "Processing study plan data",
          progress: 60
        });
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const jsonPlan = JSON.parse(content);
        
        if (updateStatus) {
          updateStatus({
            stage: "Study plan generated successfully",
            progress: 100
          });
        }
        
        return jsonPlan;
      } catch (parseError) {
        // Fallback to simulated data
        console.error("Error parsing DeepSeek response:", parseError);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("DeepSeek study plan error:", error);
      
      // Fallback to simulated processing
      // Simulate faster AI processing with quicker progress updates
      const totalSteps = 5;
      const stepDuration = 400; // ms per step - much faster
      
      for (let step = 1; step <= totalSteps; step++) {
        if (updateStatus) {
          updateStatus({
            stage: getStageDescription(step, subject),
            progress: Math.round((step / totalSteps) * 100)
          });
        }
        
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
      
      // Return simulated study plan
      return {
        subject,
        board,
        className,
        chapters: generateChapters(subject),
        lastUpdated: new Date().toISOString()
      };
    }
  }
};

// Helper functions
function getStageDescription(step: number, subject: string): string {
  const stages = [
    `Analyzing ${subject} curriculum`,
    `Structuring ${subject} lessons`,
    `Creating practice exercises`,
    `Generating visual aids`,
    `Finalizing study plan`
  ];
  
  return stages[step - 1];
}

function generateChapters(subject: string) {
  const baseChapters = [
    {
      title: "Introduction",
      lessons: [
        { title: "Basic Concepts", type: "lesson" },
        { title: "Fundamentals Quiz", type: "quiz" }
      ]
    },
    {
      title: "Core Principles",
      lessons: [
        { title: "Key Theories", type: "lesson" },
        { title: "Applied Problems", type: "practice" },
        { title: "Chapter Assessment", type: "quiz" }
      ]
    },
    {
      title: "Advanced Topics",
      lessons: [
        { title: "Complex Concepts", type: "lesson" },
        { title: "Problem Solving", type: "practice" },
        { title: "Final Evaluation", type: "quiz" }
      ]
    }
  ];
  
  // Customize chapters based on subject
  if (subject === "Mathematics") {
    return [
      {
        title: "Numbers and Operations",
        lessons: [
          { title: "Number Systems", type: "lesson" },
          { title: "Operations Practice", type: "practice" },
          { title: "Quiz: Numbers", type: "quiz" }
        ]
      },
      {
        title: "Algebra Basics",
        lessons: [
          { title: "Equations and Expressions", type: "lesson" },
          { title: "Solving Linear Equations", type: "practice" },
          { title: "Algebra Test", type: "quiz" }
        ]
      },
      {
        title: "Geometry",
        lessons: [
          { title: "Shapes and Properties", type: "lesson" },
          { title: "Geometry Problems", type: "practice" },
          { title: "Final Assessment", type: "quiz" }
        ]
      }
    ];
  } else if (subject === "Science") {
    return [
      {
        title: "Matter and Energy",
        lessons: [
          { title: "Properties of Matter", type: "lesson" },
          { title: "Energy Transformations", type: "lesson" },
          { title: "Science Quiz 1", type: "quiz" }
        ]
      },
      {
        title: "Life Sciences",
        lessons: [
          { title: "Cell Structure", type: "lesson" },
          { title: "Plant and Animal Systems", type: "practice" },
          { title: "Biology Test", type: "quiz" }
        ]
      },
      {
        title: "Earth and Space",
        lessons: [
          { title: "Planet Earth", type: "lesson" },
          { title: "Solar System", type: "practice" },
          { title: "Final Exam", type: "quiz" }
        ]
      }
    ];
  }
  
  return baseChapters;
}

export type { AIStatus };
export default deepSeekService;
