interface AI {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string) => Promise<any>;
  generateLessonTest: (subject: string, topic: string, numQuestions: number) => Promise<any>;
  generateDiagram: (subject: string, topic: string, diagramType: string) => Promise<string>;
  clearAllUserData: () => void;
}

// OpenAI API key
const API_KEY = "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";

import { toast } from "@/hooks/use-toast";

class AIService implements AI {
  private apiKey: string;
  private retryCount: number = 3;
  private retryDelay: number = 1000;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callOpenAI(prompt: string): Promise<any> {
    let attempts = 0;
    
    // Show notification about connecting to NCERT
    toast({
      title: "Connecting to NCERT Database",
      description: "Fetching educational content aligned with NCERT guidelines...",
      duration: 3000,
    });
    
    while (attempts < this.retryCount) {
      try {
        console.log("Calling OpenAI API with prompt:", prompt.substring(0, 100) + "...");
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that provides structured educational content in JSON format following NCERT guidelines for Indian education."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 4000,
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("OpenAI API error:", errorData);
          toast({
            title: "Content Loading Error",
            description: "Failed to load NCERT content. Please try again.",
            variant: "destructive",
          });
          throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log("API response received successfully");
        
        // Show success notification
        toast({
          title: "NCERT Content Loaded",
          description: "Educational materials have been successfully retrieved.",
        });
        
        return data.choices[0].message.content;
      } catch (error) {
        console.error(`Error calling OpenAI API (attempt ${attempts + 1}/${this.retryCount}):`, error);
        attempts++;
        
        if (attempts >= this.retryCount) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        // Increase delay for next retry (exponential backoff)
        this.retryDelay *= 2;
      }
    }
    
    throw new Error("Failed to call OpenAI API after multiple attempts");
  }

  async generateStudyPlan(board: string, className: string, subject: string): Promise<any> {
    const prompt = `
      Create a detailed study plan for a student studying ${subject} in Class ${className} under the ${board} board, following NCERT guidelines. 
      
      Break down the curriculum into logical teaching units. For each topic:
      - Include key concepts that need to be taught
      - Add practical exercises to reinforce learning
      - Include quizzes to test understanding
      
      Return a JSON format with an array of study items, where each item has:
      - id (string - use format "topic-1", "topic-2", etc.)
      - title (string - the name of the topic)
      - description (string - brief outline of what will be covered)
      - type: "lesson", "quiz", or "practice"
      - content: (detailed teaching notes for lessons, questions for quizzes, tasks for practice)
      - estimatedTimeInMinutes (number)
      
      Structure the topics in a logical learning sequence following the official NCERT curriculum.
      
      The response MUST be valid JSON that can be parsed with JSON.parse().
      
      Return ONLY the JSON, with no additional text or markdown formatting.
    `;
    
    console.log(`Generating study plan for ${subject}, Class ${className}, ${board} board`);
    const result = await this.callOpenAI(prompt);
    const cleanedResult = this.cleanJsonResponse(result);
    return JSON.parse(cleanedResult);
  }

  async generateQuizQuestion(subject: string, topic: string): Promise<any> {
    const prompt = `
      Create a multiple-choice question about "${topic}" for a student studying ${subject}.
      
      Return a JSON object with:
      - question (string)
      - options (array of 4 strings)
      - correctAnswer (string, must be one of the options)
      - explanation (string)
      
      The question should test understanding, not just factual recall. Make it appropriate for school students.
      
      Return ONLY the JSON, with no additional text.
    `;
    
    console.log(`Generating quiz question for ${subject}, topic: ${topic}`);
    const result = await this.callOpenAI(prompt);
    const cleanedResult = this.cleanJsonResponse(result);
    return JSON.parse(cleanedResult);
  }

  async generateLessonContent(subject: string, topic: string): Promise<any> {
    const prompt = `
      Create detailed teaching content for a lesson on "${topic}" for a student studying ${subject}.
      
      Return a JSON object with:
      - title (string)
      - keyPoints (array of strings)
      - explanation (detailed explanation broken into paragraphs as an array of strings)
      - examples (array of example objects with title and content)
      - visualAids (suggestions for diagrams or visual aids as an array of objects with title and description)
      - activities (array of interactive activities with instructions)
      - summary (string)
      
      Make it engaging, informative, and appropriate for school students.
      
      Return ONLY the JSON, with no additional text.
    `;
    
    console.log(`Generating lesson content for ${subject}, topic: ${topic}`);
    const result = await this.callOpenAI(prompt);
    const cleanedResult = this.cleanJsonResponse(result);
    return JSON.parse(cleanedResult);
  }

  async generateLessonTest(subject: string, topic: string, numQuestions: number = 5): Promise<any> {
    const prompt = `
      Create a comprehensive test with ${numQuestions} multiple-choice questions about "${topic}" for a student studying ${subject}.
      
      Return a JSON object with:
      - lessonTitle (string)
      - questions (array of question objects with:
        - question (string)
        - options (array of 4 strings)
        - correctAnswer (string, must be one of the options)
        - explanation (string that explains the correct answer)
      )
      
      The questions should thoroughly test understanding of the topic, ranging from basic recall to application and analysis.
      Make them appropriate for school students.
      
      Return ONLY the JSON, with no additional text.
    `;
    
    console.log(`Generating lesson test for ${subject}, topic: ${topic}, with ${numQuestions} questions`);
    const result = await this.callOpenAI(prompt);
    const cleanedResult = this.cleanJsonResponse(result);
    return JSON.parse(cleanedResult);
  }

  async generateDiagram(subject: string, topic: string, diagramType: string): Promise<string> {
    const prompt = `
      Create a detailed text description of a ${diagramType} diagram for "${topic}" in ${subject}.
      
      Provide a very detailed description that could help someone visualize or draw this diagram.
      Include all necessary elements, labels, relationships, and any color recommendations.
      
      The description should be thorough enough that it could be used to create an actual visual representation.
      
      Return ONLY the description text, without any additional formatting.
    `;
    
    console.log(`Generating diagram description for ${subject}, topic: ${topic}, diagram type: ${diagramType}`);
    const result = await this.callOpenAI(prompt);
    return result.trim();
  }

  async clearAllUserData(): void {
    // Display notification
    toast({
      title: "Clearing User Data",
      description: "Removing all saved progress and study plans...",
      duration: 3000,
    });
    
    // Clear all localStorage items related to the app
    localStorage.removeItem('studyPlans');
    localStorage.removeItem('studyHeroProfile');
    localStorage.removeItem('currentStudyItem');
    localStorage.removeItem('completedItems');
    localStorage.removeItem('currentLevel');
    localStorage.removeItem('currentXp');
    localStorage.removeItem('achievements');
    localStorage.removeItem('quizResults');
    localStorage.removeItem('studyStats');
    
    // Display success notification
    setTimeout(() => {
      toast({
        title: "User Data Cleared",
        description: "All your data has been removed successfully.",
      });
    }, 1000);
    
    console.log("All user data cleared from localStorage");
  }

  // Helper function to clean JSON response from API
  private cleanJsonResponse(response: string): string {
    // Remove markdown code blocks if present
    let cleanedResponse = response.replace(/```json\n|\n```|```\n|\n```/g, '');
    
    // Try to extract just the JSON part if there's additional text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    return cleanedResponse;
  }
}

export const claudeService = new AIService(API_KEY);
