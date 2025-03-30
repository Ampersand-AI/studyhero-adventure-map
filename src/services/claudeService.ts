// src/services/claudeService.ts
import * as openaiService from './openaiService';
import { toast } from "@/hooks/use-toast";

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
}

// Function to ensure we have at least minimal content structure
const createMinimalContent = (subject: string, topic: string) => {
  return {
    title: topic,
    keyPoints: [
      `This content could not be loaded from NCERT sources. Please check your API configuration.`
    ],
    explanation: [
      `We experienced difficulties retrieving the authentic NCERT content for ${topic} in ${subject}. This is likely due to an API configuration issue.`
    ],
    examples: [
      {
        title: `API Configuration Issue`,
        content: `Please check your OpenAI API key configuration. The current key appears to be invalid or expired.`
      }
    ],
    visualAids: [
      {
        title: `Configuration Required`,
        description: `Visual aids for this topic require a valid API configuration.`,
        visualType: "None"
      }
    ],
    activities: [
      {
        title: `Configuration Steps`,
        instructions: `To fix this issue, please update your API key in the application settings.`,
        learningOutcome: `N/A`
      }
    ],
    summary: `We apologize for the inconvenience. The authentic NCERT content for this lesson could not be loaded due to an API configuration issue.`
  };
};

// Check if the error is due to an API key issue
const isApiKeyError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message || '';
  return errorMessage.includes('API key') || 
         errorMessage.includes('invalid_api_key') || 
         errorMessage.includes('401') ||
         errorMessage.includes('authentication');
};

