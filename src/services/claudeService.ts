interface AI {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string) => Promise<any>;
  generateLessonTest: (subject: string, topic: string, numQuestions: number) => Promise<any>;
  generateDiagram: (subject: string, topic: string, diagramType: string) => Promise<string>;
}

// Using OpenAI API key instead of Claude
const API_KEY = "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";

class AIService implements AI {
  private apiKey: string;
  private retryCount: number = 3;
  private retryDelay: number = 1000;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async callOpenAI(prompt: string): Promise<any> {
    let attempts = 0;
    
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
                content: "You are a helpful assistant that provides structured educational content in JSON format."
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
          throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
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
      const result = await this.callOpenAI(prompt);
      const cleanedResult = this.cleanJsonResponse(result);
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error("Error parsing study plan:", error);
      
      // Return fallback content if API fails
      return this.getFallbackStudyPlan(subject, className);
    }
  }

  // Fallback study plan when API fails
  private getFallbackStudyPlan(subject: string, className: string): any {
    console.log("Using fallback study plan for", subject, "class", className);
    
    const fallbackPlan = {
      items: [
        {
          id: "topic-1",
          title: `Introduction to ${subject}`,
          description: `Basic concepts and fundamentals of ${subject} for Class ${className}`,
          type: "lesson",
          content: `This lesson introduces the fundamental concepts of ${subject} for students in Class ${className}.`,
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-2",
          title: `${subject} Fundamentals Quiz`,
          description: "Test your understanding of the basic concepts",
          type: "quiz",
          content: `Multiple choice questions to test understanding of ${subject} fundamentals.`,
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-3",
          title: `${subject} Practical Application`,
          description: "Apply concepts learned in real-world scenarios",
          type: "practice",
          content: `Practice exercises to apply ${subject} concepts in practical situations.`,
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-4",
          title: `Advanced ${subject} Concepts`,
          description: `Deeper exploration of important ${subject} topics`,
          type: "lesson",
          content: `Advanced concepts in ${subject} for Class ${className} students.`,
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: `${subject} Comprehensive Review`,
          description: "Review and recap of all concepts learned",
          type: "lesson",
          content: `A comprehensive review of all ${subject} topics covered so far.`,
          estimatedTimeInMinutes: 60
        }
      ]
    };
    
    return fallbackPlan;
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
      const result = await this.callOpenAI(prompt);
      const cleanedResult = this.cleanJsonResponse(result);
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error("Error parsing quiz question:", error);
      return this.getFallbackQuizQuestion(subject, topic);
    }
  }

  private getFallbackQuizQuestion(subject: string, topic: string): any {
    return {
      question: `What is the main focus of ${topic} in ${subject}?`,
      options: [
        `Understanding the basic principles`,
        `Memorizing formulas and equations`,
        `Practical applications in daily life`,
        `Historical development of the concept`
      ],
      correctAnswer: `Understanding the basic principles`,
      explanation: `The main focus of ${topic} in ${subject} is to understand the basic principles, which forms the foundation for more advanced concepts.`
    };
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
      const result = await this.callOpenAI(prompt);
      const cleanedResult = this.cleanJsonResponse(result);
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error("Error generating lesson content:", error);
      return this.getFallbackLessonContent(subject, topic);
    }
  }

  private getFallbackLessonContent(subject: string, topic: string): any {
    return {
      title: topic,
      keyPoints: [
        `Understanding the core concepts of ${topic}`,
        `How ${topic} relates to other areas of ${subject}`,
        `Practical applications of ${topic}`
      ],
      explanation: [
        `${topic} is a fundamental concept in ${subject} that helps us understand how the world works.`,
        `Scientists have been studying ${topic} for centuries, and it remains an important area of research today.`,
        `By understanding ${topic}, we can apply this knowledge to solve real-world problems.`
      ],
      examples: [
        {
          title: "Example 1",
          content: `A simple example of ${topic} in action is when we observe everyday phenomena.`
        },
        {
          title: "Example 2",
          content: `Another example can be seen in laboratory experiments where we can control variables.`
        }
      ],
      visualAids: [
        {
          title: `${topic} Process Diagram`,
          description: `A flowchart showing the steps involved in the ${topic} process.`
        },
        {
          title: `${topic} Structure`,
          description: `A labeled diagram showing the key components of ${topic}.`
        }
      ],
      activities: [
        {
          title: "Observation Activity",
          instructions: `Observe and record examples of ${topic} in your daily life for one week.`
        },
        {
          title: "Group Discussion",
          instructions: `Form groups and discuss how ${topic} impacts various aspects of our world.`
        }
      ],
      summary: `${topic} is an essential concept in ${subject} that helps us understand natural phenomena and solve problems. By mastering these concepts, students will build a strong foundation for advanced studies.`
    };
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
      const result = await this.callOpenAI(prompt);
      const cleanedResult = this.cleanJsonResponse(result);
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error("Error generating lesson test:", error);
      return this.getFallbackLessonTest(subject, topic, numQuestions);
    }
  }

  private getFallbackLessonTest(subject: string, topic: string, numQuestions: number): any {
    const questions = [];
    
    for (let i = 1; i <= numQuestions; i++) {
      questions.push({
        question: `Question ${i} about ${topic} in ${subject}?`,
        options: [
          `Answer option A for question ${i}`,
          `Answer option B for question ${i}`,
          `Answer option C for question ${i}`,
          `Answer option D for question ${i}`
        ],
        correctAnswer: `Answer option A for question ${i}`,
        explanation: `Explanation for why answer A is correct for question ${i}.`
      });
    }
    
    return {
      lessonTitle: topic,
      questions: questions
    };
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
      const result = await this.callOpenAI(prompt);
      return result.trim();
    } catch (error) {
      console.error("Error generating diagram description:", error);
      return this.getFallbackDiagram(subject, topic, diagramType);
    }
  }

  private getFallbackDiagram(subject: string, topic: string, diagramType: string): string {
    return `
      ${diagramType.toUpperCase()} DIAGRAM: ${topic} in ${subject}
      
      This diagram illustrates the key components and relationships in ${topic}.
      
      Main elements:
      1. Central concept: ${topic} (placed in the center)
      2. Related concepts (surrounding the central concept)
      3. Connecting arrows showing relationships
      
      Color scheme:
      - Main concept: Blue
      - Secondary concepts: Green
      - Relationships: Gray arrows
      
      Key labels include the main terminology associated with ${topic} and brief explanations of each connection.
    `.trim();
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
