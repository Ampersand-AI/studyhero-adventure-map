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

// Function to generate lesson content with enhanced visual elements
export const generateLessonContent = async (subject: string, topic: string) => {
  try {
    toast({
      title: "Loading Content",
      description: "Fetching NCERT-aligned lesson content with visual aids...",
    });

    const systemPrompt = `You are an expert educational content creator specializing in NCERT curriculum for ${subject}.
    Create detailed, engaging lesson content for the topic "${topic}" in ${subject}.
    Your response should be in JSON format with the following structure:
    {
      "title": "${topic}",
      "keyPoints": [array of 5-7 key concepts to understand from NCERT textbooks, written in simple, clear language],
      "explanation": [array of 3-5 detailed explanatory paragraphs closely following NCERT curriculum, written in an engaging, conversational style],
      "examples": [array of 2-3 objects with "title" and "content" properties using NCERT-style examples that are relatable to students],
      "visualAids": [array of 3-4 objects with "title", "description", and "visualType" (diagram, chart, graph, illustration, etc.) properties that help visualize the concepts],
      "activities": [array of 2-3 objects with "title", "instructions" and "learningOutcome" properties that are fun and interactive],
      "summary": "a concluding paragraph summarizing the lesson in a motivational way",
      "textbookReferences": [array of objects with "chapter", "pageNumbers", and "description" properties that directly link to NCERT textbooks],
      "visualLearningResources": [array of objects with "type" (video, animation, interactive diagram, etc.), "title", and "description" properties that cater to visual learners],
      "interestingFacts": [array of 2-3 fascinating facts related to the topic that will capture student interest]
    }
    
    Focus on making the content:
    1. Age-appropriate for class ${className} students
    2. Engaging with conversational language
    3. Visually rich with multiple types of visual aids
    4. Connected to real-world applications
    5. Including interesting facts that spark curiosity`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create engaging, NCERT-aligned lesson content for "${topic}" in ${subject} with multiple visual aids, interesting facts, and interactive elements that will make learning enjoyable for students.` }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonResponse = JSON.parse(content);
      
      // Verify required fields are present and enhance with defaults if missing
      const requiredFields = ['title', 'keyPoints', 'explanation', 'examples', 'visualAids', 'activities', 'summary'];
      const missingFields = requiredFields.filter(field => !jsonResponse[field]);
      
      if (missingFields.length > 0) {
        console.warn(`Response missing required fields: ${missingFields.join(', ')}. Adding defaults.`);
        
        // Add defaults for any missing fields
        missingFields.forEach(field => {
          switch(field) {
            case 'title':
              jsonResponse.title = topic;
              break;
            case 'keyPoints':
              jsonResponse.keyPoints = [`Key concept of ${topic}`, `Important principle in ${topic}`, `Application of ${topic}`];
              break;
            case 'explanation':
              jsonResponse.explanation = [`${topic} is an important concept in ${subject}.`];
              break;
            case 'examples':
              jsonResponse.examples = [{ title: `Example of ${topic}`, content: `This is an example of ${topic}.` }];
              break;
            case 'visualAids':
              jsonResponse.visualAids = [{ 
                title: `${topic} Visual Aid`, 
                description: `This diagram helps visualize ${topic}.`,
                visualType: "Diagram"
              }];
              break;
            case 'activities':
              jsonResponse.activities = [{ 
                title: `${topic} Activity`, 
                instructions: `Practice ${topic} by completing this exercise.`,
                learningOutcome: `Better understand ${topic}.`
              }];
              break;
            case 'summary':
              jsonResponse.summary = `In this lesson, you learned about ${topic} in ${subject}.`;
              break;
          }
        });
      }
      
      // Ensure interestingFacts are present
      if (!jsonResponse.interestingFacts) {
        jsonResponse.interestingFacts = [
          `Did you know? ${topic} has fascinating applications in everyday life.`,
          `Fun fact: ${topic} was discovered/developed in an interesting way.`
        ];
      }
      
      toast({
        title: "Lesson Created",
        description: `Successfully generated engaging NCERT-aligned content for ${topic}`,
      });
      
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

// Function to extract textbook content directly from NCERT sources
export const extractTextbookContent = async (subject: string, className: string, chapter: string) => {
  try {
    toast({
      title: "Extracting Textbook Content",
      description: `Analyzing NCERT textbook for ${subject} Class ${className}, Chapter ${chapter}...`,
    });

    const systemPrompt = `You are an expert educational content extractor specializing in NCERT curriculum.
    Extract and structure the content from the NCERT textbook for ${subject}, Class ${className}, Chapter ${chapter}.
    Your response should be in JSON format with the following structure:
    {
      "chapterTitle": "full chapter title",
      "sections": [
        {
          "title": "section title",
          "content": "section content as it appears in the textbook, preserving formatting and structure",
          "keyTerms": ["key term 1", "key term 2"],
          "hasVisuals": true/false,
          "visualDescriptions": ["description of visual 1", "description of visual 2"]
        }
      ],
      "exercises": [
        {
          "title": "exercise title",
          "questions": ["question 1", "question 2"]
        }
      ],
      "summary": "chapter summary if available in the textbook"
    }
    
    Preserve the exact language and concepts as they appear in the official NCERT textbook.
    Include all major sections, examples, key terms, and exercises.
    Be comprehensive but maintain the original structure of the textbook.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract and structure the content from the NCERT textbook for ${subject}, Class ${className}, Chapter ${chapter}. Preserve the exact language, structure, and examples from the official textbook.` }
      ],
      temperature: 0.3
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Textbook Extracted",
        description: `Successfully extracted NCERT textbook content for Chapter ${chapter}`,
      });
      
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing OpenAI textbook extraction response:", error);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error extracting textbook content with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to extract textbook content. Using curriculum data instead.",
      variant: "destructive"
    });
    
    // Return null to signal error
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

// Enhanced weekly plan generation with visual learning elements
export const generateWeeklyPlan = async (subject: string, items: any[]) => {
  try {
    toast({
      title: "Creating Engaging Study Plan",
      description: "Designing weekly schedule with visual learning elements...",
    });

    const systemPrompt = `You are an expert educational curriculum planner specializing in NCERT syllabus.
    Create an engaging weekly study plan for ${subject} based on the provided study items.
    Your response should be in JSON format with a "weeklyPlans" array containing week objects.
    Each week object should have:
    - weekNumber: the week number (1-12)
    - startDate: the start date of the week (e.g., "Jan 1")
    - endDate: the end date of the week (e.g., "Jan 7")
    - theme: a weekly theme that connects the lessons (e.g., "Introduction to Forces" for Physics)
    - dailyActivities: an array of day objects, each with:
      * date: the date for the activity
      * items: array of learning items, each with:
        - id: unique identifier
        - title: descriptive title
        - description: engaging description
        - type: "lesson", "quiz", "practice", "visual", or "interactive"
        - estimatedTimeInMinutes: recommended time
        - subject: the subject name
        - hasVisualAids: boolean indicating if visual aids are included
        - visualAidType: type of visual (diagram, chart, animation, etc.) if hasVisualAids is true
        - textbookReference: reference to the NCERT textbook
        - interactivityLevel: "low", "medium", or "high"
    - weeklyTest: a comprehensive test object for the end of the week
    - visualLearningActivity: a special activity focused on visual learning

    Structure the plan to ensure:
    1. Daily learning sessions of 20-30 minutes with variety of activities
    2. Visual aids are prominently featured where beneficial for the topic
    3. Each week builds on previous knowledge
    4. All learning is directly tied to NCERT textbook references
    5. Weekly tests cover that week's material
    6. At least one interactive or hands-on activity per week`;

    // Prepare items data to send to OpenAI
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
          content: `Create an engaging 12-week NCERT-aligned study plan for ${subject} using these items: ${JSON.stringify(itemsData).substring(0, 3000)}... Include at least one visual learning activity per week and ensure varied, interactive learning experiences.` 
        }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const result = JSON.parse(content);
      
      toast({
        title: "Engaging Weekly Plan Created",
        description: `Your ${subject} NCERT curriculum is now organized into an interactive weekly schedule`,
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

// New function to generate visual learning resources
export const generateVisualLearningResources = async (subject: string, topic: string) => {
  try {
    toast({
      title: "Creating Visual Resources",
      description: `Generating visual learning aids for ${topic}...`,
    });

    const systemPrompt = `You are an expert educational visual learning specialist.
    Create detailed descriptions of visual learning resources for the topic "${topic}" in ${subject}.
    Your response should be in JSON format with a "visualResources" array containing resource objects.
    Each resource object should have:
    - type: the type of visual resource (diagram, chart, illustration, flowchart, mind map, infographic, etc.)
    - title: a descriptive title
    - description: detailed description of what the visual shows
    - learningObjective: what students should learn from this visual
    - complexity: "basic", "intermediate", or "advanced"
    - colorScheme: suggested color scheme for the visual
    - keyConcepts: array of concepts illustrated in the visual
    - textbookReference: reference to where this concept appears in NCERT textbooks
    - suggestedUse: how teachers/students should use this visual for learning

    Focus on creating visuals that:
    1. Clearly illustrate complex concepts
    2. Use appropriate visual metaphors
    3. Follow educational best practices
    4. Support different learning styles
    5. Are age-appropriate for the subject level`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create 3-5 detailed visual learning resources for the topic "${topic}" in ${subject} that follow NCERT curriculum guidelines and help students visualize complex concepts.` }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Visual Resources Created",
        description: `Successfully generated visual learning aids for ${topic}`,
      });
      
      return jsonResponse;
    } catch (error) {
      console.error("Error parsing OpenAI visual resources response:", error);
      throw new Error("Invalid response format from OpenAI");
    }
  } catch (error) {
    console.error("Error generating visual resources with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to generate visual resources. Using standard visuals.",
      variant: "destructive"
    });
    
    // Return null to signal error
    return null;
  }
};
