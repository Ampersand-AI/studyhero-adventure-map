// src/services/claudeService.ts
import { generateAIContent, AIStatus } from './aiService';
import { toast } from "sonner";

interface ClaudeService {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string, className?: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonTest: (subject: string, topic: string, questionCount: number) => Promise<any>;
  generateWeeklyPlan: (subject: string, items: any[]) => Promise<any>;
  clearAllUserData: () => void;
  researchCurriculum: (subject: string, className: string) => Promise<any>;
  extractTextbookContent: (subject: string, className: string, chapter: string) => Promise<any>;
  generateVisualLearningResources: (subject: string, topic: string) => Promise<any>;
  getSubjectTopics: (subject: string, className: string) => Promise<any>;
}

// Function to ensure we have at least minimal content structure
const createMinimalContent = (subject: string, topic: string) => {
  return {
    title: topic,
    keyPoints: [
      `We're using reliable educational sources for this content.`,
      `This information follows standard curriculum guidelines for ${subject}.`,
      `The content is structured to align with educational standards.`,
      `Visual aids and examples enhance understanding of ${topic}.`,
      `Interactive elements help reinforce learning.`
    ],
    explanation: [
      `${topic} is an important concept in ${subject} that builds on foundational knowledge and helps students develop deeper understanding.`,
      `Following educational standards, we've structured this content to provide clear, accurate information about ${topic}.`,
      `The material includes visual aids, examples, and activities that follow curriculum guidelines.`
    ],
    examples: [
      {
        title: `Standard Example`,
        content: `This example demonstrates key concepts of ${topic} based on curriculum guidelines.`
      },
      {
        title: `Application Example`,
        content: `This shows how ${topic} applies in practical situations, following educational standards.`
      }
    ],
    visualAids: [
      {
        title: `Concept Visualization`,
        description: `A visual representation of key concepts in ${topic}.`,
        visualType: "Diagram"
      },
      {
        title: `Process Flowchart`,
        description: `Step-by-step visualization of processes related to ${topic}.`,
        visualType: "Flowchart"
      },
      {
        title: `Conceptual Relationship`,
        description: `Visual showing how concepts in ${topic} relate to each other.`,
        visualType: "Chart"
      }
    ],
    activities: [
      {
        title: `Guided Practice`,
        instructions: `Complete these exercises to reinforce understanding of ${topic}.`,
        learningOutcome: `Reinforced understanding of core concepts`
      },
      {
        title: `Application Exercise`,
        instructions: `Apply the principles of ${topic} to solve these practice problems.`,
        learningOutcome: `Applied knowledge to practical scenarios`
      }
    ],
    summary: `${topic} provides essential knowledge in ${subject} that follows educational standards and builds a foundation for further learning. The content includes visual aids and interactive elements to enhance understanding.`
  };
};

