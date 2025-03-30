
// src/services/claudeService.ts

import axios from 'axios';
import { toast } from "@/hooks/use-toast";

// Vite uses import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface ClaudeService {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonTest: (subject: string, topic: string, questionCount: number) => Promise<any>;
  clearAllUserData: () => void;
}

// Mock data for development - will be replaced with actual API calls
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
      subject
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
      
      // In a production environment, uncomment this to use the actual API
      // const response = await axios.post(`${API_BASE_URL}/api/claude/studyplan`, {
      //   board,
      //   className,
      //   subject
      // });
      // return response.data;
      
      // For now, use mock data
      const mockItems = createMockData(subject);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Study Plan Created",
        description: `Successfully generated study plan for ${subject}`,
      });
      
      return { items: mockItems };
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
        description: "Fetching lesson content...",
      });
      
      // In a production environment, uncomment this to use the actual API
      // const response = await axios.post(`${API_BASE_URL}/api/claude/lesson`, {
      //   subject,
      //   topic
      // });
      // return response.data;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock lesson content
      return {
        title: topic,
        subject: subject,
        introduction: `Welcome to this lesson on ${topic} in ${subject}.`,
        sections: [
          {
            title: "Key Concepts",
            content: `${topic} involves several key concepts that are fundamental to ${subject}.`
          },
          {
            title: "Examples",
            content: "Here are some examples to help illustrate these concepts."
          },
          {
            title: "Practice Problems",
            content: "Try these practice problems to test your understanding."
          }
        ],
        summary: `In this lesson, you learned about the fundamental concepts of ${topic} in ${subject}.`
      };
    } catch (error) {
      console.error("Error generating lesson content:", error);
      toast({
        title: "Error",
        description: "Failed to load lesson content. Using sample data.",
        variant: "destructive"
      });
      
      // Fallback content
      return {
        title: topic,
        subject: subject,
        introduction: `Welcome to this lesson on ${topic} in ${subject}.`,
        sections: [
          {
            title: "Key Concepts",
            content: `${topic} involves several key concepts that are fundamental to ${subject}.`
          }
        ],
        summary: `In this lesson, you learned about the fundamental concepts of ${topic} in ${subject}.`
      };
    }
  },

  generateQuizQuestion: async (subject: string, topic: string) => {
    try {
      toast({
        title: "Loading Quiz",
        description: "Generating quiz question...",
      });
      
      // In a production environment, uncomment this to use the actual API
      // const response = await axios.post(`${API_BASE_URL}/api/claude/quiz`, {
      //   subject,
      //   topic
      // });
      // return response.data;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock quiz question
      return {
        question: `What is the main concept behind ${topic} in ${subject}?`,
        options: [
          "The correct answer for this topic",
          "An incorrect but plausible answer",
          "Another wrong answer",
          "Yet another wrong answer"
        ],
        correctIndex: 0,
        explanation: `The main concept of ${topic} in ${subject} is explained here in detail.`
      };
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
        description: `Creating a ${questionCount}-question test for ${topic}...`,
      });
      
      // In a production environment, uncomment this to use the actual API
      // const response = await axios.post(`${API_BASE_URL}/api/claude/lessonTest`, {
      //   subject,
      //   topic,
      //   questionCount
      // });
      // return response.data;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock test questions
      const questions = Array.from({ length: questionCount }, (_, i) => ({
        id: `q-${i + 1}`,
        question: `Question ${i + 1} about ${topic} in ${subject}?`,
        options: [
          "The correct answer",
          "Wrong answer 1",
          "Wrong answer 2",
          "Wrong answer 3"
        ],
        correctIndex: 0,
        explanation: `Explanation for question ${i + 1} about ${topic}.`
      }));
      
      return { questions };
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
        correctIndex: 0,
        explanation: `Sample explanation for question ${i + 1}.`
      }));
      
      return { questions };
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
