
interface Claude {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string) => Promise<any>;
}

// Note: In a production environment, this should be stored securely in environment variables
const API_KEY = "sk-ant-api03-K2XrNBAD1J6Ub9GPfjDt3A-AAyQJ6i4yWCGeuOTjqm-lpKVpGM5Uk0ic1iufuQButw-2lYgpbiF_5FH9xS2K_w-3SBJgQAA";

class ClaudeService implements Claude {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callClaude(prompt: string): Promise<any> {
    try {
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
      // Return a fallback study plan if there's an error
      return this.getFallbackStudyPlan(subject);
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
      return {
        question: "What is the main function of mitochondria in cells?",
        options: ["Cell division", "Protein synthesis", "Energy production", "Waste removal"],
        correctAnswer: "Energy production",
        explanation: "Mitochondria are often called the powerhouse of the cell because they generate most of the cell's supply of ATP, which is used as a source of energy."
      };
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
      return {
        title: topic,
        keyPoints: ["Key concept 1", "Key concept 2", "Key concept 3"],
        explanation: ["Detailed explanation paragraph 1.", "Detailed explanation paragraph 2."],
        examples: [{ title: "Example 1", content: "Example content" }],
        visualAids: [{ title: "Diagram", description: "A visual representation of the concept" }],
        activities: ["Activity 1 instructions", "Activity 2 instructions"],
        summary: "Summary of the key points covered in this lesson."
      };
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

  // Fallback study plan in case of API failures
  private getFallbackStudyPlan(subject: string): any {
    const topics = [
      "Introduction to " + subject,
      "Basic Concepts",
      "Intermediate Topics",
      "Advanced Applications",
      "Problem Solving Techniques",
      "Review and Assessment"
    ];
    
    const types = ["lesson", "quiz", "practice"];
    
    return {
      items: topics.map((topic, index) => ({
        id: `topic-${index + 1}`,
        title: topic,
        description: `Learn about ${topic.toLowerCase()} and how to apply these concepts.`,
        type: types[index % 3],
        content: index % 3 === 0 ? 
          "Key concepts to understand: 1) Basic principles 2) Common applications 3) Practical examples" : 
          index % 3 === 1 ? 
            "Quiz questions to test understanding of the topic" : 
            "Practice exercises to reinforce learning",
        estimatedTimeInMinutes: 30 + (index * 5)
      }))
    };
  }
}

export const claudeService = new ClaudeService(API_KEY);
