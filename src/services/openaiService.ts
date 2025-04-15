
import OpenAI from 'openai';
import { toast } from "@/hooks/use-toast";
import { AIModel } from '@/components/ProgressCard';

// Initialize the OpenAI client with the OpenRouter API key
const getOpenAI = (apiKey?: string) => {
  // Using the provided API key or try to get from localStorage
  const key = apiKey || localStorage.getItem('openrouter_api_key') || '';
  
  return new OpenAI({
    apiKey: key,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': window.location.href,
      'X-Title': 'Study AI',
    },
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
};

// Function to fetch available models from OpenRouter
export const fetchOpenRouterModels = async (apiKey: string): Promise<AIModel[]> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Study AI',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data.map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      description: model.description,
      provider: model.context_length
        ? `${model.provider} (${model.context_length} tokens)`
        : model.provider
    }));
  } catch (error) {
    console.error("Error fetching OpenRouter models:", error);
    throw error;
  }
};

// Get selected models from localStorage
const getSelectedModels = (): string[] => {
  try {
    const savedModels = localStorage.getItem('selected_models');
    if (savedModels) {
      return JSON.parse(savedModels);
    }
  } catch (e) {
    console.error("Error parsing selected models:", e);
  }
  return [];
};

// Function to generate study plan
export const generateStudyPlan = async (board: string, className: string, subject: string) => {
  try {
    toast({
      title: "Creating Personalized Study Plan",
      description: "Analyzing curriculum data and educational resources worldwide...",
    });

    const systemPrompt = `You are an expert educational curriculum designer with knowledge of global education standards.
    Create a detailed study plan for ${subject} for class ${className} based on comprehensive research of educational resources.
    Your response should be in JSON format with an 'items' array containing lesson objects.
    Each lesson object should have:
    - id: a unique string identifier
    - title: the topic name from standard curriculum guides
    - description: a brief description of the topic
    - type: either "lesson", "quiz", or "practice"
    - status: "current" for the first item, "future" for the rest
    - dueDate: a date string
    - estimatedTimeInMinutes: estimated study time
    - subject: the subject name
    - content: a brief overview of the topic
    - textbookReference: a relevant chapter or section reference
    - hasVisualAids: boolean indicating if this topic benefits from visual learning aids`;

    // Get selected models from localStorage
    const selectedModelIds = getSelectedModels();
    const openai = getOpenAI();
    
    const modelToUse = selectedModelIds.length > 0 ? selectedModelIds[0] : 'openai/gpt-4o-mini';
    
    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a comprehensive study plan for ${subject} for class ${className} based on global educational standards.` }
      ],
      temperature: 0.7
    });

    // Parse the response and return it
    const content = response.choices[0]?.message?.content || '';
    try {
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Study Plan Created",
        description: `Successfully generated study plan for ${subject}`,
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

// Update the remaining functions to use the selected models
// Function to generate lesson content with enhanced visual elements
export const generateLessonContent = async (subject: string, topic: string, className: string = '10') => {
  try {
    toast({
      title: "Loading Content",
      description: "Researching and compiling educational content from various sources...",
    });

    const systemPrompt = `You are an expert educational content creator with knowledge of global teaching methodologies.
    Create detailed, engaging, and ACCURATE lesson content for the topic "${topic}" in ${subject}.
    Research and compile information from various educational sources, textbooks, and online learning platforms worldwide.
    
    Your response should be in JSON format with the following structure:
    {
      "title": "${topic}",
      "keyPoints": [array of 5-7 key concepts to understand, written in simple, clear language],
      "explanation": [array of 3-5 detailed explanatory paragraphs following best educational practices, written in an engaging, conversational style],
      "examples": [array of 2-3 objects with "title" and "content" properties using examples that are relatable to students],
      "visualAids": [array of 3-4 objects with "title", "description", and "visualType" (diagram, chart, graph, illustration, etc.) properties that help visualize the concepts],
      "activities": [array of 2-3 objects with "title", "instructions" and "learningOutcome" properties that reinforce learning through practical application],
      "summary": "a concluding paragraph summarizing the lesson in a motivational way",
      "textbookReferences": [array of objects with "chapter", "pageNumbers", and "description" properties that direct students to additional learning resources],
      "visualLearningResources": [array of objects with "type" (video, animation, interactive diagram, etc.), "title", and "description" properties that cater to visual learners],
      "interestingFacts": [array of 2-3 REAL facts related to the topic that will capture student interest]
    }
    
    Focus on making the content:
    1. Age-appropriate for class ${className} students
    2. Engaging with conversational language
    3. Visually rich with multiple types of visual aids
    4. Connected to real-world applications
    5. Including interesting facts that spark curiosity
    6. Aligned with standard educational objectives for this age group`;

    // Get selected models from localStorage
    const selectedModelIds = getSelectedModels();
    const openai = getOpenAI();
    
    // Use the first selected model, or fall back to a default
    const primaryModel = selectedModelIds.length > 0 ? selectedModelIds[0] : 'openai/gpt-4o';

    try {
      const response = await openai.chat.completions.create({
        model: primaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create engaging lesson content for "${topic}" in ${subject} with multiple visual aids, interesting facts, and interactive elements that will make learning enjoyable for students. Base the content on global educational standards.` }
        ],
        temperature: 0.5
      });
      
      // Parse the response and return it
      const content = response.choices[0]?.message?.content || '';
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Lesson Created",
        description: `Successfully generated content for ${topic}`,
      });
      
      return jsonResponse;
    } catch (error) {
      // If primary model fails, try the fallback models
      if (selectedModelIds.length > 1) {
        for (let i = 1; i < selectedModelIds.length; i++) {
          try {
            toast({
              title: "Trying Fallback Model",
              description: `Attempting with fallback model ${i}...`,
            });
            
            const fallbackResponse = await openai.chat.completions.create({
              model: selectedModelIds[i],
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Create engaging lesson content for "${topic}" in ${subject} with multiple visual aids, interesting facts, and interactive elements that will make learning enjoyable for students. Base the content on global educational standards.` }
              ],
              temperature: 0.5
            });
            
            const fallbackContent = fallbackResponse.choices[0]?.message?.content || '';
            const fallbackJsonResponse = JSON.parse(fallbackContent);
            
            toast({
              title: "Fallback Successful",
              description: `Generated content using fallback model ${i}`,
            });
            
            return fallbackJsonResponse;
          } catch (fallbackError) {
            console.error(`Error with fallback model ${i}:`, fallbackError);
            // Continue to next fallback
          }
        }
      }
      
      // If all models failed, throw the original error
      throw error;
    }
  } catch (error) {
    console.error("Error generating lesson content with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to load lesson content. Please try again.",
      variant: "destructive"
    });
    
    // Instead of returning mock data, return null to trigger a retry
    throw new Error("Failed to generate lesson content");
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

    // Get selected models from localStorage
    const selectedModelIds = getSelectedModels();
    const openai = getOpenAI();
    
    // Use the first selected model, or fall back to a default
    const primaryModel = selectedModelIds.length > 0 ? selectedModelIds[0] : 'openai/gpt-4o-mini';

    try {
      const response = await openai.chat.completions.create({
        model: primaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Extract and structure the content from the NCERT textbook for ${subject}, Class ${className}, Chapter ${chapter}. Preserve the exact language, structure, and examples from the official textbook.` }
        ],
        temperature: 0.3
      });

      // Parse the response and return it
      const content = response.choices[0]?.message?.content || '';
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Textbook Extracted",
        description: `Successfully extracted NCERT textbook content for Chapter ${chapter}`,
      });
      
      return jsonResponse;
    } catch (error) {
      // If primary model fails, try the fallback models
      if (selectedModelIds.length > 1) {
        for (let i = 1; i < selectedModelIds.length; i++) {
          try {
            toast({
              title: "Trying Fallback Model",
              description: `Attempting with fallback model ${i}...`,
            });
            
            const fallbackResponse = await openai.chat.completions.create({
              model: selectedModelIds[i],
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Extract and structure the content from the NCERT textbook for ${subject}, Class ${className}, Chapter ${chapter}. Preserve the exact language, structure, and examples from the official textbook.` }
              ],
              temperature: 0.3
            });
            
            const fallbackContent = fallbackResponse.choices[0]?.message?.content || '';
            const fallbackJsonResponse = JSON.parse(fallbackContent);
            
            toast({
              title: "Fallback Successful",
              description: `Generated content using fallback model ${i}`,
            });
            
            return fallbackJsonResponse;
          } catch (fallbackError) {
            console.error(`Error with fallback model ${i}:`, fallbackError);
            // Continue to next fallback
          }
        }
      }
      
      // If all models failed, throw the original error
      throw error;
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

    // Get selected models from localStorage
    const selectedModelIds = getSelectedModels();
    const openai = getOpenAI();
    
    // Use the first selected model, or fall back to a default
    const primaryModel = selectedModelIds.length > 0 ? selectedModelIds[0] : 'openai/gpt-4o-mini';

    try {
      const response = await openai.chat.completions.create({
        model: primaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create an NCERT-aligned quiz question for "${topic}" in ${subject}.` }
        ],
        temperature: 0.7
      });

      // Parse the response and return it
      const content = response.choices[0]?.message?.content || '';
      return JSON.parse(content);
    } catch (error) {
      // If primary model fails, try the fallback models
      if (selectedModelIds.length > 1) {
        for (let i = 1; i < selectedModelIds.length; i++) {
          try {
            toast({
              title: "Trying Fallback Model",
              description: `Attempting with fallback model ${i}...`,
            });
            
            const fallbackResponse = await openai.chat.completions.create({
              model: selectedModelIds[i],
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Create an NCERT-aligned quiz question for "${topic}" in ${subject}.` }
              ],
              temperature: 0.7
            });
            
            const fallbackContent = fallbackResponse.choices[0]?.message?.content || '';
            return JSON.parse(fallbackContent);
          } catch (fallbackError) {
            console.error(`Error with fallback model ${i}:`, fallbackError);
            // Continue to next fallback
          }
        }
      }
      
      // If all models failed, throw the original error
      throw error;
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

    // Get selected models from localStorage
    const selectedModelIds = getSelectedModels();
    const openai = getOpenAI();
    
    // Use the first selected model, or fall back to a default
    const primaryModel = selectedModelIds.length > 0 ? selectedModelIds[0] : 'openai/gpt-4o-mini';

    try {
      const response = await openai.chat.completions.create({
        model: primaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create an NCERT-aligned test with ${questionCount} questions for "${topic}" in ${subject}.` }
        ],
        temperature: 0.7
      });

      // Parse the response and return it
      const content = response.choices[0]?.message?.content || '';
      return JSON.parse(content);
    } catch (error) {
      // If primary model fails, try the fallback models
      if (selectedModelIds.length > 1) {
        for (let i = 1; i < selectedModelIds.length; i++) {
          try {
            toast({
              title: "Trying Fallback Model",
              description: `Attempting with fallback model ${i}...`,
            });
            
            const fallbackResponse = await openai.chat.completions.create({
              model: selectedModelIds[i],
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Create an NCERT-aligned test with ${questionCount} questions for "${topic}" in ${subject}.` }
              ],
              temperature: 0.7
            });
            
            const fallbackContent = fallbackResponse.choices[0]?.message?.content || '';
            return JSON.parse(fallbackContent);
          } catch (fallbackError) {
            console.error(`Error with fallback model ${i}:`, fallbackError);
            // Continue to next fallback
          }
        }
      }
      
      // If all models failed, throw the original error
      throw error;
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

    // Get selected models from localStorage
    const selectedModelIds = getSelectedModels();
    const openai = getOpenAI();
    
    // Use the first selected model, or fall back to a default
    const primaryModel = selectedModelIds.length > 0 ? selectedModelIds[0] : 'openai/gpt-4o-mini';

    try {
      const response = await openai.chat.completions.create({
        model: primaryModel,
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
      const result = JSON.parse(content);
      
      toast({
        title: "Engaging Weekly Plan Created",
        description: `Your ${subject} NCERT curriculum is now organized into an interactive weekly schedule`,
      });
      
      return result;
    } catch (error) {
      // If primary model fails, try the fallback models
      if (selectedModelIds.length > 1) {
        for (let i = 1; i < selectedModelIds.length; i++) {
          try {
            toast({
              title: "Trying Fallback Model",
              description: `Attempting with fallback model ${i}...`,
            });
            
            const fallbackResponse = await openai.chat.completions.create({
              model: selectedModelIds[i],
              messages: [
                { role: 'system', content: systemPrompt },
                { 
                  role: 'user', 
                  content: `Create an engaging 12-week NCERT-aligned study plan for ${subject} using these items: ${JSON.stringify(itemsData).substring(0, 3000)}... Include at least one visual learning activity per week and ensure varied, interactive learning experiences.` 
                }
              ],
              temperature: 0.7
            });
            
            const fallbackContent = fallbackResponse.choices[0]?.message?.content || '';
            const fallbackResult = JSON.parse(fallbackContent);
            
            toast({
              title: "Fallback Successful",
              description: `Generated content using fallback model ${i}`,
            });
            
            return fallbackResult;
          } catch (fallbackError) {
            console.error(`Error with fallback model ${i}:`, fallbackError);
            // Continue to next fallback
          }
        }
      }
      
      // If all models failed, throw the original error
      throw error;
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

    // Get selected models from localStorage
    const selectedModelIds = getSelectedModels();
    const openai = getOpenAI();
    
    // Use the first selected model, or fall back to a default
    const primaryModel = selectedModelIds.length > 0 ? selectedModelIds[0] : 'openai/gpt-4o-mini';

    try {
      const response = await openai.chat.completions.create({
        model: primaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Research and provide accurate information about the official NCERT curriculum for ${subject} for Class ${className}, including textbook title, units, chapters, and key topics.` }
        ],
        temperature: 0.5
      });

      // Parse the response and return it
      const content = response.choices[0]?.message?.content || '';
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Curriculum Researched",
        description: `Successfully retrieved NCERT curriculum for ${subject} Class ${className}`,
      });
      
      return jsonResponse;
    } catch (error) {
      // If primary model fails, try the fallback models
      if (selectedModelIds.length > 1) {
        for (let i = 1; i < selectedModelIds.length; i++) {
          try {
            toast({
              title: "Trying Fallback Model",
              description: `Attempting with fallback model ${i}...`,
            });
            
            const fallbackResponse = await openai.chat.completions.create({
              model: selectedModelIds[i],
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Research and provide accurate information about the official NCERT curriculum for ${subject} for Class ${className}, including textbook title, units, chapters, and key topics.` }
              ],
              temperature: 0.5
            });
            
            const fallbackContent = fallbackResponse.choices[0]?.message?.content || '';
            const fallbackJsonResponse = JSON.parse(fallbackContent);
            
            toast({
              title: "Fallback Successful",
              description: `Generated content using fallback model ${i}`,
            });
            
            return fallbackJsonResponse;
          } catch (fallbackError) {
            console.error(`Error with fallback model ${i}:`, fallbackError);
            // Continue to next fallback
          }
        }
      }
      
      // If all models failed, throw the original error
      throw error;
    }
  } catch (error) {
    console.error("Error researching NCERT curriculum with OpenAI:", error);
    toast({
      title: "Error",
      description: "Failed to retrieve curriculum information. Using standard data instead.",
      variant: "destructive"
    });
    
    // Return null to signal error
    return null;
  }
};

// New function to generate visual learning resources
export const generateVisualLearningResources = async (subject: string, topic: string) => {
  try {
    toast({
      title: "Creating Visual Resources",
      description: `Generating authentic visual learning aids for ${topic}...`,
    });

    const systemPrompt = `You are an expert educational visual learning specialist focusing on NCERT curriculum.
    Create detailed descriptions of visual learning resources for the topic "${topic}" in ${subject} as they would
    appear in NCERT textbooks. Base your responses ONLY on actual NCERT content.
    
    Your response should be in JSON format with a "visualResources" array containing resource objects.
    Each resource object should have:
    - type: the type of visual resource (diagram, chart, illustration, flowchart, mind map, infographic, etc.)
    - title: a descriptive title based on NCERT terminology
    - description: detailed description of what the visual shows
    - learningObjective: what students should learn from this visual according to NCERT objectives
    - complexity: "basic", "intermediate", or "advanced"
    - colorScheme: suggested color scheme for the visual
    - keyConcepts: array of concepts illustrated in the visual that appear in NCERT textbooks
    - textbookReference: ACCURATE reference to where this concept appears in NCERT textbooks
    - suggestedUse: how this visual should be used based on NCERT teaching methodology

    Focus on creating visuals that:
    1. Accurately represent content found in NCERT textbooks
    2. Follow the educational approach used in Indian curriculum
    3. Support different learning styles as emphasized in NEP 2020
    4. Are age-appropriate for the subject level according to NCERT guidelines`;

    // Get selected models from localStorage
    const selectedModelIds = getSelectedModels();
    const openai = getOpenAI();
    
    // Use the first selected model, or fall back to a default
    const primaryModel = selectedModelIds.length > 0 ? selectedModelIds[0] : 'openai/gpt-4o';

    try {
      const response = await openai.chat.completions.create({
        model: primaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create 3-5 detailed visual learning resources for the topic "${topic}" in ${subject} that EXACTLY follow NCERT curriculum guidelines and help students visualize complex concepts. Only include visualizations that would actually appear in or be suggested by NCERT textbooks.` }
        ],
        temperature: 0.4
      });

      // Parse the response and return it
      const content = response.choices[0]?.message?.content || '';
      const jsonResponse = JSON.parse(content);
      
      toast({
        title: "Visual Resources Created",
        description: `Successfully generated authentic NCERT-aligned visual learning aids for ${topic}`,
      });
      
      return jsonResponse;
    } catch (error) {
      // If primary model fails, try the fallback models
      if (selectedModelIds.length > 1) {
        for (let i = 1; i < selectedModelIds.length; i++) {
          try {
            toast({
              title: "Trying Fallback Model",
              description: `Attempting with fallback model ${i}...`,
            });
            
            const fallbackResponse = await openai.chat.completions.create({
              model: selectedModelIds[i],
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Create 3-5 detailed visual learning resources for the topic "${topic}" in ${subject} that EXACTLY follow NCERT curriculum guidelines and help students visualize complex concepts. Only include visualizations that would actually appear in or be suggested by NCERT textbooks.` }
              ],
              temperature: 0.4
            });
            
            const fallbackContent = fallbackResponse.choices[0]?.message?.content || '';
            const fallbackJsonResponse = JSON.parse(fallbackContent);
            
            toast({
              title: "Fallback Successful",
              description: `Generated content using fallback model ${i}`,
            });
            
            return fallbackJsonResponse;
          } catch (fallbackError) {
            console.error(`Error with fallback model ${i}:`, fallbackError);
            // Continue to next fallback
          }
        }
      }
      
      // If all models failed, throw the original error
      throw error;
    }
  } catch (error) {
    console.error("Error generating visual learning resources:", error);
    toast({
      title: "Error",
      description: "Failed to create visual resources. Using standard visuals.",
      variant: "destructive"
    });
    
    // Return null to signal error
    return null;
  }
};
