
import { generateAIContent, generateEnhancedContent, AIStatus } from './aiService';
import { toast } from "sonner";

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

// Types for specific content components
export interface ExampleContent {
  title: string;
  content: string;
}

export interface VisualAidContent {
  title: string;
  description: string;
  visualType: string;
}

export interface ActivityContent {
  title: string;
  instructions: string;
  learningOutcome: string;
}

export interface TextbookReferenceContent {
  chapter: string;
  pageNumbers: string;
  description: string;
}

export interface LessonContent {
  title: string;
  keyPoints: string[];
  explanation: string[];
  examples: ExampleContent[];
  visualAids?: VisualAidContent[];
  activities?: ActivityContent[];
  summary: string;
  textbookReferences?: TextbookReferenceContent[];
  interestingFacts?: string[];
}

export interface QuizContent {
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

/**
 * Generate a complete lesson with coordinated AI services
 */
export const generateLessonContent = async (
  context: ContentGenerationContext,
  onStatusUpdate?: (status: AIStatus) => void
): Promise<LessonContent | null> => {
  try {
    // Show initial toast
    toast(`Generating ${context.subject} lesson content`, {
      description: "Coordinating AI services to create comprehensive learning material..."
    });

    // Update status if callback provided
    const updateStatus = (status: AIStatus) => {
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
    };

    // First, check if we have cached lesson content
    try {
      const cachedContent = localStorage.getItem(`lesson_${context.subject}_${context.topic.replace(/\s+/g, '_')}`);
      if (cachedContent) {
        updateStatus({
          stage: "Retrieved from cache",
          progress: 100,
          provider: "System"
        });
        return JSON.parse(cachedContent);
      }
    } catch (e) {
      console.warn("Cache check failed:", e);
    }

    // Build the prompt for lesson content generation
    const ncertAlignedPrompt = `
      Create a comprehensive educational lesson on "${context.topic}" for the subject "${context.subject}" for students in class ${context.className || '10'}.
      
      IMPORTANT: Base your response on ACTUAL NCERT textbook content for class ${context.className || '10'} ${context.subject} curriculum. Extract and structure the information to closely match what students would find in their actual textbooks.
      
      The lesson should include:
      1. Key learning points (5-7 points) that align with NCERT learning objectives
      2. Detailed explanation (3-5 paragraphs) using language and concepts from the NCERT textbook
      3. Practical examples (2-3) similar to those found in NCERT textbooks
      4. Visual learning aids (3-4 descriptions) that would complement the textbook material
      5. Hands-on activities (2-3) that reinforce curriculum concepts
      6. A concise summary that highlights the most important NCERT curriculum points
      7. References to specific textbook chapters and pages
      8. Interesting facts to engage students that connect to the core curriculum

      Format the response as a well-structured JSON object following this schema:
      {
        "title": "full topic title as it appears in NCERT",
        "keyPoints": ["point 1", "point 2", ...],
        "explanation": ["paragraph 1", "paragraph 2", ...],
        "examples": [{"title": "Example 1", "content": "..."}, ...],
        "visualAids": [{"title": "Visual 1", "description": "...", "visualType": "diagram"}, ...],
        "activities": [{"title": "Activity 1", "instructions": "...", "learningOutcome": "..."}, ...],
        "summary": "summary text",
        "textbookReferences": [{"chapter": "1", "pageNumbers": "10-15", "description": "..."}, ...],
        "interestingFacts": ["fact 1", "fact 2", ...]
      }
      
      Remember: The goal is to create content that is directly aligned with the NCERT curriculum and feels like it was extracted directly from an official textbook.
    `;

    // Generate content using the service that coordinates multiple AI providers
    const result = await generateEnhancedContent(
      ncertAlignedPrompt,
      context,
      updateStatus
    );

    if (!result) {
      throw new Error("Failed to generate lesson content");
    }

    // Try to parse the result if it's a string
    let parsedResult;
    if (typeof result === 'string') {
      try {
        parsedResult = JSON.parse(result);
      } catch (e) {
        console.error("Failed to parse lesson content as JSON:", e);
        return null;
      }
    } else {
      parsedResult = result;
    }

    // Transform to expected format
    const formattedLesson: LessonContent = {
      title: parsedResult.title || context.topic,
      keyPoints: parsedResult.keyPoints || [],
      explanation: Array.isArray(parsedResult.explanation) ? parsedResult.explanation : 
        (typeof parsedResult.explanation === 'string' ? [parsedResult.explanation] : 
        (typeof parsedResult.summary === 'string' ? [parsedResult.summary] : [])),
      examples: Array.isArray(parsedResult.examples) ? parsedResult.examples : 
        (parsedResult.exampleProblems ? parsedResult.exampleProblems.map((ep: any) => ({
          title: "Example",
          content: `Problem: ${ep.problem}\nSolution: ${ep.solution}`
        })) : []),
      summary: parsedResult.summary || "",
      visualAids: parsedResult.visualAids || [],
      activities: parsedResult.activities || [],
      textbookReferences: parsedResult.textbookReferences || [],
      interestingFacts: parsedResult.interestingFacts || []
    };

    // Cache the lesson
    try {
      localStorage.setItem(
        `lesson_${context.subject}_${context.topic.replace(/\s+/g, '_')}`, 
        JSON.stringify(formattedLesson)
      );
    } catch (e) {
      console.warn("Could not cache lesson:", e);
    }

    toast.success("Lesson content created successfully");
    return formattedLesson;
  } catch (error) {
    console.error("Error in generateLessonContent:", error);
    toast.error("Failed to generate lesson content");
    return null;
  }
};

/**
 * Generate a quiz with coordinated AI services
 */
export const generateQuizContent = async (
  context: ContentGenerationContext,
  questionCount: number = 5,
  onStatusUpdate?: (status: AIStatus) => void
): Promise<QuizContent | null> => {
  try {
    // Show initial toast
    toast(`Generating ${context.subject} quiz questions`, {
      description: "Creating assessment questions aligned with curriculum standards..."
    });

    // Update status if callback provided
    const updateStatus = (status: AIStatus) => {
      if (onStatusUpdate) {
        onStatusUpdate(status);
      }
    };

    // Check for cached quiz
    try {
      const cachedQuiz = localStorage.getItem(`quiz_${context.subject}_${context.topic.replace(/\s+/g, '_')}`);
      if (cachedQuiz) {
        updateStatus({
          stage: "Retrieved from cache",
          progress: 100,
          provider: "System"
        });
        return JSON.parse(cachedQuiz);
      }
    } catch (e) {
      console.warn("Cache check failed:", e);
    }

    // Build the prompt for quiz generation
    const prompt = `
      Create a quiz with ${questionCount} questions to test understanding of "${context.topic}" for ${context.subject} at class ${context.className || '10'} level.
      
      IMPORTANT: Base your questions on ACTUAL NCERT textbook content for this subject and class. The questions should assess understanding of key concepts as presented in the curriculum.
      
      Each question should be multiple choice with 4 options.
      
      Format the response as a JSON object with this structure:
      {
        "questions": [
          {
            "id": "q1",
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option that's correct (exact text match to one of the options)",
            "explanation": "Explanation of why the answer is correct"
          }
        ]
      }
      
      Ensure questions are:
      1. Clear and unambiguous
      2. Appropriate difficulty for class ${context.className || '10'}
      3. Focused on core concepts from the NCERT curriculum
      4. Includes a mix of recall and application questions
      5. Contains helpful explanations that reinforce learning
    `;

    // Generate content using our service
    const result = await generateAIContent(
      prompt,
      updateStatus,
      context
    );

    if (!result || (typeof result === 'object' && 'isError' in result && result.isError)) {
      throw new Error("Failed to generate quiz content");
    }

    // Try to parse the result if it's a string
    let parsedResult;
    if (typeof result === 'string') {
      try {
        parsedResult = JSON.parse(result);
      } catch (e) {
        console.error("Failed to parse quiz content as JSON:", e);
        return null;
      }
    } else {
      parsedResult = result;
    }

    // Ensure the result has the expected format
    if (!parsedResult.questions || !Array.isArray(parsedResult.questions)) {
      console.error("Quiz result is missing questions array");
      return null;
    }

    // Cache the quiz
    try {
      localStorage.setItem(
        `quiz_${context.subject}_${context.topic.replace(/\s+/g, '_')}`, 
        JSON.stringify(parsedResult)
      );
    } catch (e) {
      console.warn("Could not cache quiz:", e);
    }

    toast.success("Quiz questions created successfully");
    return parsedResult as QuizContent;
  } catch (error) {
    console.error("Error in generateQuizContent:", error);
    toast.error("Failed to generate quiz questions");
    return null;
  }
};
