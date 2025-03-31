import { toast } from "sonner";
import { generateAIContent, AIStatus } from './aiService';
import { deepSearchLessonContent, LessonSearchParams, LessonWithSources } from './aiDeepSearchService';

// Interface for lesson generation parameters
export interface LessonGenerationParams {
  subject: string;
  topic: string;
  className?: string;
  includeVisuals?: boolean;
  includeActivities?: boolean;
  board?: string;
  deepSearch?: boolean;
}

// Interface for lesson content
export interface LessonContent {
  title: string;
  explanation: string[];
  keyPoints: string[];
  examples: {
    title: string;
    content: string;
  }[];
  visualAids?: {
    title: string;
    description: string;
    visualType: string;
  }[];
  activities?: {
    title: string;
    instructions: string;
    learningOutcome: string;
  }[];
  interestingFacts?: string[];
  summary?: string;
  textbookReferences?: {
    chapter: string;
    pageNumbers: string;
    description: string;
  }[];
}

// Safe JSON parsing helper
function safeParseJSON(jsonString: string): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("JSON parsing failed:", error);
    
    // Try to extract JSON from the string if it's wrapped in other content
    try {
      const jsonMatch = jsonString.match(/```json\n([\s\S]*?)\n```/) || 
                       jsonString.match(/```\n([\s\S]*?)\n```/) || 
                       jsonString.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        const extractedJson = jsonMatch[1] || jsonMatch[0];
        // Clean up the string to ensure it's valid JSON
        const cleanedJson = extractedJson.replace(/^```json\n|^```\n|```$/g, '').trim();
        return JSON.parse(cleanedJson);
      }
    } catch (nestedError) {
      console.error("Extraction attempt failed:", nestedError);
    }
    
    return null;
  }
}

/**
 * Generate lesson content with a structured approach
 */
export async function generateLessonContent(
  params: LessonGenerationParams,
  statusCallback?: (status: AIStatus) => void
): Promise<LessonContent | null> {
  // Default status callback if none provided
  const updateStatus = statusCallback || (() => {});
  
  try {
    updateStatus({
      stage: "Preparing lesson content generation",
      progress: 10,
      provider: "AI Service"
    });
    
    // Get the lesson from cache if available
    const cacheKey = `lesson_${params.subject}_${params.topic.replace(/\s+/g, '_')}`;
    const cachedLesson = localStorage.getItem(cacheKey);
    
    if (cachedLesson) {
      updateStatus({
        stage: "Retrieved from cache",
        progress: 100,
        provider: "Cache"
      });
      return JSON.parse(cachedLesson);
    }
    
    // Create a prompt that instructs the AI to provide structured lesson content
    const prompt = `
      Create an educational lesson on "${params.topic}" for a ${params.className || ''} student studying ${params.subject}.
      
      Format your response as a JSON object with the following structure:
      {
        "title": "Lesson title",
        "explanation": ["paragraph1", "paragraph2"],
        "keyPoints": ["key point 1", "key point 2"],
        "examples": [
          {"title": "Example 1", "content": "Example content"},
          {"title": "Example 2", "content": "Example content"}
        ],
        ${params.includeVisuals ? `
        "visualAids": [
          {"title": "Aid title", "description": "Description", "visualType": "Type"},
          {"title": "Aid title", "description": "Description", "visualType": "Type"}
        ],` : ''}
        ${params.includeActivities ? `
        "activities": [
          {"title": "Activity title", "instructions": "Instructions", "learningOutcome": "Outcome"},
          {"title": "Activity title", "instructions": "Instructions", "learningOutcome": "Outcome"}
        ],` : ''}
        "interestingFacts": ["fact 1", "fact 2"],
        "summary": "Brief summary of the lesson",
        "textbookReferences": [
          {"chapter": "Chapter name", "pageNumbers": "1-10", "description": "What's in these pages"}
        ]
      }
      
      The content should be appropriate for the student's level, follow curriculum standards, and be educationally accurate.
    `;
    
    updateStatus({
      stage: "Requesting AI content generation",
      progress: 20,
      provider: "AI Service"
    });
    
    // Generate the content using our cascading AI service
    const result = await generateAIContent(
      prompt, 
      updateStatus,
      {
        subject: params.subject,
        topic: params.topic,
        className: params.className
      }
    );
    
    // If result is already an object, use it directly
    if (result && typeof result === 'object') {
      // Save to cache
      localStorage.setItem(cacheKey, JSON.stringify(result));
      
      updateStatus({
        stage: "Lesson content generated successfully",
        progress: 100,
        provider: "AI Service"
      });
      
      return result;
    }
    
    // If result is a string, try to parse it as JSON
    if (result && typeof result === 'string') {
      const parsedResult = safeParseJSON(result);
      
      if (parsedResult) {
        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify(parsedResult));
        
        updateStatus({
          stage: "Lesson content generated successfully",
          progress: 100,
          provider: "AI Service"
        });
        
        return parsedResult;
      }
    }
    
    throw new Error("Failed to generate properly structured lesson content");
    
  } catch (error) {
    console.error("Lesson generation error:", error);
    
    updateStatus({
      stage: "Error generating lesson, creating fallback content",
      progress: 50,
      provider: "System Fallback"
    });
    
    // Generate a fallback lesson
    const fallbackLesson = createFallbackLesson(params);
    
    updateStatus({
      stage: "Fallback content ready",
      progress: 100,
      provider: "System Fallback"
    });
    
    return fallbackLesson;
  }
}

/**
 * Generate lesson content with enhanced web search capabilities
 */
export async function generateLessonContentWithDeepSearch(
  params: LessonGenerationParams,
  statusCallback?: (status: AIStatus) => void
): Promise<LessonContent | null> {
  // Default status callback if none provided
  const updateStatus = statusCallback || (() => {});
  
  try {
    updateStatus({
      stage: "Preparing deep search for lesson content",
      progress: 10,
      provider: "AI Research Service"
    });
    
    // Convert our parameters to the search format
    const searchParams: LessonSearchParams = {
      subject: params.subject,
      board: params.board || 'NCERT',
      className: params.className,
      topic: params.topic,
      deepSearch: params.deepSearch
    };
    
    // Perform deep search across educational resources
    const searchResult = await deepSearchLessonContent(searchParams, updateStatus);
    
    if (!searchResult) {
      throw new Error("Deep search returned no results");
    }
    
    // Convert the search result to our standard lesson format
    const lesson: LessonContent = {
      title: searchResult.title,
      explanation: searchResult.explanation,
      keyPoints: searchResult.keyPoints,
      examples: searchResult.examples,
      visualAids: searchResult.visualAids,
      activities: searchResult.activities,
      interestingFacts: searchResult.interestingFacts,
      summary: searchResult.summary,
      // Add reference to sources
      textbookReferences: searchResult.sources.map(source => ({
        chapter: source.title,
        pageNumbers: "Web Resource",
        description: source.snippet
      }))
    };
    
    // Cache the result
    const cacheKey = `lesson_${params.subject}_${params.topic.replace(/\s+/g, '_')}`;
    localStorage.setItem(cacheKey, JSON.stringify(lesson));
    
    updateStatus({
      stage: "Deep search lesson content ready",
      progress: 100,
      provider: "AI Research Service"
    });
    
    return lesson;
    
  } catch (error) {
    console.error("Deep search lesson generation error:", error);
    
    // Fall back to standard generation
    updateStatus({
      stage: "Falling back to standard lesson generation",
      progress: 30,
      provider: "System"
    });
    
    return generateLessonContent(params, statusCallback);
  }
}

/**
 * Create a fallback lesson when AI generation fails
 */
function createFallbackLesson(params: LessonGenerationParams): LessonContent {
  const { subject, topic } = params;
  
  // Basic fallback structure
  return {
    title: topic,
    explanation: [
      `This lesson explores ${topic} as part of the ${subject} curriculum.`,
      `Understanding ${topic} helps build a foundation for more advanced concepts in ${subject}.`
    ],
    keyPoints: [
      `${topic} is an important concept in ${subject}`,
      "This topic builds on previous foundations",
      "Understanding the core principles will help with future learning"
    ],
    examples: [
      {
        title: "Basic Example",
        content: `A simple illustration of ${topic} and how it applies in real-world situations.`
      },
      {
        title: "Advanced Application",
        content: `A more complex example showing the broader implications of ${topic} in ${subject}.`
      }
    ],
    visualAids: [
      {
        title: "Conceptual Diagram",
        description: `Visual representation of key components in ${topic}`,
        visualType: "Diagram"
      }
    ],
    activities: [
      {
        title: "Practice Exercise",
        instructions: `Work through these problems related to ${topic} to reinforce your understanding.`,
        learningOutcome: "Building practical skills and conceptual understanding"
      }
    ],
    interestingFacts: [
      `${topic} has interesting historical origins and development`,
      `${topic} is applied in many modern technologies and fields`
    ],
    summary: `${topic} is a fundamental concept in ${subject} that helps explain how certain processes work and provides a foundation for more advanced study.`,
    textbookReferences: [
      {
        chapter: "Standard Curriculum",
        pageNumbers: "Varies by textbook",
        description: "Refer to your textbook's chapter on this topic for additional reading"
      }
    ]
  };
}
