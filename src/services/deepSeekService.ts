import { toast } from "sonner";

// Central API key for DeepSeek
const DEEPSEEK_API_KEY = 'sk-a53303b3873b42be8910c5fd16e0ad4a';

export interface AIStatus {
  stage: string;
  progress: number;
  provider: string;
}

// Types for content generation
export interface ContentGenerationContext {
  subject: string;
  topic: string;
  className?: string;
  board?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  includeVisuals?: boolean;
  includeActivities?: boolean;
}

export interface DeepSeekConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

/**
 * Generate content using DeepSeek API
 */
export const generateWithDeepSeek = async (
  prompt: string,
  onStatusUpdate?: (status: AIStatus) => void,
  config: DeepSeekConfig = {}
): Promise<any> => {
  try {
    if (onStatusUpdate) {
      onStatusUpdate({
        stage: "Initiating request",
        progress: 10,
        provider: "DeepSeek"
      });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 4000,
        top_p: config.topP || 0.95,
      }),
    });

    if (onStatusUpdate) {
      onStatusUpdate({
        stage: "Processing response",
        progress: 70,
        provider: "DeepSeek"
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (onStatusUpdate) {
      onStatusUpdate({
        stage: "Content generated",
        progress: 100,
        provider: "DeepSeek"
      });
    }

    try {
      // Try to parse as JSON first
      return JSON.parse(content);
    } catch (e) {
      // If not JSON, return as string
      return content;
    }
  } catch (error) {
    console.error("Error with DeepSeek API:", error);
    toast.error("API Error", {
      description: "Failed to generate content with DeepSeek. Please try again."
    });
    
    if (onStatusUpdate) {
      onStatusUpdate({
        stage: "Error occurred",
        progress: 100,
        provider: "DeepSeek"
      });
    }
    
    throw error;
  }
};

/**
 * Get comprehensive list of schools for a city
 */
export const getSchoolsForCity = async (
  state: string,
  city: string
): Promise<string[]> => {
  try {
    const prompt = `
      I need a comprehensive list of all schools in ${city}, ${state}, India. 
      Please provide a thorough list with at least 15-20 schools if it's a major city, 
      including government schools, private schools, international schools, and specialized schools.
      
      Format the response ONLY as a JSON array of strings containing just the school names.
      For example: ["School Name 1", "School Name 2", "School Name 3", ...]
      
      Include ONLY the JSON array, no additional text.
    `;

    const response = await generateWithDeepSeek(prompt, undefined, {
      temperature: 0.3,
      maxTokens: 1000
    });

    // If response is already an array, return it
    if (Array.isArray(response)) {
      return response;
    }

    // If it's a string containing JSON, try to parse it
    if (typeof response === 'string') {
      try {
        const parsed = JSON.parse(response);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse school list:", e);
      }
    }

    // Fallback to default list
    return [
      "Delhi Public School",
      "Kendriya Vidyalaya",
      "St. Mary's School",
      "DAV Public School",
      "Don Bosco School",
      "Army Public School",
      "Ryan International School",
      "Modern School"
    ];
  } catch (error) {
    console.error("Error fetching schools:", error);
    return [
      "Delhi Public School",
      "Kendriya Vidyalaya",
      "St. Mary's School",
      "DAV Public School",
      "Don Bosco School"
    ];
  }
};

/**
 * Get subjects based on board and class
 */
export const getSubjectsForBoardAndClass = async (
  board: string,
  className: string
): Promise<{
  compulsorySubjects: string[];
  optionalSubjects: string[];
}> => {
  try {
    const prompt = `
      I need accurate information about the curriculum for Class ${className} following the ${board} board in India.
      
      Please provide a list of all compulsory (core) subjects and all optional (elective) subjects.
      For CBSE, ICSE, and State Boards, make sure to accurately represent the actual curriculum structure.
      
      Format the response as a JSON object with two arrays:
      {
        "compulsorySubjects": ["Subject 1", "Subject 2", ...],
        "optionalSubjects": ["Optional 1", "Optional 2", ...]
      }
      
      Include ONLY the JSON object, no additional text.
    `;

    const response = await generateWithDeepSeek(prompt, undefined, {
      temperature: 0.3,
      maxTokens: 1000
    });

    // If we got a valid response, use it
    if (response && response.compulsorySubjects && response.optionalSubjects) {
      return response;
    }

    // Fallback to default structure
    return {
      compulsorySubjects: ["Mathematics", "Science", "English", "Social Studies", "Hindi"],
      optionalSubjects: ["Computer Science", "Sanskrit", "Physical Education", "Art", "Music"]
    };
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return {
      compulsorySubjects: ["Mathematics", "Science", "English", "Social Studies", "Hindi"],
      optionalSubjects: ["Computer Science", "Sanskrit", "Physical Education", "Art", "Music"]
    };
  }
};

/**
 * Generate a study plan for a subject
 */
export const generateStudyPlan = async (
  subject: string,
  board: string,
  className: string,
  onStatusUpdate?: (status: AIStatus) => void
): Promise<any> => {
  try {
    if (onStatusUpdate) {
      onStatusUpdate({
        stage: "Creating personalized study plan",
        progress: 20,
        provider: "DeepSeek"
      });
    }

    const prompt = `
      Create a comprehensive daily study plan for ${subject} for class ${className} following the ${board} curriculum.
      
      The study plan should:
      1. Cover 12 weeks (3 months) of learning
      2. Include 5 days per week (Monday to Friday)
      3. Each day should have a specific topic with detailed lesson content including:
         - Fundamental concepts
         - Detailed explanations
         - 2-3 examples that demonstrate application
         - Visual aids or diagrams that would help understanding
      4. At the end of each week (Friday), include a quiz with 5 multiple-choice questions to test knowledge
      
      Each day's lesson should take approximately 30-45 minutes to complete.
      
      Format the response as a JSON object with this structure:
      {
        "subject": "${subject}",
        "class": "${className}",
        "board": "${board}",
        "weeks": [
          {
            "weekNumber": 1,
            "theme": "Week 1 Theme",
            "days": [
              {
                "day": "Monday",
                "topic": "Topic Name",
                "content": {
                  "fundamentals": ["Key point 1", "Key point 2", ...],
                  "explanation": "Detailed explanation of the topic...",
                  "examples": [
                    {"title": "Example 1", "content": "Example content..."},
                    {"title": "Example 2", "content": "Example content..."}
                  ],
                  "visualAids": [
                    {"title": "Visual 1", "description": "Description of what this visual would show..."}
                  ]
                }
              },
              // Other days
            ],
            "weeklyQuiz": {
              "questions": [
                {
                  "question": "Question text?",
                  "options": ["Option A", "Option B", "Option C", "Option D"],
                  "correctAnswer": "Option A",
                  "explanation": "Explanation of why this answer is correct"
                },
                // Other questions
              ]
            }
          },
          // Other weeks
        ]
      }
    `;
      
    if (onStatusUpdate) {
      onStatusUpdate({
        stage: "Analyzing curriculum and creating content",
        progress: 50,
        provider: "DeepSeek"
      });
    }

    const response = await generateWithDeepSeek(prompt, undefined, {
      temperature: 0.7,
      maxTokens: 4000
    });

    if (onStatusUpdate) {
      onStatusUpdate({
        stage: "Study plan generated successfully",
        progress: 100,
        provider: "DeepSeek"
      });
    }

    return response;
  } catch (error) {
    console.error("Error generating study plan:", error);
    if (onStatusUpdate) {
      onStatusUpdate({
        stage: "Error creating study plan",
        progress: 100,
        provider: "DeepSeek"
      });
    }
    throw error;
  }
};

export default {
  generateWithDeepSeek,
  getSchoolsForCity,
  getSubjectsForBoardAndClass,
  generateStudyPlan
};
