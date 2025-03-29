
interface Claude {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
}

const API_KEY = "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";

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
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

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
      - id (string)
      - title (string - the name of the topic)
      - description (string - brief outline of what will be covered)
      - type: "lesson", "quiz", or "practice"
      - content: (detailed teaching notes for lessons, questions for quizzes, tasks for practice)
      - estimatedTimeInMinutes (number)
      
      Structure the topics in a logical learning sequence following the official curriculum.
      
      Return ONLY the JSON, with no additional text.
    `;
    
    const result = await this.callClaude(prompt);
    try {
      // Extract JSON from the result (in case Claude adds extra text)
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || result.match(/```\n([\s\S]*?)\n```/) || [null, result];
      const jsonStr = jsonMatch[1] || result;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing study plan:", error);
      return { items: [] };
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
    
    const result = await this.callClaude(prompt);
    try {
      // Extract JSON from the result
      const jsonMatch = result.match(/```json\n([\s\S]*?)\n```/) || result.match(/```\n([\s\S]*?)\n```/) || [null, result];
      const jsonStr = jsonMatch[1] || result;
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error parsing quiz question:", error);
      return {
        question: "Error generating question",
        options: ["Error", "Error", "Error", "Error"],
        correctAnswer: "Error",
        explanation: "There was an error generating this question."
      };
    }
  }
}

export const claudeService = new ClaudeService(API_KEY);
