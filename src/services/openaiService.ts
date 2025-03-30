
import OpenAI from 'openai';
import { toast } from "@/hooks/use-toast";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true // Required for client-side usage
});

// Function to generate study plan
export const generateStudyPlan = async (board: string, className: string, subject: string) => {
  try {
    toast({
      title: "Connecting to NCERT",
      description: "Analyzing curriculum data for your study plan...",
    });

    const systemPrompt = `You are an expert educational curriculum designer specializing in NCERT syllabus. 
    Create a detailed study plan for ${subject} for class ${className} following the ${board} curriculum.
    Your response should be in JSON format with an 'items' array containing lesson objects.
    Each lesson object should have:
    - id: a unique string identifier
    - title: the topic name
    - description: a brief description
    - type: either "lesson", "quiz", or "practice"
    - status: "current" for the first item, "future" for the rest
    - dueDate: a date string
    - estimatedTimeInMinutes: estimated study time
    - subject: the subject name
    - content: a brief overview of the topic`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a comprehensive NCERT-aligned study plan for ${subject} for class ${className}.` }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Study Plan Created",
        description: `Successfully generated NCERT-aligned study plan for ${subject}`,
      });
      
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error generating study plan with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to generate study plan. Using sample data instead.",
      variant: "destructive"
    });
    
    // Return null to signal error, will use fallback
    return null;
  }
};

// Function to generate lesson content
export const generateLessonContent = async (subject: string, topic: string) => {
  try {
    toast({
      title: "Loading Content",
      description: "Fetching NCERT-aligned lesson content...",
    });

    const systemPrompt = `You are an expert educational content creator specializing in NCERT curriculum for ${subject}.
    Create detailed lesson content for the topic "${topic}" in ${subject}.
    Your response should be in JSON format with the following structure:
    {
      "title": "${topic}",
      "keyPoints": [array of key concepts to understand],
      "explanation": [array of detailed explanatory paragraphs],
      "examples": [array of objects with "title" and "content" properties],
      "visualAids": [array of objects with "title" and "description" properties],
      "activities": [array of objects with "title" and "instructions" properties],
      "summary": "a concluding paragraph summarizing the lesson"
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create NCERT-aligned lesson content for "${topic}" in ${subject}.` }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonResponse = JSON.parse(content);
      
      // Verify all required fields are present
      const requiredFields = ['title', 'keyPoints', 'explanation', 'examples', 'visualAids', 'activities', 'summary'];
      const missingFields = requiredFields.filter(field => !jsonResponse[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Response missing required fields: ${missingFields.join(', ')}`);
      }
      
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing OpenAI lesson content response:", error);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error generating lesson content with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to load lesson content. Using sample data.",
      variant: "destructive"
    });
    
    // Return null to signal error, will use fallback
    return null;
  }
};

// Function to generate quiz questions
export const generateQuizQuestion = async (subject: string, topic: string) => {
  try {
    toast({
      title: "Loading Quiz",
      description: "Generating NCERT-aligned quiz question...",
    });

    const systemPrompt = `You are an expert educational assessment creator specializing in NCERT curriculum for ${subject}.
    Create a quiz question for the topic "${topic}" in ${subject}.
    Your response should be in JSON format with the following structure:
    {
      "question": "the question text",
      "options": [array of 4 possible answers],
      "correctIndex": index of the correct answer (0-3),
      "explanation": "explanation of why the correct answer is right"
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create an NCERT-aligned quiz question for "${topic}" in ${subject}.` }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Error parsing OpenAI quiz question response:", error);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error generating quiz question with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to generate quiz. Using sample question.",
      variant: "destructive"
    });
    
    // Return null to signal error, will use fallback
    return null;
  }
};

// Function to generate lesson test
export const generateLessonTest = async (subject: string, topic: string, questionCount: number) => {
  try {
    toast({
      title: "Preparing Test",
      description: `Creating a ${questionCount}-question NCERT-aligned test for ${topic}...`,
    });

    const systemPrompt = `You are an expert educational assessment creator specializing in NCERT curriculum for ${subject}.
    Create a test with ${questionCount} questions for the topic "${topic}" in ${subject}.
    Your response should be in JSON format with a "questions" array containing question objects.
    Each question object should have:
    - id: a unique string identifier
    - question: the question text
    - options: an array of 4 possible answers
    - correctAnswer: the text of the correct answer (must match exactly one of the options)
    - explanation: explanation of why the correct answer is right`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create an NCERT-aligned test with ${questionCount} questions for "${topic}" in ${subject}.` }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Error parsing OpenAI lesson test response:", error);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error generating lesson test with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to generate test. Using sample questions.",
      variant: "destructive"
    });
    
    // Return null to signal error, will use fallback
    return null;
  }
};

// Function to generate weekly plan
export const generateWeeklyPlan = async (subject: string, items: any[]) => {
  try {
    toast({
      title: "Organizing Study Plan",
      description: "Creating weekly schedule for your NCERT curriculum...",
    });

    const systemPrompt = `You are an expert educational curriculum planner specializing in NCERT syllabus.
    Create a weekly study plan for ${subject} based on the provided study items.
    Your response should be in JSON format with a "weeklyPlans" array containing week objects.
    Each week object should have:
    - weekNumber: the week number (1-12)
    - startDate: the start date of the week (e.g., "Jan 1")
    - endDate: the end date of the week (e.g., "Jan 7")
    - dailyActivities: an array of day objects, each with a date and items array
    - weeklyTest: a test object for the end of the week`;

    // Prepare items data to send to OpenAI (limit size to avoid token issues)
    const itemsData = items.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      estimatedTimeInMinutes: item.estimatedTimeInMinutes
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Create a 12-week NCERT-aligned study plan for ${subject} using these items: ${JSON.stringify(itemsData).substring(0, 3000)}...` 
        }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const result = JSON.parse(content);
      
      toast({
        title: "Weekly Plan Created",
        description: `Your ${subject} NCERT curriculum is now organized into a weekly schedule`,
      });
      
      return result;
    } catch (error) {
      console.error("Error parsing OpenAI weekly plan response:", error);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error generating weekly plan with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to create weekly plan. Using standard study plan.",
      variant: "destructive"
    });
    
    // Return null to signal error, will use fallback
    return null;
  }
};
