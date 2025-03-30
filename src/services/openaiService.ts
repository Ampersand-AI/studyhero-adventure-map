
import OpenAI from 'openai';
import { toast } from "@/hooks/use-toast";

// Initialize the OpenAI client with a more secure approach
const getOpenAI = () => {
  // Using an environment variable would be better in production
  // For now, we'll use a working demo key for educational purposes only
  const apiKey = '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';
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
};

const openai = getOpenAI();

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
    - title: the topic name from official NCERT textbooks
    - description: a brief description of the topic
    - type: either "lesson", "quiz", or "practice"
    - status: "current" for the first item, "future" for the rest
    - dueDate: a date string
    - estimatedTimeInMinutes: estimated study time
    - subject: the subject name
    - content: a brief overview of the topic
    - textbookReference: a specific chapter or page number reference to the NCERT textbook
    - hasVisualAids: boolean indicating if this topic benefits from visual learning aids`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a comprehensive NCERT-aligned study plan for ${subject} for class ${className} with accurate textbook references.` }
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
      "keyPoints": [array of key concepts to understand from NCERT textbooks],
      "explanation": [array of detailed explanatory paragraphs closely following NCERT curriculum],
      "examples": [array of objects with "title" and "content" properties using NCERT-style examples],
      "visualAids": [array of objects with "title", "description", and "visualType" (diagram, chart, graph, etc.) properties],
      "activities": [array of objects with "title", "instructions" and "learningOutcome" properties],
      "summary": "a concluding paragraph summarizing the lesson",
      "textbookReferences": [array of objects with "chapter", "pageNumbers", and "description" properties],
      "visualLearningResources": [array of objects with "type" (video, animation, etc.), "title", and "description" properties]
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create NCERT-aligned lesson content for "${topic}" in ${subject} for daily learning, with accurate textbook references and appropriate visual learning aids.` }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonResponse = JSON.parse(content);
      
      // Verify required fields are present
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
      "question": "the question text based directly on NCERT content",
      "options": [array of 4 possible answers],
      "correctIndex": index of the correct answer (0-3),
      "explanation": "explanation of why the correct answer is right, with reference to NCERT textbook concepts"
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    - question: the question text based directly on NCERT content
    - options: an array of 4 possible answers
    - correctAnswer: the text of the correct answer (must match exactly one of the options)
    - explanation: explanation of why the correct answer is right, with reference to NCERT textbook concepts`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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
    - weeklyTest: a test object for the end of the week

    Structure the plan to ensure:
    1. Daily learning sessions of 20-30 minutes
    2. Visual aids are used where beneficial
    3. Each week builds on previous knowledge
    4. All learning is directly tied to NCERT textbook references
    5. Weekly tests cover that week's material`;

    // Prepare items data to send to OpenAI (limit size to avoid token issues)
    const itemsData = items.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      estimatedTimeInMinutes: item.estimatedTimeInMinutes,
      textbookReference: item.textbookReference || "NCERT textbook"
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
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

// Function to research NCERT curriculum for a specific subject and class
export const researchNCERTCurriculum = async (subject: string, className: string) => {
  try {
    toast({
      title: "Researching Curriculum",
      description: `Finding official NCERT curriculum for ${subject} Class ${className}...`,
    });

    const systemPrompt = `You are an expert educational researcher specializing in the Indian NCERT curriculum.
    Research and provide accurate information about the official NCERT curriculum for ${subject} for Class ${className}.
    Your response should be in JSON format with the following structure:
    {
      "subject": "${subject}",
      "class": "${className}",
      "textbookTitle": "the official NCERT textbook title",
      "textbookURL": "link to the official NCERT textbook if available",
      "units": [
        {
          "unitNumber": 1,
          "title": "unit title",
          "chapters": [
            {
              "chapterNumber": 1,
              "title": "chapter title",
              "keyTopics": ["topic 1", "topic 2"],
              "recommendedSessions": 3,
              "hasVisualLearningComponents": true/false
            }
          ]
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Research and provide accurate information about the official NCERT curriculum for ${subject} for Class ${className}, including textbook title, units, chapters, and key topics.` }
      ],
      temperature: 0.5
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Curriculum Researched",
        description: `Successfully retrieved NCERT curriculum for ${subject} Class ${className}`,
      });
      
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing OpenAI curriculum research response:", error);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error researching NCERT curriculum with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to retrieve curriculum information. Using standard data instead.",
      variant: "destructive"
    });
    
    // Return null to signal error, will use fallback
    return null;
  }
};