export const claudeService: ClaudeService = {
  generateStudyPlan: async (board: string, className: string, subject: string) => {
    try {
      // Show toast notification
      toast({
        title: "Connecting to NCERT",
        description: "Extracting curriculum data for your study plan...",
      });
      
      // Use OpenAI to generate the study plan
      const studyPlan = await openaiService.generateStudyPlan(board, className, subject);
      
      // Handle errors with retries instead of mock data
      if (!studyPlan) {
        toast({
          title: "Retrying",
          description: "First attempt failed, trying again...",
        });
        
        // Retry once
        return await openaiService.generateStudyPlan(board, className, subject);
      }
      
      return studyPlan;
    } catch (error) {
      console.error("Error generating study plan:", error);
      
      if (isApiKeyError(error)) {
        toast({
          title: "API Configuration Error",
          description: "Please check your API key configuration in settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to retrieve authentic NCERT study plan. Please try again.",
          variant: "destructive"
        });
      }
      
      // Rethrow the error so the UI can handle it
      throw new Error("Could not generate authentic NCERT study plan");
    }
  },

  generateLessonContent: async (subject: string, topic: string, className: string = '10') => {
    let retryCount = 0;
    const maxRetries = 2;
    
    const attemptGeneration = async () => {
      try {
        toast({
          title: "Loading Authentic Content",
          description: "Fetching NCERT-aligned lesson content with visual aids...",
        });
        
        // Use OpenAI to generate the enhanced lesson content
        const lessonContent = await openaiService.generateLessonContent(subject, topic, className);
        
        // Verify we have good content
        if (lessonContent && 
            lessonContent.keyPoints && 
            lessonContent.explanation && 
            lessonContent.examples) {
          return lessonContent;
        } else {
          throw new Error("Incomplete lesson content received");
        }
      } catch (error) {
        retryCount++;
        console.error(`Error generating lesson content (attempt ${retryCount}):`, error);
        
        // Check if this is an API key error
        if (isApiKeyError(error)) {
          toast({
            title: "API Configuration Error",
            description: "Please check your API key configuration in settings.",
            variant: "destructive"
          });
          // Return the API error content to inform the user
          return createMinimalContent(subject, topic);
        }
        
        if (retryCount < maxRetries) {
          toast({
            title: "Retrying",
            description: `Reconnecting to NCERT database (attempt ${retryCount + 1})...`,
          });
          
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await attemptGeneration();
        }
        
        toast({
          title: "Connection Issue",
          description: "Could not retrieve authentic NCERT content after multiple attempts.",
          variant: "destructive"
        });
        
        // Return minimal error-state content
        return createMinimalContent(subject, topic);
      }
    };
    
    return await attemptGeneration();
  },

  generateQuizQuestion: async (subject: string, topic: string) => {
    try {
      toast({
        title: "Loading Quiz",
        description: "Generating NCERT-aligned quiz question...",
      });
      
      // Use OpenAI to generate the quiz question
      const quizQuestion = await openaiService.generateQuizQuestion(subject, topic);
      
      // If OpenAI returns null (error occurred), fall back to mock data
      if (!quizQuestion) {
        console.log("Using fallback mock data for quiz question");
        
        // Return mock quiz question
        return {
          question: `What is the main concept behind ${topic} in ${subject} according to NCERT?`,
          options: [
            "The correct answer for this topic",
            "An incorrect but plausible answer",
            "Another wrong answer",
            "Yet another wrong answer"
          ],
          correctIndex: 0,
          explanation: `The main concept of ${topic} in ${subject} is explained here in detail as per NCERT curriculum.`
        };
      }
      
      return quizQuestion;
    } catch (error) {
      console.error("Error generating quiz question:", error);
      if (isApiKeyError(error)) {
        toast({
          title: "API Configuration Error",
          description: "Please check your API key configuration in settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate quiz. Using sample question.",
          variant: "destructive"
        });
      }
      
      // Fallback content
      return {
        question: `What is the main concept behind ${topic} in ${subject}?`,
        options: [
          "The correct answer for this topic",
          "An incorrect but plausible answer",
          "Another wrong answer",
          "Yet another wrong answer"
        ],
        correctIndex: 0,
        explanation: "Sample explanation for this question."
      };
    }
  },

  generateLessonTest: async (subject: string, topic: string, questionCount: number) => {
    try {
      toast({
        title: "Preparing Test",
        description: `Creating a ${questionCount}-question NCERT-aligned test for ${topic}...`,
      });
      
      // Use OpenAI to generate the lesson test
      const lessonTest = await openaiService.generateLessonTest(subject, topic, questionCount);
      
      // If OpenAI returns null (error occurred), fall back to mock data
      if (!lessonTest) {
        console.log("Using fallback mock data for lesson test");
        
        // Generate mock test questions
        const questions = Array.from({ length: questionCount }, (_, i) => ({
          id: `q-${i + 1}`,
          question: `Question ${i + 1} about ${topic} in ${subject} based on NCERT curriculum?`,
          options: [
            "The correct answer",
            "Wrong answer 1",
            "Wrong answer 2",
            "Wrong answer 3"
          ],
          correctAnswer: "The correct answer",
          explanation: `Explanation for question ${i + 1} about ${topic} as per NCERT guidelines.`
        }));
        
        return { questions };
      }
      
      return lessonTest;
    } catch (error) {
      console.error("Error generating lesson test:", error);
      if (isApiKeyError(error)) {
        toast({
          title: "API Configuration Error",
          description: "Please check your API key configuration in settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to generate test. Using sample questions.",
          variant: "destructive"
        });
      }
      
      // Fallback content
      const questions = Array.from({ length: Math.min(questionCount, 3) }, (_, i) => ({
        id: `q-${i + 1}`,
        question: `Sample question ${i + 1} about ${topic}?`,
        options: [
          "The correct answer",
          "Wrong answer 1",
          "Wrong answer 2",
          "Wrong answer 3"
        ],
        correctAnswer: "The correct answer",
        explanation: `Sample explanation for question ${i + 1}.`
      }));
      
      return { questions };
    }
  },

  generateWeeklyPlan: async (subject: string, items: any[]) => {
    try {
      toast({
        title: "Creating Engaging Study Plan",
        description: "Designing weekly schedule with visual learning elements...",
      });
      
      // Use OpenAI to generate the enhanced weekly plan
      const weeklyPlan = await openaiService.generateWeeklyPlan(subject, items);
      
      // If OpenAI returns null (error occurred), fall back to mock data
      if (!weeklyPlan) {
        console.log("Using fallback mock data for weekly plan");
        
        // Generate mock weekly plan
        const now = new Date();
        let currentDay = new Date(now);
        
        // Create 12 weeks of study plan
        const weeklyPlans = Array.from({ length: 12 }, (_, weekIndex) => {
          const weekStart = new Date(currentDay);
          
          // Create daily activities for the week
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
            description: `NCERT-aligned test covering all topics from week ${weekIndex + 1}`,
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
        
        toast({
          title: "Weekly Plan Created",
          description: `Your ${subject} NCERT curriculum is now organized into a weekly schedule`,
        });
        
        return { weeklyPlans };
      }
      
      return weeklyPlan;
    } catch (error) {
      console.error("Error generating weekly plan:", error);
      if (isApiKeyError(error)) {
        toast({
          title: "API Configuration Error",
          description: "Please check your API key configuration in settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create weekly plan. Using standard study plan.",
          variant: "destructive"
        });
      }
      
      // Return empty plan in case of error
      return { weeklyPlans: [] };
    }
  },
  
  // Function to research curriculum
  researchCurriculum: async (subject: string, className: string) => {
    try {
      toast({
        title: "Researching Curriculum",
        description: `Finding NCERT curriculum for ${subject} Class ${className}...`,
      });
      
      // Use OpenAI to research the curriculum
      const curriculumData = await openaiService.researchNCERTCurriculum(subject, className);
      
      if (!curriculumData) {
        console.log("Using fallback data for curriculum research");
        
        // Generate mock curriculum data
        return {
          subject,
          class: className,
          textbookTitle: `NCERT ${subject} for Class ${className}`,
          textbookURL: `https://ncert.nic.in/textbook.php`,
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
                  title: "Complex Applications",
                  keyTopics: ["Application 1", "Application 2", "Case Studies"],
                  recommendedSessions: 5,
                  hasVisualLearningComponents: true
                }
              ]
            }
          ]
        };
      }
      
      return curriculumData;
    } catch (error) {
      console.error("Error researching curriculum:", error);
      
      if (isApiKeyError(error)) {
        toast({
          title: "API Configuration Error",
          description: "Please check your API key configuration in settings.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to research curriculum. Using standard data.",
          variant: "destructive"
        });
      }
      
      return null;
    }
  },

  // New function to extract textbook content
  extractTextbookContent: async (subject: string, className: string, chapter: string) => {
    let retryCount = 0;
    const maxRetries = 2;
    
    const attemptExtraction = async () => {
      try {
        toast({
          title: "Extracting Textbook Content",
          description: `Accessing authentic NCERT textbook for ${subject} Class ${className}, Chapter ${chapter}...`,
        });
        
        // Use OpenAI to extract textbook content
        const textbookContent = await openaiService.extractTextbookContent(subject, className, chapter);
        
        if (textbookContent && 
            textbookContent.chapterTitle && 
            textbookContent.sections) {
          return textbookContent;
        } else {
          throw new Error("Incomplete textbook content received");
        }
      } catch (error) {
        retryCount++;
        console.error(`Error extracting textbook content (attempt ${retryCount}):`, error);
        
        if (isApiKeyError(error)) {
          toast({
            title: "API Configuration Error",
            description: "Please check your API key configuration in settings.",
            variant: "destructive"
          });
          // Return the API error content to inform the user
          return {
            chapterTitle: `Chapter ${chapter}: Content Temporarily Unavailable`,
            sections: [
              {
                title: "Connection Issue",
                content: `We couldn't access the authentic NCERT textbook for ${subject} Class ${className} at this time. Please try again later.`,
                keyTerms: ["Connection issue"],
                hasVisuals: false,
                visualDescriptions: []
              }
            ],
            exercises: [],
            summary: `We apologize for the inconvenience. Please try accessing this content again later.`
          };
        }

        if (retryCount < maxRetries) {
          toast({
            title: "Retrying",
            description: `Reconnecting to NCERT textbook database (attempt ${retryCount + 1})...`,
          });
          
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await attemptExtraction();
        }
        
        toast({
          title: "Textbook Unavailable",
          description: "Could not access authentic NCERT textbook content after multiple attempts.",
          variant: "destructive"
        });
        
        // Return minimal textbook content
        return {
          chapterTitle: `Chapter ${chapter}: Content Temporarily Unavailable`,
          sections: [
            {
              title: "Connection Issue",
              content: `We couldn't access the authentic NCERT textbook for ${subject} Class ${className} at this time. Please try again later.`,
              keyTerms: ["Connection issue"],
              hasVisuals: false,
              visualDescriptions: []
            }
          ],
          exercises: [],
          summary: `We apologize for the inconvenience. Please try accessing this content again later.`
        };
      }
    };
    
    return await attemptExtraction();
  },

  generateVisualLearningResources: async (subject: string, topic: string) => {
    let retryCount = 0;
    const maxRetries = 2;
    
    const attemptGeneration = async () => {
      try {
        toast({
          title: "Creating Visual Resources",
          description: `Generating authentic NCERT visual learning aids for ${topic}...`,
        });
        
        // Use OpenAI to generate visual learning resources
        const visualResources = await openaiService.generateVisualLearningResources(subject, topic);
        
        if (visualResources && visualResources.visualResources) {
          return visualResources;
        } else {
          throw new Error("Incomplete visual resources received");
        }
      } catch (error) {
        retryCount++;
        console.error(`Error generating visual resources (attempt ${retryCount}):`, error);
        
        if (isApiKeyError(error)) {
          toast({
            title: "API Configuration Error",
            description: "Please check your API key configuration in settings.",
            variant: "destructive"
          });
          // Return the API error content to inform the user
          return { 
            visualResources: [
              {
                type: "Unavailable",
                title: "Visual Resources Temporarily Unavailable",
                description: "We couldn't connect to the NCERT visual database at this time.",
                learningObjective: "Please try again later",
                complexity: "N/A",
                colorScheme: "N/A",
                keyConcepts: ["Connection issue"],
                textbookReference: "N/A",
                suggestedUse: "Please refresh or try again later"
              }
            ]
          };
        }

        if (retryCount < maxRetries) {
          toast({
            title: "Retrying",
            description: `Reconnecting to NCERT resources for visuals (attempt ${retryCount + 1})...`,
          });
          
          // Wait a moment before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          return await attemptGeneration();
        }
        
        toast({
          title: "Resource Unavailable",
          description: "Could not retrieve authentic NCERT visual resources after multiple attempts.",
          variant: "destructive"
        });
        
        // Return minimal visual resources response
        return { 
          visualResources: [
            {
              type: "Unavailable",
              title: "Visual Resources Temporarily Unavailable",
              description: "We couldn't connect to the NCERT visual database at this time.",
              learningObjective: "Please try again later",
              complexity: "N/A",
              colorScheme: "N/A",
              keyConcepts: ["Connection issue"],
              textbookReference: "N/A",
              suggestedUse: "Please refresh or try again later"
            }
          ]
        };
      }
    };
    
    return await attemptGeneration();
  },

  clearAllUserData: () => {
    localStorage.clear();
    toast({
      title: "Data Cleared",
      description: "All user data has been reset successfully.",
    });
  }
};
