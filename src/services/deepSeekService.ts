
// src/services/deepSeekService.ts
// Just optimizing the content generation to be faster

interface AIStatus {
  stage: string;
  progress: number;
}

// Mock data for speed optimization
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

// Simulated DeepSeek Service
const deepSeekService = {
  apiKey: 'sk-a53303b3873b42be8910c5fd16e0ad4a',
  
  getSubjectsForBoardAndClass: async (board: string, className: string) => {
    // Return faster with predetermined data
    return getDefaultSubjectsForBoard(board, className);
  },
  
  generateStudyPlan: async (
    subject: string, 
    board: string, 
    className: string, 
    updateStatus?: (status: AIStatus) => void
  ) => {
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
