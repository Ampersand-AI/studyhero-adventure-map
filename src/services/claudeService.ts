import OpenAI from 'openai';

// Replace 'YOUR_API_KEY' with your actual OpenAI API key
const API_KEY = process.env.OPENAI_API_KEY;

class AIService {
  private openai: OpenAI;

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateStudyPlan(board: string, className: string, subject: string) {
    try {
      const prompt = `Generate a comprehensive study plan for ${subject} for class ${className} under the ${board} board. The plan should cover all major topics and subtopics, and for each topic, suggest the type (lesson, quiz, practice). Each item should have an id, title, description, type, content, and estimatedTimeInMinutes.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message?.content;

      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      try {
        const plan = JSON.parse(content);
        return plan;
      } catch (parseError) {
        console.error("Failed to parse JSON content:", content);
        throw new Error("Failed to parse study plan data");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      throw error;
    }
  }

  async generateQuizQuestion(subject: string, topic: string) {
    try {
      const prompt = `Generate a single quiz question about ${topic} in the subject of ${subject}. Include four multiple-choice options (options) and indicate the correct answer (correctAnswer). Also, provide a brief explanation of why the correct answer is right (explanation).`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [{ role: "system", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0].message?.content;

      if (!content) {
        throw new Error("No content received from OpenAI");
      }

      try {
        const question = JSON.parse(content);
        return question;
      } catch (parseError) {
        console.error("Failed to parse JSON content:", content);
        throw new Error("Failed to parse quiz question data");
      }
    } catch (error) {
      console.error("Error generating quiz question:", error);
      throw error;
    }
  }

  clearAllUserData() {
    // Remove all keys from localStorage
    localStorage.clear();
  }

  // Method for generating a comprehensive science study plan
  private getComprehensiveSciencePlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Scientific Method and Inquiry",
          description: "Understanding the process of scientific investigation",
          type: "lesson",
          content: "This lesson covers the steps of the scientific method and how to conduct experiments.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-2",
          title: "Matter and Its Properties",
          description: "Physical and chemical properties of matter",
          type: "lesson",
          content: "Learn about states of matter, physical and chemical changes, and properties.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "Atomic Structure",
          description: "Atoms, elements, and the periodic table",
          type: "quiz",
          content: "Test your understanding of atomic structure and the organization of elements.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "Forces and Motion",
          description: "Newton's laws and principles of motion",
          type: "practice",
          content: "Practice problems related to forces, motion, and Newton's laws.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: "Energy and Work",
          description: "Different forms of energy and energy transformations",
          type: "lesson",
          content: "Learn about potential and kinetic energy, conservation of energy, and work.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-6",
          title: "Cells and Life Processes",
          description: "Cell structure, function, and basic life processes",
          type: "lesson",
          content: "Understanding the fundamental unit of life and how organisms maintain homeostasis.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-7",
          title: "Genetics and Heredity",
          description: "DNA, genes, and inheritance patterns",
          type: "quiz",
          content: "Test your knowledge of genetics and how traits are passed from parents to offspring.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Ecology and Ecosystems",
          description: "Relationships between organisms and their environment",
          type: "practice",
          content: "Practice analyzing food webs, energy flow, and ecological interactions.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-9",
          title: "Earth Systems",
          description: "Earth's structure, geological processes, and natural resources",
          type: "lesson",
          content: "Explore the layers of Earth, plate tectonics, and the rock cycle.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-10",
          title: "Space Science",
          description: "Solar system, stars, and space exploration",
          type: "quiz",
          content: "Test your understanding of astronomical objects and phenomena.",
          estimatedTimeInMinutes: 30
        }
      ]
    };
  }
}

// Export an instance of AIService
export const claudeService = new AIService(API_KEY);