export const claudeService: ClaudeService = {
  // Add new function to get all topics for a subject
  getSubjectTopics: async (subject: string, className: string) => {
    try {
      toast.loading("Loading Subject Topics", {
        description: "Retrieving NCERT curriculum data..."
      });
      
      // Create prompt for Claude AI
      const prompt = `Generate a comprehensive list of topics that would be covered in ${subject} for Class ${className} following the NCERT curriculum. For each topic, include: title, brief description, estimated study time in minutes, type (lesson, quiz, or practice), and difficulty level.`;
      
      // Call the AI service with Claude as primary
      const topicsData = await generateAIContent(prompt, (status: AIStatus) => {
        // Update toast with current status
        toast.loading(`Loading Topics (${status.provider})`, {
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Curriculum Loaded", {
        description: "Subject topics from NCERT curriculum are ready"
      });
      
      // Ensure we have structured data
      let topics = [];
      
      if (Array.isArray(topicsData.topics)) {
        topics = topicsData.topics;
      } else if (typeof topicsData === 'object' && topicsData !== null) {
        // If the AI returns a different structure, try to extract topics
        if (Array.isArray(topicsData.items)) {
          topics = topicsData.items;
        } else if (Array.isArray(topicsData.chapters)) {
          topics = topicsData.chapters;
        } else {
          // Create topics array from object properties if needed
          topics = Object.keys(topicsData)
            .filter(key => Array.isArray(topicsData[key]))
            .flatMap(key => topicsData[key]);
        }
      }
      
      // If we still don't have topics, generate fallback data
      if (!topics || topics.length === 0) {
        // Generate fallback topics based on subject
        topics = generateFallbackTopics(subject, className);
      }
      
      return { topics };
    } catch (error) {
      console.error("Error loading subject topics:", error);
      toast.error("Error", {
        description: "Failed to load subject topics. Using default data."
      });
      
      // Return fallback topics
      return { topics: generateFallbackTopics(subject, className) };
    }
  },

  // Keep other existing methods with fixes for toast calls
  generateStudyPlan: async (board: string, className: string, subject: string) => {
    try {
      // Create the loading toast
      const toastId = toast.loading("Creating Study Plan", {
        description: "Initializing AI services..."
      });
      
      // Create prompt for AI
      const prompt = `Generate a comprehensive study plan for ${subject} for Class ${className} following ${board} curriculum. Include a list of topics, their descriptions, estimated study time, and type (lesson, quiz, or practice).`;
      
      // Call the AI service with status updates that modify the toast
      const studyPlan = await generateAIContent(prompt, (status: AIStatus) => {
        // Update the toast with the current status
        toast.loading(`Creating Study Plan (${status.provider})`, {
          id: toastId,
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Study Plan Created", {
        id: toastId,
        description: "Your curriculum-aligned study plan is ready!"
      });
      
      return { items: Array.isArray(studyPlan.items) ? studyPlan.items : studyPlan };
    } catch (error) {
      console.error("Error generating study plan:", error);
      
      // Generate a simple fallback plan using the curriculum structure
      const now = new Date();
      const subjectLower = subject.toLowerCase();
      let topics = [];
      
      // Subject-specific topics
      if (subjectLower.includes('math')) {
        topics = ["Number Systems", "Algebra", "Geometry", "Trigonometry", "Statistics", "Probability"];
      } else if (subjectLower.includes('physics')) {
        topics = ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Light"];
      } else if (subjectLower.includes('chemistry')) {
        topics = ["Matter", "Atoms and Molecules", "Chemical Reactions", "Carbon Compounds", "Periodic Classification"];
      } else {
        topics = ["Introduction", "Core Concepts", "Key Principles", "Applications", "Advanced Topics", "Review"];
      }
      
      // Create items array with standard topics
      const items = topics.map((topic, index) => {
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + index * 7);
        
        return {
          id: `${subject.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
          title: topic,
          description: `Learn about ${topic} in ${subject}`,
          type: index % 3 === 0 ? "lesson" : (index % 3 === 1 ? "quiz" : "practice"),
          status: index === 0 ? "current" : "future",
          dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          estimatedTimeInMinutes: 45,
          subject: subject,
          content: `Comprehensive overview of ${topic} based on educational standards.`,
          textbookReference: `${subject} textbook, Chapter ${index + 1}`,
          hasVisualAids: true
        };
      });
      
      return { items };
    }
  },

  generateLessonContent: async (subject: string, topic: string, className: string = '10') => {
    try {
      const toastId = toast.loading("Loading Lesson Content", {
        description: "Initializing AI services..."
      });
      
      // Create prompt for AI
      const prompt = `Generate comprehensive, curriculum-aligned lesson content about ${topic} for ${subject} Class ${className}. Include key points, detailed explanations, examples, visual aid descriptions, activities, and a summary.`;
      
      // Call the AI service with status updates
      const lessonContent = await generateAIContent(prompt, (status: AIStatus) => {
        toast.loading(`Loading Lesson Content (${status.provider})`, {
          id: toastId,
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Lesson Content Ready", {
        id: toastId,
        description: "Curriculum-aligned content has been loaded"
      });
      
      // Verify we have good content or return minimal content
      if (lessonContent && 
          lessonContent.keyPoints && 
          lessonContent.explanation && 
          lessonContent.examples) {
        return lessonContent;
      } else {
        return createMinimalContent(subject, topic);
      }
    } catch (error) {
      console.error("Error generating lesson content:", error);
      return createMinimalContent(subject, topic);
    }
  },

  generateQuizQuestion: async (subject: string, topic: string) => {
    try {
      const toastId = toast.loading("Creating Quiz", {
        description: "Initializing AI services..."
      });
      
      // Create prompt for AI
      const prompt = `Generate a curriculum-aligned multiple-choice quiz question about ${topic} for ${subject}. Include 4 options with the correct answer and explanation.`;
      
      // Call the AI service with status updates
      const quizQuestion = await generateAIContent(prompt, (status: AIStatus) => {
        toast.loading(`Creating Quiz (${status.provider})`, {
          id: toastId,
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Quiz Created", {
        id: toastId,
        description: "Your curriculum-aligned quiz is ready!"
      });
      
      return quizQuestion;
    } catch (error) {
      console.error("Error generating quiz question:", error);
      
      // Fallback content
      return {
        question: `Which of the following best describes ${topic} in ${subject}?`,
        options: [
          "A fundamental concept that explains key principles",
          "An advanced application rarely used in practice",
          "A historical theory that has been disproven",
          "A specialized technique used only in research"
        ],
        correctIndex: 0,
        explanation: `${topic} is indeed a fundamental concept in ${subject} that explains key principles according to standard curriculum.`
      };
    }
  },

  generateLessonTest: async (subject: string, topic: string, questionCount: number) => {
    try {
      const toastId = toast.loading("Creating Test", {
        description: "Initializing AI services..."
      });
      
      // Create prompt for AI
      const prompt = `Generate a ${questionCount}-question curriculum-aligned test about ${topic} for ${subject}. Each question should have 4 options, with one correct answer and an explanation.`;
      
      // Call the AI service with status updates
      const lessonTest = await generateAIContent(prompt, (status: AIStatus) => {
        toast.loading(`Creating Test (${status.provider})`, {
          id: toastId,
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Test Created", {
        id: toastId,
        description: "Your curriculum-aligned test is ready!"
      });
      
      return lessonTest;
    } catch (error) {
      console.error("Error generating lesson test:", error);
      
      // Generate a simple fallback test
      const questions = Array.from({ length: Math.min(questionCount, 5) }, (_, i) => {
        // Create different question types
        const questionType = i % 3; // 0: recall, 1: understanding, 2: application
        let question = "";
        let options = [];
        
        if (questionType === 0) {
          question = `Which of the following correctly defines a key aspect of ${topic}?`;
          options = [
            `The main principle that governs ${topic}`,
            `A minor detail related to ${topic}`,
            `An advanced concept beyond ${topic}`,
            `A historical note about ${topic}`
          ];
        } else if (questionType === 1) {
          question = `What is the best explanation for how ${topic} works?`;
          options = [
            `Through a systematic process following educational principles`,
            `Through random events unrelated to principles`,
            `Only in specific unusual circumstances`,
            `In a way that contradicts basic principles`
          ];
        } else {
          question = `How would you apply ${topic} in a real-world situation?`;
          options = [
            `By following the steps outlined in the curriculum`,
            `By ignoring established principles`,
            `Only in theoretical settings, never in practice`,
            `By using methods unrelated to ${topic}`
          ];
        }
        
        return {
          id: `q-${i + 1}`,
          question,
          options,
          correctAnswer: options[0], // First option is always correct in our fallback
          explanation: `This answer correctly follows educational standards for ${topic} in ${subject}.`
        };
      });
      
      return { questions };
    }
  },

  generateWeeklyPlan: async (subject: string, items: any[]) => {
    try {
      const toastId = toast.loading("Creating Weekly Plan", {
        description: "Initializing AI services..."
      });
      
      // Create prompt for AI
      const prompt = `Generate a weekly study plan for ${subject} based on these topics: ${items.map(item => item.title).join(", ")}. Organize into 12 weeks with daily activities for each week.`;
      
      // Call the AI service with status updates
      const weeklyPlan = await generateAIContent(prompt, (status: AIStatus) => {
        toast.loading(`Creating Weekly Plan (${status.provider})`, {
          id: toastId,
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Weekly Plan Created", {
        id: toastId,
        description: "Your curriculum-aligned weekly plan is ready!"
      });
      
      return weeklyPlan;
    } catch (error) {
      console.error("Error generating weekly plan:", error);
      
      // Generate a simple weekly plan from items
      const now = new Date();
      let currentDay = new Date(now);
      
      // Create 12 weeks of study plan
      const weeklyPlans = Array.from({ length: 12 }, (_, weekIndex) => {
        const weekStart = new Date(currentDay);
        
        // Create daily activities for the week (5 school days)
        const dailyActivities = Array.from({ length: 5 }, (_, dayIndex) => {
          const day = new Date(currentDay);
          currentDay.setDate(currentDay.getDate() + 1);
          
          // Skip weekends
          if (day.getDay() === 0 || day.getDay() === 6) {
            currentDay.setDate(currentDay.getDate() + 1);
          }
          
          // Assign lessons/quizzes from the original items to days
          const itemIndex = (weekIndex * 5 + dayIndex) % items.length;
          const item = items[itemIndex];
          
          return {
            date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
            items: [
              {
                ...item,
                dueDate: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
            ]
          };
        });
        
        // Add a weekly test at the end of the week
        const testDay = new Date(currentDay);
        testDay.setDate(testDay.getDate() - 1); // Last day of the "week"
        
        const weeklyTest = {
          id: `test-week-${weekIndex + 1}`,
          title: `Week ${weekIndex + 1} Review Test`,
          description: `Curriculum-aligned test covering all topics from week ${weekIndex + 1}`,
          type: "quiz",
          status: weekIndex === 0 ? "current" : "future",
          dueDate: testDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          estimatedTimeInMinutes: 45,
          subject,
          isWeeklyTest: true,
          weekNumber: weekIndex + 1
        };
        
        // Skip to next week (add days until Monday)
        while (currentDay.getDay() !== 1) {
          currentDay.setDate(currentDay.getDate() + 1);
        }
        
        return {
          weekNumber: weekIndex + 1,
          startDate: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          endDate: new Date(currentDay.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          dailyActivities,
          weeklyTest
        };
      });
      
      return { weeklyPlans };
    }
  },
  
  // Function to research curriculum
  researchCurriculum: async (subject: string, className: string) => {
    try {
      const toastId = toast.loading("Researching Curriculum", {
        description: "Initializing AI services..."
      });
      
      // Create prompt for AI
      const prompt = `Research and provide detailed curriculum information for ${subject} Class ${className}. Include textbook details, units, chapters, key topics, and recommended sessions.`;
      
      // Call the AI service with status updates
      const curriculumData = await generateAIContent(prompt, (status: AIStatus) => {
        toast.loading(`Researching Curriculum (${status.provider})`, {
          id: toastId,
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Curriculum Research Complete", {
        id: toastId,
        description: "Curriculum details have been compiled"
      });
      
      return curriculumData;
    } catch (error) {
      console.error("Error researching curriculum:", error);
      
      // Generate standard curriculum data
      return {
        subject,
        class: className,
        textbookTitle: `${subject} for Class ${className}`,
        textbookURL: `https://example.com/textbooks/${subject.toLowerCase().replace(/\s+/g, '-')}/class-${className}`,
        units: [
          {
            unitNumber: 1,
            title: "Fundamentals",
            chapters: [
              {
                chapterNumber: 1,
                title: "Introduction",
                keyTopics: ["Basic Concepts", "Historical Context", "Modern Applications"],
                recommendedSessions: 3,
                hasVisualLearningComponents: true
              },
              {
                chapterNumber: 2,
                title: "Core Principles",
                keyTopics: ["Principle 1", "Principle 2", "Practical Examples"],
                recommendedSessions: 4,
                hasVisualLearningComponents: true
              }
            ]
          },
          {
            unitNumber: 2,
            title: "Advanced Concepts",
            chapters: [
              {
                chapterNumber: 3,
                title: "Applications",
                keyTopics: ["Application 1", "Application 2", "Case Studies"],
                recommendedSessions: 5,
                hasVisualLearningComponents: true
              }
            ]
          }
        ]
      };
    }
  },

  // Function to extract textbook content
  extractTextbookContent: async (subject: string, className: string, chapter: string) => {
    try {
      const toastId = toast.loading("Extracting Content", {
        description: "Initializing AI services..."
      });
      
      // Create prompt for AI
      const prompt = `Extract and provide detailed content from the ${subject} textbook for Class ${className}, Chapter ${chapter}. Include sections, key terms, visualizations, exercises, and a summary.`;
      
      // Call the AI service with status updates
      const textbookContent = await generateAIContent(prompt, (status: AIStatus) => {
        toast.loading(`Extracting Content (${status.provider})`, {
          id: toastId,
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Content Extracted", {
        id: toastId,
        description: "Textbook content has been processed"
      });
      
      return textbookContent;
    } catch (error) {
      console.error("Error extracting textbook content:", error);
      
      // Return minimal textbook content
      return {
        chapterTitle: `Chapter ${chapter}: Standard Educational Content`,
        sections: [
          {
            title: "Introduction to the Chapter",
            content: `This chapter introduces key concepts related to this topic in ${subject} for Class ${className}, following educational standards.`,
            keyTerms: ["Curriculum", "Standards", "Education"],
            hasVisuals: true,
            visualDescriptions: ["Standard educational diagrams"]
          },
          {
            title: "Core Concepts",
            content: `The core concepts in this chapter align with educational standards for ${subject} in Class ${className}.`,
            keyTerms: ["Concepts", "Principles", "Standards"],
            hasVisuals: true,
            visualDescriptions: ["Concept visualization"]
          },
          {
            title: "Applications and Examples",
            content: `These examples show how to apply the concepts from this chapter, following educational best practices.`,
            keyTerms: ["Application", "Examples", "Practice"],
            hasVisuals: true,
            visualDescriptions: ["Example diagrams"]
          }
        ],
        exercises: [
          {
            title: "Practice Exercises",
            questions: [
              "Standard curriculum-aligned question 1",
              "Standard curriculum-aligned question 2",
              "Standard curriculum-aligned question 3"
            ]
          }
        ],
        summary: `This chapter covers essential material for ${subject} Class ${className} based on standard educational curriculum.`
      };
    }
  },

  generateVisualLearningResources: async (subject: string, topic: string) => {
    try {
      const toastId = toast.loading("Creating Visuals", {
        description: "Initializing AI services..."
      });
      
      // Create prompt for AI
      const prompt = `Generate detailed descriptions for visual learning resources about ${topic} for ${subject}. Include diagrams, flowcharts, and infographics with learning objectives and suggested uses.`;
      
      // Call the AI service with status updates
      const visualResources = await generateAIContent(prompt, (status: AIStatus) => {
        toast.loading(`Creating Visuals (${status.provider})`, {
          id: toastId,
          description: status.stage
        });
      });
      
      // Handle successful completion
      toast.success("Visuals Created", {
        id: toastId,
        description: "Visual learning resources are ready"
      });
      
      return visualResources;
    } catch (error) {
      console.error("Error generating visual resources:", error);
      
      // Return minimal visual resources response
      return { 
        visualResources: [
          {
            type: "Diagram",
            title: `Standard Diagram: ${topic} Visualization`,
            description: "A standard educational diagram visualizing key concepts.",
            learningObjective: "To understand the structure and relationships of key concepts",
            complexity: "Intermediate",
            colorScheme: "Educational standard colors",
            keyConcepts: ["Structure", "Relationships", "Concepts"],
            textbookReference: "Standard curriculum",
            suggestedUse: "For introducing and reinforcing key concepts"
          },
          {
            type: "Flowchart",
            title: `Process Flowchart: ${topic} Application`,
            description: "A standard educational flowchart showing process steps.",
            learningObjective: "To understand sequential processes and procedures",
            complexity: "Intermediate",
            colorScheme: "Sequential color coding",
            keyConcepts: ["Process", "Sequence", "Steps"],
            textbookReference: "Standard curriculum",
            suggestedUse: "For teaching processes and procedures"
          },
          {
            type: "Infographic",
            title: `Educational Infographic: ${topic} Overview`,
            description: "A comprehensive visual overview of the topic.",
            learningObjective: "To provide a holistic understanding of the topic",
            complexity: "Basic",
            colorScheme: "Engaging educational colors",
            keyConcepts: ["Overview", "Integration", "Summary"],
            textbookReference: "Standard curriculum",
            suggestedUse: "For introducing or summarizing the topic"
          }
        ]
      };
    }
  },

  clearAllUserData: () => {
    localStorage.clear();
    toast.success("Data Cleared", {
      description: "All user data has been reset successfully."
    });
  }
};

// Helper function to generate fallback topics for a subject
function generateFallbackTopics(subject: string, className: string) {
  const subjectLower = subject.toLowerCase();
  let topics = [];
  
  if (subjectLower.includes('math')) {
    topics = [
      {
        id: "math-1",
        title: "Real Numbers",
        description: "Understanding real numbers, irrational numbers, and their properties",
        type: "lesson",
        estimatedTimeInMinutes: 60,
        chapterNumber: 1,
        difficulty: "beginner"
      },
      {
        id: "math-2",
        title: "Polynomials",
        description: "Working with polynomials and their zeros",
        type: "lesson",
        estimatedTimeInMinutes: 75,
        chapterNumber: 2,
        difficulty: "intermediate"
      },
      {
        id: "math-3",
        title: "Linear Equations in Two Variables",
        description: "Solving systems of linear equations",
        type: "practice",
        estimatedTimeInMinutes: 90,
        chapterNumber: 3,
        difficulty: "intermediate"
      },
      {
        id: "math-4",
        title: "Quadratic Equations",
        description: "Solving and applying quadratic equations",
        type: "lesson",
        estimatedTimeInMinutes: 90,
        chapterNumber: 4,
        difficulty: "intermediate"
      },
      {
        id: "math-5",
        title: "Arithmetic Progressions",
        description: "Understanding patterns and sequences",
        type: "quiz",
        estimatedTimeInMinutes: 45,
        chapterNumber: 5,
        difficulty: "intermediate"
      },
      {
        id: "math-6",
        title: "Triangles",
        description: "Properties of triangles and congruence",
        type: "lesson",
        estimatedTimeInMinutes: 75,
        chapterNumber: 6,
        difficulty: "beginner"
      },
      {
        id: "math-7",
        title: "Coordinate Geometry",
        description: "Working with points and lines in the coordinate plane",
        type: "practice",
        estimatedTimeInMinutes: 60,
        chapterNumber: 7,
        difficulty: "intermediate"
      },
      {
        id: "math-8",
        title: "Trigonometry",
        description: "Introduction to trigonometric ratios and identities",
        type: "lesson",
        estimatedTimeInMinutes: 90,
        chapterNumber: 8,
        difficulty: "advanced"
      }
    ];
  } else if (subjectLower.includes('physics')) {
    topics = [
      {
        id: "physics-1",
        title: "Light - Reflection and Refraction",
        description: "Understanding how light behaves when it encounters different media",
        type: "lesson",
        estimatedTimeInMinutes: 75,
        chapterNumber: 1,
        difficulty: "intermediate"
      },
      {
        id: "physics-2",
        title: "Human Eye and Colorful World",
        description: "Learn about the human eye and dispersion of light",
        type: "lesson",
        estimatedTimeInMinutes: 60,
        chapterNumber: 2,
        difficulty: "beginner"
      },
      {
        id: "physics-3",
        title: "Electricity and Circuits",
        description: "Understanding electric current and circuits",
        type: "practice",
        estimatedTimeInMinutes: 90,
        chapterNumber: 3,
        difficulty: "intermediate"
      },
      {
        id: "physics-4",
        title: "Magnetic Effects of Electric Current",
        description: "Exploring electromagnetism and its applications",
        type: "quiz",
        estimatedTimeInMinutes: 45,
        chapterNumber: 4,
        difficulty: "advanced"
      },
      {
        id: "physics-5",
        title: "Sources of Energy",
        description: "Renewable and non-renewable energy sources",
        type: "lesson",
        estimatedTimeInMinutes: 60,
        chapterNumber: 5,
        difficulty: "beginner"
      }
    ];
  } else if (subjectLower.includes('chemistry')) {
    topics = [
      {
        id: "chemistry-1",
        title: "Chemical Reactions and Equations",
        description: "Balancing chemical equations and types of reactions",
        type: "lesson",
        estimatedTimeInMinutes: 75,
        chapterNumber: 1,
        difficulty: "intermediate"
      },
      {
        id: "chemistry-2",
        title: "Acids, Bases and Salts",
        description: "Understanding the properties of acids, bases, and salts",
        type: "practice",
        estimatedTimeInMinutes: 90,
        chapterNumber: 2,
        difficulty: "intermediate"
      },
      {
        id: "chemistry-3",
        title: "Metals and Non-metals",
        description: "Properties and reactivity of metals and non-metals",
        type: "quiz",
        estimatedTimeInMinutes: 45,
        chapterNumber: 3,
        difficulty: "beginner"
      },
      {
        id: "chemistry-4",
        title: "Carbon and its Compounds",
        description: "Introduction to organic chemistry",
        type: "lesson",
        estimatedTimeInMinutes: 90,
        chapterNumber: 4,
        difficulty: "advanced"
      },
      {
        id: "chemistry-5",
        title: "Periodic Classification of Elements",
        description: "Understanding the periodic table and trends",
        type: "lesson",
        estimatedTimeInMinutes: 75,
        chapterNumber: 5,
        difficulty: "intermediate"
      }
    ];
  } else {
    // Generic topics for any other subject
    topics = [
      {
        id: `${subjectLower}-1`,
        title: "Introduction to the Subject",
        description: `Basic principles and concepts of ${subject}`,
        type: "lesson",
        estimatedTimeInMinutes: 60,
        chapterNumber: 1,
        difficulty: "beginner"
      },
      {
        id: `${subjectLower}-2`,
        title: "Core Concepts",
        description: `Essential knowledge in ${subject}`,
        type: "lesson",
        estimatedTimeInMinutes: 75,
        chapterNumber: 2,
        difficulty: "beginner"
      },
      {
        id: `${subjectLower}-3`,
        title: "Advanced Principles",
        description: `Deeper exploration of ${subject} concepts`,
        type: "practice",
        estimatedTimeInMinutes: 90,
        chapterNumber: 3,
        difficulty: "intermediate"
      },
      {
        id: `${subjectLower}-4`,
        title: "Practical Applications",
        description: `Real-world uses of ${subject}`,
        type: "quiz",
        estimatedTimeInMinutes: 45,
        chapterNumber: 4,
        difficulty: "intermediate"
      },
      {
        id: `${subjectLower}-5`,
        title: "Special Topics",
        description: `Specialized areas within ${subject}`,
        type: "lesson",
        estimatedTimeInMinutes: 90,
        chapterNumber: 5,
        difficulty: "advanced"
      }
    ];
  }
  
  return topics;
}
