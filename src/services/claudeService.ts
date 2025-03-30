import { v4 as uuidv4 } from 'uuid';

const API_KEY = process.env.NEXT_PUBLIC_CLAUDE_AI_API_KEY;

interface StudyItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  content: string;
  estimatedTimeInMinutes: number;
  subject?: string;
}

interface StudyPlanResponse {
  items: StudyItem[];
}

class AIService {
  private apiKey: string | undefined;

  constructor(apiKey: string | undefined) {
    this.apiKey = apiKey;
  }

  async generateStudyPlan(board: string, className: string, subject: string): Promise<StudyPlanResponse> {
    // Check if API key is available
    if (!this.apiKey) {
      console.error("Claude AI API key is missing.");
      throw new Error("API key is required to generate study plans.");
    }

    // Use default plans for testing purposes
    if (process.env.NODE_ENV === 'development') {
      console.log("Using default study plan for development environment.");
      return this.getDefaultStudyPlan(subject);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'Anthropic-Version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-2",
          max_tokens: 2048,
          messages: [{
            role: "user",
            content: `Create a detailed study plan for a student in ${className} studying under the ${board} board for the subject ${subject}.
                      The study plan should include a list of topics, each with a title, a short description, the type of activity (lesson, quiz, or practice),
                      and an estimated time in minutes. Structure the plan to include daily lessons that are concise and easy to understand,
                      and incorporate weekly tests to assess the student's progress. The response should be a JSON object with a single key "items" which is an array of these topics.`
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.content && data.content.length > 0) {
        try {
          const plan = JSON.parse(data.content[0].text);
          return plan as StudyPlanResponse;
        } catch (e) {
          console.error("Failed to parse study plan JSON", e);
          throw new Error("Failed to parse the study plan from the AI's response.");
        }
      } else {
        throw new Error("No content received from Claude AI.");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
      throw new Error(`Failed to generate study plan: ${error}`);
    }
  }

  clearAllUserData() {
    // Clear localStorage
    localStorage.clear();
  }

  private getDefaultStudyPlan(subject: string): StudyPlanResponse {
    switch (subject.toLowerCase()) {
      case "mathematics":
        return this.getComprehensiveMathPlan();
      case "science":
        return this.getComprehensiveSciencePlan();
      case "english":
        return this.getComprehensiveEnglishPlan();
      default:
        return this.getComprehensiveSciencePlan();
    }
  }

  // Comprehensive Math Plan
  private getComprehensiveMathPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Basic Arithmetic",
          description: "Introduction to addition, subtraction, multiplication, and division",
          type: "lesson",
          content: "Learn the fundamental operations of arithmetic.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-2",
          title: "Fractions and Decimals",
          description: "Understanding fractions, decimals, and their operations",
          type: "lesson",
          content: "Learn how to add, subtract, multiply, and divide fractions and decimals.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-3",
          title: "Weekly Test: Arithmetic Fundamentals",
          description: "Test your understanding of arithmetic operations",
          type: "quiz",
          content: "Test your knowledge of basic arithmetic.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-4",
          title: "Introduction to Algebra",
          description: "Basic algebraic expressions and equations",
          type: "lesson",
          content: "Learn about variables, expressions, and solving simple equations.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-5",
          title: "Solving Linear Equations",
          description: "Techniques for solving linear equations",
          type: "practice",
          content: "Practice solving linear equations with one variable.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-6",
          title: "Weekly Test: Algebra Basics",
          description: "Test your understanding of algebraic expressions and equations",
          type: "quiz",
          content: "Quiz on basic algebra concepts.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-7",
          title: "Geometry Basics",
          description: "Introduction to geometric shapes and concepts",
          type: "lesson",
          content: "Learn about points, lines, angles, and basic shapes.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Area and Perimeter",
          description: "Calculating area and perimeter of basic shapes",
          type: "practice",
          content: "Practice calculating area and perimeter of squares, rectangles, and triangles.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-9",
          title: "Weekly Test: Geometry Fundamentals",
          description: "Test your knowledge of geometric shapes and area/perimeter calculations",
          type: "quiz",
          content: "Test your knowledge of basic geometry.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-10",
          title: "Data Analysis",
          description: "Introduction to data analysis and statistics",
          type: "lesson",
          content: "Learn about collecting, organizing, and interpreting data.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-11",
          title: "Probability",
          description: "Basic concepts of probability",
          type: "practice",
          content: "Practice calculating probabilities of simple events.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-12",
          title: "Weekly Test: Data Analysis and Probability",
          description: "Test your understanding of data analysis and probability",
          type: "quiz",
          content: "Quiz covering data analysis and probability concepts.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-13",
          title: "Advanced Algebra",
          description: "More complex algebraic equations and systems",
          type: "lesson",
          content: "Learn about solving systems of equations and inequalities.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-14",
          title: "Trigonometry",
          description: "Introduction to trigonometric functions",
          type: "lesson",
          content: "Learn about sine, cosine, and tangent functions.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-15",
          title: "Final Comprehensive Test",
          description: "Test your understanding of all major math topics",
          type: "quiz",
          content: "A comprehensive test covering all the topics learned in the course.",
          estimatedTimeInMinutes: 60
        }
      ]
    };
  }

  // Comprehensive English Plan
  private getComprehensiveEnglishPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Grammar Essentials",
          description: "Basic grammar rules and sentence structure",
          type: "lesson",
          content: "Learn about nouns, verbs, adjectives, and adverbs.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-2",
          title: "Reading Comprehension",
          description: "Techniques for understanding written text",
          type: "lesson",
          content: "Learn how to identify main ideas, supporting details, and inferences.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "Weekly Test: Grammar and Comprehension",
          description: "Test your understanding of grammar rules and reading skills",
          type: "quiz",
          content: "Test your knowledge of grammar and reading comprehension.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "Essay Writing",
          description: "Introduction to essay writing",
          type: "lesson",
          content: "Learn how to write a basic essay with an introduction, body paragraphs, and conclusion.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-5",
          title: "Vocabulary Building",
          description: "Techniques for expanding your vocabulary",
          type: "practice",
          content: "Practice using new words in sentences.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-6",
          title: "Weekly Test: Writing and Vocabulary",
          description: "Test your writing skills and vocabulary knowledge",
          type: "quiz",
          content: "Quiz on essay writing and vocabulary.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-7",
          title: "Literary Analysis",
          description: "Introduction to literary analysis",
          type: "lesson",
          content: "Learn how to analyze literary works.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-8",
          title: "Fiction",
          description: "Introduction to Fiction",
          type: "practice",
          content: "Practice analyzing fiction works.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-9",
          title: "Non-Fiction",
          description: "Introduction to Non-Fiction",
          type: "lesson",
          content: "Learn about different types of non-fiction and their uses.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-10",
          title: "Public Speaking",
          description: "Techniques for Public Speaking",
          type: "quiz",
          content: "Test your understanding of public speaking techniques.",
          estimatedTimeInMinutes: 30
        }
      ]
    };
  }

  // Comprehensive Science Plan for the default fallback
  private getComprehensiveSciencePlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Scientific Method and Inquiry",
          description: "Understanding the process of scientific investigation",
          type: "lesson",
          content: "This lesson covers the steps of the scientific method and how to conduct experiments.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-2",
          title: "Matter and Its Properties",
          description: "Physical and chemical properties of matter",
          type: "lesson",
          content: "Learn about states of matter, physical and chemical changes, and properties.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-3",
          title: "Weekly Test: Scientific Fundamentals",
          description: "Test your understanding of scientific methods and matter",
          type: "quiz",
          content: "Test your understanding of the scientific method and properties of matter.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-4",
          title: "Atomic Structure",
          description: "Atoms, elements, and the periodic table",
          type: "lesson",
          content: "Understanding the fundamental structure of atoms and the organization of elements.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-5",
          title: "Forces and Motion",
          description: "Newton's laws and principles of motion",
          type: "practice",
          content: "Practice problems related to forces, motion, and Newton's laws.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-6",
          title: "Weekly Test: Physics Fundamentals",
          description: "Test your understanding of atoms and forces",
          type: "quiz",
          content: "Quiz on atomic structure and forces in motion.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-7",
          title: "Energy and Work",
          description: "Different forms of energy and energy transformations",
          type: "lesson",
          content: "Learn about potential and kinetic energy, conservation of energy, and work.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Cells and Life Processes",
          description: "Cell structure, function, and basic life processes",
          type: "lesson",
          content: "Understanding the fundamental unit of life and how organisms maintain homeostasis.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-9",
          title: "Weekly Test: Energy and Biology",
          description: "Test your knowledge of energy concepts and cell biology",
          type: "quiz",
          content: "Test your knowledge of energy concepts and basic biology.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-10",
          title: "Genetics and Heredity",
          description: "DNA, genes, and inheritance patterns",
          type: "lesson",
          content: "Learn about how traits are passed from parents to offspring.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-11",
          title: "Ecology and Ecosystems",
          description: "Relationships between organisms and their environment",
          type: "practice",
          content: "Practice analyzing food webs, energy flow, and ecological interactions.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-12",
          title: "Weekly Test: Genetics and Ecology",
          description: "Test your understanding of genetics and ecosystems",
          type: "quiz",
          content: "Quiz covering genetics, heredity, and ecological concepts.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-13",
          title: "Earth Systems",
          description: "Earth's structure, geological processes, and natural resources",
          type: "lesson",
          content: "Explore the layers of Earth, plate tectonics, and the rock cycle.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-14",
          title: "Space Science",
          description: "Solar system, stars, and space exploration",
          type: "lesson",
          content: "Learn about our solar system, stars, and the universe.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-15",
          title: "Final Comprehensive Test",
          description: "Test your understanding of all major science topics",
          type: "quiz",
          content: "A comprehensive test covering all the topics learned in the course.",
          estimatedTimeInMinutes: 60
        }
      ]
    };
  }
}

// Export an instance of AIService
export const claudeService = new AIService(API_KEY);
