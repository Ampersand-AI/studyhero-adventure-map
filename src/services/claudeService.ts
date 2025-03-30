
// src/services/claudeService.ts
import * as openaiService from './openaiService';
import { toast } from "@/hooks/use-toast";

interface ClaudeService {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonTest: (subject: string, topic: string, questionCount: number) => Promise<any>;
  generateWeeklyPlan: (subject: string, items: any[]) => Promise<any>;
  clearAllUserData: () => void;
  researchCurriculum: (subject: string, className: string) => Promise<any>;
}

// Mock data for fallback when API calls fail
const createMockData = (subject: string) => {
  // Create a unique set of items based on the subject
  const getTopics = (subject: string) => {
    switch(subject.toLowerCase()) {
      case 'mathematics':
        return ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry', 'Number Theory'];
      case 'science':
        return ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Earth Science', 'Ecology'];
      case 'english':
        return ['Grammar', 'Literature', 'Writing', 'Comprehension', 'Poetry', 'Vocabulary'];
      case 'social studies':
        return ['History', 'Geography', 'Civics', 'Economics', 'Sociology', 'Political Science'];
      case 'physics':
        return ['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Optics', 'Modern Physics', 'Waves'];
      case 'chemistry':
        return ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry', 'Nuclear Chemistry'];
      case 'biology':
        return ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Human Physiology', 'Microbiology'];
      default:
        return ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5', 'Topic 6'];
    }
  };

  const topics = getTopics(subject);
  const today = new Date();
  
  return topics.map((topic, index) => {
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + index * 2);
    
    const types = ["lesson", "quiz", "practice"];
    
    return {
      id: `${subject}-${index}`,
      title: topic,
      description: `Learn about ${topic} in ${subject}`,
      type: types[index % 3],
      status: index === 0 ? "current" : "future",
      dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      content: `This is sample content for ${topic} in ${subject}`,
      estimatedTimeInMinutes: 30 + (index * 10),
      subject,
      textbookReference: `NCERT ${subject} Textbook, Chapter ${Math.floor(index/2) + 1}`
    };
  });
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
      
      // If OpenAI returns null (error occurred), fall back to mock data
      if (!studyPlan) {
        console.log("Using fallback mock data for study plan");
        const mockItems = createMockData(subject);
        return { items: mockItems };
      }
      
      return studyPlan;
    } catch (error) {
      console.error("Error generating study plan:", error);
      
      toast({
        title: "Error",
        description: "Failed to generate study plan. Using sample data instead.",
        variant: "destructive"
      });
      
      // Fallback to mock data in case of error
      return { items: createMockData(subject) };
    }
  },

  generateLessonContent: async (subject: string, topic: string) => {
    try {
      toast({
        title: "Loading Content",
        description: "Fetching NCERT-aligned lesson content...",
      });
      
      // Use OpenAI to generate the lesson content
      const lessonContent = await openaiService.generateLessonContent(subject, topic);
      
      // If OpenAI returns null (error occurred), fall back to mock data
      if (!lessonContent) {
        console.log("Using fallback mock data for lesson content");
        
        // Return properly formatted mock lesson content that matches the interface in Lesson.tsx
        return {
          title: topic,
          keyPoints: [
            `Key point 1 about ${topic} in ${subject} from NCERT`,
            `Key point 2 about ${topic} in ${subject} from NCERT`,
            `Key point 3 about ${topic} in ${subject} from NCERT`,
            `Key point 4 about ${topic} in ${subject} from NCERT`
          ],
          explanation: [
            `${topic} is an important concept in ${subject}. This paragraph provides an overview of the topic based on NCERT curriculum.`,
            `This paragraph explains the theoretical foundations of ${topic} and its significance in ${subject} as per NCERT guidelines.`,
            `Here we discuss practical applications of ${topic} in real-world scenarios following the NCERT approach.`
          ],
          examples: [
            {
              title: `Example 1: Basic ${topic}`,
              content: `This is a basic example of ${topic} in ${subject} from NCERT textbooks.`
            },
            {
              title: `Example 2: Advanced ${topic}`,
              content: `This is a more advanced example showing how ${topic} works in complex scenarios as taught in NCERT curriculum.`
            }
          ],
          visualAids: [
            {
              title: `${topic} Diagram`,
              description: `This diagram illustrates the main components of ${topic} as shown in NCERT books.`,
              visualType: "Diagram"
            },
            {
              title: `${topic} Process Flow`,
              description: `This visual aid shows the step-by-step process of ${topic} according to NCERT guidelines.`,
              visualType: "Flowchart"
            }
          ],
          activities: [
            {
              title: `Practice Activity 1`,
              instructions: `Complete this NCERT-style exercise to practice the basic concepts of ${topic}.`,
              learningOutcome: `Understand the fundamental principles of ${topic}.`
            },
            {
              title: `Practice Activity 2`,
              instructions: `This advanced activity based on NCERT patterns will help you master ${topic}.`,
              learningOutcome: `Apply ${topic} concepts to solve complex problems.`
            }
          ],
          textbookReferences: [
            {
              chapter: "3",
              pageNumbers: "45-48",
              description: `Main concepts of ${topic} are covered in this chapter section of the NCERT textbook.`
            },
            {
              chapter: "4",
              pageNumbers: "62-65",
              description: `Examples and exercises related to ${topic} can be found here.`
            }
          ],
          visualLearningResources: [
            {
              type: "Diagram",
              title: `${topic} Visual Representation`,
              description: `A diagram that helps visualize the key components of ${topic}.`
            },
            {
              type: "Interactive Activity",
              title: `${topic} Exploration`,
              description: `An interactive exercise to explore different aspects of ${topic}.`
            }
          ],
          summary: `In this lesson, you learned about ${topic} in ${subject} following the NCERT curriculum, including its key concepts, practical applications, and importance in the field.`
        };
      }
      
      return lessonContent;
    } catch (error) {
      console.error("Error generating lesson content:", error);
      toast({
        title: "Error",
        description: "Failed to load lesson content. Using sample data.",
        variant: "destructive"
      });
      
      // Fallback content with the same structure
      return {
        title: topic,
        keyPoints: [
          `Key point 1 about ${topic} in ${subject}`,
          `Key point 2 about ${topic} in ${subject}`
        ],
        explanation: [
          `${topic} is an important concept in ${subject}.`
        ],
        examples: [
          {
            title: `Example of ${topic}`,
            content: `This is a simple example of ${topic}.`
          }
        ],
        visualAids: [
          {
            title: `${topic} Visual Aid`,
            description: `A visual representation of ${topic}.`,
            visualType: "Diagram"
          }
        ],
        activities: [
          {
            title: `Practice Activity`,
            instructions: `Complete this exercise to practice ${topic}.`,
            learningOutcome: `Better understand ${topic}.`
          }
        ],
        summary: `In this lesson, you learned the basics of ${topic} in ${subject}.`
      };
    }
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
      toast({
        title: "Error",
        description: "Failed to generate quiz. Using sample question.",
        variant: "destructive"
      });
      
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
      toast({
        title: "Error",
        description: "Failed to generate test. Using sample questions.",
        variant: "destructive"
      });
      
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
        title: "Organizing Study Plan",
        description: "Creating weekly schedule for your NCERT curriculum...",
      });
      
      // Use OpenAI to generate the weekly plan
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
      toast({
        title: "Error",
        description: "Failed to create weekly plan. Using standard study plan.",
        variant: "destructive"
      });
      
      // Return empty plan in case of error
      return { weeklyPlans: [] };
    }
  },
  
  // New function to research curriculum
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
      toast({
        title: "Error",
        description: "Failed to research curriculum. Using standard data.",
        variant: "destructive"
      });
      
      return null;
    }
  },

  clearAllUserData: () => {
    localStorage.clear();
    toast({
      title: "Data Cleared",
      description: "All user data has been reset successfully.",
    });
  }
};
