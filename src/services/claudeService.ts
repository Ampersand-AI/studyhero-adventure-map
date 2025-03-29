
interface Claude {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string) => Promise<any>;
  generateLessonTest: (subject: string, topic: string, numQuestions: number) => Promise<any>;
  generateDiagram: (subject: string, topic: string, diagramType: string) => Promise<string>;
}

// API key should be moved to environment variables in production
const API_KEY = "sk-ant-api03-sfAuD93gYCJtvmHkJXbj_g.0ykJbQTEfTzzDXaxMhLpMA";

class ClaudeService implements Claude {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callClaude(prompt: string): Promise<any> {
    try {
      console.log("Calling Claude API with prompt:", prompt.substring(0, 100) + "...");
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Claude API error:", errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error("Error calling Claude API:", error);
      throw error;
    }
  }

  async generateStudyPlan(board: string, className: string, subject: string): Promise<any> {
    const prompt = `
      Create a detailed study plan for a student studying ${subject} in Class ${className} under the ${board} board. 
      
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
      
      Structure the topics in a logical learning sequence following the official curriculum.
      
      The response MUST be valid JSON that can be parsed with JSON.parse().
      
      Return ONLY the JSON, with no additional text or markdown formatting.
    `;
    
    try {
      const result = await this.callClaude(prompt);
      const cleanedResult = this.cleanJsonResponse(result);
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error("Error parsing study plan:", error);
      throw new Error("Failed to generate study plan. Please try again.");
    }
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
    
    try {
      const result = await this.callClaude(prompt);
      const cleanedResult = this.cleanJsonResponse(result);
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error("Error parsing quiz question:", error);
      throw new Error("Failed to generate quiz question. Please try again.");
    }
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
    
    try {
      const result = await this.callClaude(prompt);
      const cleanedResult = this.cleanJsonResponse(result);
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error("Error generating lesson content:", error);
      throw new Error("Failed to generate lesson content. Please try again.");
    }
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
    
    try {
      const result = await this.callClaude(prompt);
      const cleanedResult = this.cleanJsonResponse(result);
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error("Error generating lesson test:", error);
      throw new Error("Failed to generate lesson test. Please try again.");
    }
  }

  async generateDiagram(subject: string, topic: string, diagramType: string): Promise<string> {
    const prompt = `
      Create a detailed text description of a ${diagramType} diagram for "${topic}" in ${subject}.
      
      Provide a very detailed description that could help someone visualize or draw this diagram.
      Include all necessary elements, labels, relationships, and any color recommendations.
      
      The description should be thorough enough that it could be used to create an actual visual representation.
      
      Return ONLY the description text, without any additional formatting.
    `;
    
    try {
      const result = await this.callClaude(prompt);
      return result.trim();
    } catch (error) {
      console.error("Error generating diagram description:", error);
      throw new Error("Failed to generate diagram description. Please try again.");
    }
  }

  // Helper function to clean JSON response from Claude
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

export const claudeService = new ClaudeService(API_KEY);
