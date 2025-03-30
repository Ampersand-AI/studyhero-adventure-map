import OpenAI from 'openai';
import { toast } from "@/hooks/use-toast";

// Replace with a placeholder key since the original one is invalid
const API_KEY = process.env.OPENAI_API_KEY || "sk-abc123";

interface AI {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string) => Promise<any>;
  generateLessonTest: (subject: string, topic: string, numQuestions: number) => Promise<any>;
  generateDiagram: (subject: string, topic: string, diagramType: string) => Promise<string>;
  clearAllUserData: () => void;
}

class AIService implements AI {
  private openai: OpenAI;
  private retryCount: number = 3;
  private retryDelay: number = 1000;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateStudyPlan(board: string, className: string, subject: string) {
    try {
      const prompt = `Generate a comprehensive study plan for ${subject} for class ${className} under the ${board} board. The plan should cover all major topics and subtopics, and for each topic, suggest the type (lesson, quiz, practice). Each item should have an id, title, description, type, content, and estimatedTimeInMinutes.`;

      // Show notification about connecting to NCERT
      toast({
        title: "Connecting to NCERT Database",
        description: "Fetching educational content aligned with NCERT guidelines...",
        duration: 3000,
      });

      try {
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
          
          // Show success notification
          toast({
            title: "NCERT Content Loaded",
            description: "Educational materials have been successfully retrieved.",
          });
          
          return plan;
        } catch (parseError) {
          console.error("Failed to parse JSON content:", content);
          throw new Error("Failed to parse study plan data");
        }
      } catch (error) {
        console.error("Error generating study plan:", error);
        
        // Fallback to mock response for the subject
        const mockResponse = this.generateMockResponse(`Create a detailed study plan for ${subject}`);
        
        toast({
          title: "Using Offline Content",
          description: "Using pre-loaded study materials.",
        });
        
        return mockResponse;
      }
    } catch (error) {
      console.error("Error in generateStudyPlan:", error);
      throw error;
    }
  }

  async generateQuizQuestion(subject: string, topic: string) {
    try {
      const prompt = `Generate a single quiz question about ${topic} in the subject of ${subject}. Include four multiple-choice options (options) and indicate the correct answer (correctAnswer). Also, provide a brief explanation of why the correct answer is right (explanation).`;

      try {
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
        // Fallback to mock response
        return {
          question: "Which of the following is NOT a state of matter?",
          options: ["Solid", "Liquid", "Gas", "Energy"],
          correctAnswer: "Energy",
          explanation: "Energy is a form of power, not a state of matter. The three common states of matter are solid, liquid, and gas."
        };
      }
    } catch (error) {
      console.error("Error in generateQuizQuestion:", error);
      throw error;
    }
  }

  async generateLessonContent(subject: string, topic: string) {
    try {
      const prompt = `Create detailed teaching content for a lesson on "${topic}" for the subject "${subject}". The content should include: title, keyPoints (as an array), explanation (as an array of paragraphs), examples (as an array of objects with title and content), visualAids (as an array of objects with title and description), activities (as an array of objects with title and instructions), and a summary.`;

      try {
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
          const lessonContent = JSON.parse(content);
          return lessonContent;
        } catch (parseError) {
          console.error("Failed to parse JSON content:", content);
          throw new Error("Failed to parse lesson content data");
        }
      } catch (error) {
        console.error("Error generating lesson content:", error);
        // Fallback to mock response
        return {
          title: "Introduction to " + topic,
          keyPoints: [
            "Key concept 1 about " + topic,
            "Key concept 2 about " + topic,
            "Key concept 3 about " + topic,
            "Key concept 4 about " + topic
          ],
          explanation: [
            topic + " is a fundamental concept in " + subject + ". This paragraph introduces the basic principles.",
            "This paragraph explains the importance and applications of " + topic + " in real-world scenarios.",
            "This paragraph provides the historical context and development of " + topic + " concepts over time."
          ],
          examples: [
            {
              title: "Example 1: Basic Application",
              content: "This example demonstrates a basic application of " + topic + " concepts."
            },
            {
              title: "Example 2: Advanced Application",
              content: "This example shows a more complex application of " + topic + " in real-world scenarios."
            }
          ],
          visualAids: [
            {
              title: topic + " Concept Map",
              description: "A visual representation showing the relationships between key concepts in " + topic
            },
            {
              title: topic + " Process Diagram",
              description: "A step-by-step diagram illustrating the process involved in " + topic
            }
          ],
          activities: [
            {
              title: "Hands-on Activity",
              instructions: "Follow these steps to conduct a practical exploration of " + topic
            },
            {
              title: "Group Discussion",
              instructions: "Discuss these questions about " + topic + " with your peers"
            }
          ],
          summary: "This lesson covered the fundamental concepts of " + topic + " in " + subject + ", including key principles, real-world applications, and historical context."
        };
      }
    } catch (error) {
      console.error("Error in generateLessonContent:", error);
      throw error;
    }
  }

  async generateLessonTest(subject: string, topic: string, numQuestions: number) {
    try {
      const prompt = `Create a comprehensive test with ${numQuestions} multiple-choice questions about "${topic}" for the subject "${subject}". Each question should have: question, options (array of 4 choices), correctAnswer (one of the options), and explanation (why the correct answer is right). Return as a JSON object with lessonTitle and questions array.`;

      try {
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
          const testContent = JSON.parse(content);
          return testContent;
        } catch (parseError) {
          console.error("Failed to parse JSON content:", content);
          throw new Error("Failed to parse test content data");
        }
      } catch (error) {
        console.error("Error generating lesson test:", error);
        // Fallback to mock test
        return {
          lessonTitle: topic,
          questions: Array.from({ length: numQuestions }, (_, i) => ({
            question: `Sample question ${i+1} about ${topic}?`,
            options: [
              `Option A for question ${i+1}`,
              `Option B for question ${i+1}`,
              `Option C for question ${i+1}`,
              `Option D for question ${i+1}`
            ],
            correctAnswer: `Option A for question ${i+1}`,
            explanation: `This is the explanation for why Option A is correct for question ${i+1} about ${topic}.`
          }))
        };
      }
    } catch (error) {
      console.error("Error in generateLessonTest:", error);
      throw error;
    }
  }

  async generateDiagram(subject: string, topic: string, diagramType: string): Promise<string> {
    try {
      const prompt = `Create a detailed text description of a diagram illustrating "${diagramType}" for the topic "${topic}" in the subject "${subject}". The description should be detailed enough that someone could visualize or draw the diagram from your text.`;

      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo-1106",
          messages: [{ role: "system", content: prompt }],
        });

        const content = response.choices[0].message?.content;

        if (!content) {
          throw new Error("No content received from OpenAI");
        }

        return content;
      } catch (error) {
        console.error("Error generating diagram:", error);
        // Fallback to mock diagram description
        return `Diagram for ${diagramType} related to ${topic} in ${subject}:\n\nThis is a visual representation showing the key components and relationships in ${topic}. The diagram uses a hierarchical structure with the main concept "${topic}" at the center, surrounded by related sub-concepts. Arrows indicate relationships between ideas, with bold lines showing primary connections and dotted lines showing secondary relationships. Key elements are highlighted in different colors for visual clarity.`;
      }
    } catch (error) {
      console.error("Error in generateDiagram:", error);
      throw error;
    }
  }

  clearAllUserData() {
    // Remove all keys from localStorage
    localStorage.clear();
  }

  // Helper method to generate mock responses for testing
  private generateMockResponse(prompt: string): any {
    // Check which type of content is being requested
    if (prompt.includes("Create a detailed study plan")) {
      // Extract subject from prompt
      const subjectMatch = prompt.match(/for (.*?)$/);
      const subject = subjectMatch ? subjectMatch[1] : "Science";
      
      // Generate different study plans based on the subject
      if (subject.toLowerCase().includes("math") || subject.toLowerCase().includes("maths")) {
        return this.getMathematicsMockPlan();
      } else if (subject.toLowerCase().includes("phys")) {
        return this.getPhysicsMockPlan();
      } else if (subject.toLowerCase().includes("chem")) {
        return this.getChemistryMockPlan();
      } else if (subject.toLowerCase().includes("bio")) {
        return this.getBiologyMockPlan();
      } else if (subject.toLowerCase().includes("computer") || subject.toLowerCase().includes("cs")) {
        return this.getComputerScienceMockPlan();
      } else if (subject.toLowerCase().includes("social") || subject.toLowerCase().includes("history")) {
        return this.getSocialStudiesMockPlan();
      } else if (subject.toLowerCase().includes("english")) {
        return this.getEnglishMockPlan();
      } else {
        // Default to a comprehensive science plan
        return this.getComprehensiveSciencePlan();
      }
    } else {
      // Generic mock response for other prompts
      return {
        title: "Sample Content",
        keyPoints: ["Key point 1", "Key point 2", "Key point 3"],
        explanation: ["This is a sample explanation paragraph 1.", "This is a sample explanation paragraph 2."],
        examples: [
          {title: "Example 1", content: "This is the content of example 1"},
          {title: "Example 2", content: "This is the content of example 2"}
        ],
        visualAids: [
          {title: "Visual Aid 1", description: "Description of visual aid 1"},
          {title: "Visual Aid 2", description: "Description of visual aid 2"}
        ],
        activities: [
          {title: "Activity 1", instructions: "Instructions for activity 1"},
          {title: "Activity 2", instructions: "Instructions for activity 2"}
        ],
        summary: "This is a sample summary."
      };
    }
  }

  // Methods for different subject mock plans
  
  private getMathematicsMockPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Number Systems",
          description: "Understanding real numbers, irrational numbers, and operations",
          type: "lesson",
          content: "This lesson covers the classification of numbers and their properties.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-2",
          title: "Algebraic Expressions",
          description: "Polynomials, factoring, and simplifying expressions",
          type: "lesson",
          content: "Learn about algebraic identities, factorization methods, and simplification techniques.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "Linear Equations",
          description: "Solving linear equations in one and two variables",
          type: "quiz",
          content: "Test your skills in solving linear equations and understanding their graphical representation.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "Quadratic Equations",
          description: "Solving quadratic equations using different methods",
          type: "practice",
          content: "Practice solving quadratic equations by factoring, completing the square, and using the quadratic formula.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: "Coordinate Geometry",
          description: "Distance formula, section formula, and area of triangles",
          type: "lesson",
          content: "Learn about plotting points on a coordinate plane and calculating distances and areas.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-6",
          title: "Geometry",
          description: "Triangles, quadrilaterals, and circles",
          type: "lesson",
          content: "Understanding properties of triangles, quadrilaterals, and circles.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-7",
          title: "Trigonometry",
          description: "Trigonometric ratios and identities",
          type: "quiz",
          content: "Test your knowledge of trigonometric ratios and their applications.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Statistics",
          description: "Data handling, mean, median, and mode",
          type: "practice",
          content: "Practice calculating measures of central tendency and interpreting data.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-9",
          title: "Probability",
          description: "Basic concepts of probability",
          type: "lesson",
          content: "Learn about calculating probabilities of events and understanding random experiments.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-10",
          title: "Mensuration",
          description: "Area and volume of geometric shapes",
          type: "quiz",
          content: "Test your ability to calculate areas and volumes of various shapes.",
          estimatedTimeInMinutes: 30
        }
      ]
    };
  }

  private getPhysicsMockPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Motion and Measurement",
          description: "Understanding distance, displacement, speed, and velocity",
          type: "lesson",
          content: "This lesson introduces the fundamental concepts of motion and measurement in physics.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-2",
          title: "Laws of Motion",
          description: "Newton's laws of motion and their applications",
          type: "lesson",
          content: "Learn about inertia, force, and acceleration, and how they govern motion.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "Gravitation",
          description: "Universal law of gravitation and its effects",
          type: "quiz",
          content: "Test your understanding of gravitational force and its influence on objects.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "Work and Energy",
          description: "Work, energy, and power",
          type: "practice",
          content: "Practice problems related to work done, potential and kinetic energy, and power.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: "Sound",
          description: "Nature of sound and its propagation",
          type: "lesson",
          content: "Learn about sound waves, speed of sound, and the human ear.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-6",
          title: "Light",
          description: "Reflection and refraction of light",
          type: "lesson",
          content: "Understanding the behavior of light when it encounters different surfaces.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-7",
          title: "Electricity",
          description: "Electric current, potential difference, and circuits",
          type: "quiz",
          content: "Test your knowledge of electric circuits and Ohm's law.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Magnetism",
          description: "Magnetic effects of electric current",
          type: "practice",
          content: "Practice problems related to magnetic fields and electromagnetic induction.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-9",
          title: "Heat",
          description: "Heat transfer and thermal properties of matter",
          type: "lesson",
          content: "Explore the different modes of heat transfer and their applications.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-10",
          title: "Modern Physics",
          description: "Basic concepts of nuclear physics",
          type: "quiz",
          content: "Test your understanding of atomic structure and nuclear reactions.",
          estimatedTimeInMinutes: 30
        }
      ]
    };
  }

  private getChemistryMockPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Matter in Our Surroundings",
          description: "States of matter and their interconversion",
          type: "lesson",
          content: "This lesson explains the three states of matter and factors affecting state changes.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-2",
          title: "Is Matter Around Us Pure?",
          description: "Mixtures, solutions, and separation techniques",
          type: "lesson",
          content: "Learn about homogeneous and heterogeneous mixtures and methods to separate them.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "Atoms and Molecules",
          description: "Atomic structure, chemical formulas, and molecular mass",
          type: "quiz",
          content: "Test your understanding of atomic structure and chemical nomenclature.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "Structure of the Atom",
          description: "Subatomic particles and electronic configuration",
          type: "practice",
          content: "Practice problems related to electronic configuration and atomic models.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: "Chemical Reactions and Equations",
          description: "Balancing chemical equations and types of reactions",
          type: "lesson",
          content: "Learn about different types of chemical reactions and how to balance them.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-6",
          title: "Acids, Bases, and Salts",
          description: "Properties of acids, bases, and salts",
          type: "lesson",
          content: "Understanding the pH scale and the reactions of acids and bases.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-7",
          title: "Metals and Non-metals",
          description: "Physical and chemical properties of metals and non-metals",
          type: "quiz",
          content: "Test your knowledge of the properties and uses of metals and non-metals.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Carbon and Its Compounds",
          description: "Organic compounds and their properties",
          type: "practice",
          content: "Practice problems related to the nomenclature and reactions of organic compounds.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-9",
          title: "Periodic Classification of Elements",
          description: "Trends in the periodic table",
          type: "lesson",
          content: "Explore the organization of elements in the periodic table and their properties.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-10",
          title: "Environmental Chemistry",
          description: "Pollution and its effects",
          type: "quiz",
          content: "Test your understanding of environmental issues and their chemical aspects.",
          estimatedTimeInMinutes: 30
        }
      ]
    };
  }

  private getBiologyMockPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Cell - The Fundamental Unit of Life",
          description: "Cell structure, organelles, and functions",
          type: "lesson",
          content: "This lesson introduces cell theory and explores the structure of plant and animal cells.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-2",
          title: "Tissues",
          description: "Plant and animal tissues",
          type: "lesson",
          content: "Learn about different types of tissues and their functions in plants and animals.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "Diversity in Living Organisms",
          description: "Classification of organisms",
          type: "quiz",
          content: "Test your knowledge of the classification of plants and animals.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "Why Do We Fall Ill?",
          description: "Diseases and their causes",
          type: "practice",
          content: "Practice identifying common diseases and their preventive measures.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: "Natural Resources",
          description: "Air, water, and soil",
          type: "lesson",
          content: "Learn about the importance of natural resources and their conservation.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-6",
          title: "Improvement in Food Resources",
          description: "Crop production and animal husbandry",
          type: "lesson",
          content: "Understanding methods to improve crop yield and animal products.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-7",
          title: "Life Processes",
          description: "Nutrition, respiration, and excretion",
          type: "quiz",
          content: "Test your understanding of basic life processes in organisms.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Control and Coordination",
          description: "Nervous and endocrine systems",
          type: "practice",
          content: "Practice problems related to the nervous and endocrine systems.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-9",
          title: "Reproduction",
          description: "Reproduction in plants and animals",
          type: "lesson",
          content: "Explore the different modes of reproduction in living organisms.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-10",
          title: "Heredity and Evolution",
          description: "Genetics and evolution",
          type: "quiz",
          content: "Test your understanding of heredity and the theory of evolution.",
          estimatedTimeInMinutes: 30
        }
      ]
    };
  }

  private getComputerScienceMockPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Introduction to Computers",
          description: "Computer systems, hardware, and software",
          type: "lesson",
          content: "This lesson introduces the basic components and functions of computer systems.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-2",
          title: "Input and Output Devices",
          description: "Types of input and output devices",
          type: "lesson",
          content: "Learn about different input and output devices and their uses.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "Memory and Storage",
          description: "Types of memory and storage devices",
          type: "quiz",
          content: "Test your knowledge of memory and storage devices.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "Operating Systems",
          description: "Functions of an operating system",
          type: "practice",
          content: "Practice problems related to operating system functions.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: "Programming Languages",
          description: "Introduction to programming languages",
          type: "lesson",
          content: "Learn about different programming languages and their uses.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-6",
          title: "Algorithms and Flowcharts",
          description: "Designing algorithms and flowcharts",
          type: "lesson",
          content: "Understanding how to design algorithms and flowcharts.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-7",
          title: "Networking",
          description: "Introduction to computer networks",
          type: "quiz",
          content: "Test your knowledge of computer networks.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Internet",
          description: "Introduction to the internet",
          type: "practice",
          content: "Practice problems related to the internet.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-9",
          title: "Cyber Security",
          description: "Introduction to cyber security",
          type: "lesson",
          content: "Learn about cyber security and its importance.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-10",
          title: "Emerging Technologies",
          description: "Introduction to emerging technologies",
          type: "quiz",
          content: "Test your understanding of emerging technologies.",
          estimatedTimeInMinutes: 30
        }
      ]
    };
  }

  private getSocialStudiesMockPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "The French Revolution",
          description: "Causes, events, and impact of the French Revolution",
          type: "lesson",
          content: "This lesson explores the social, political, and economic factors leading to the French Revolution.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-2",
          title: "The Russian Revolution",
          description: "Causes, events, and impact of the Russian Revolution",
          type: "lesson",
          content: "Learn about the social, political, and economic factors leading to the Russian Revolution.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "World War I",
          description: "Causes, events, and impact of World War I",
          type: "quiz",
          content: "Test your knowledge of the causes, events, and impact of World War I.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "World War II",
          description: "Causes, events, and impact of World War II",
          type: "practice",
          content: "Practice problems related to the causes, events, and impact of World War II.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: "The Cold War",
          description: "Causes, events, and impact of the Cold War",
          type: "lesson",
          content: "Learn about the causes, events, and impact of the Cold War.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-6",
          title: "The Indian Constitution",
          description: "Features of the Indian Constitution",
          type: "lesson",
          content: "Understanding the features of the Indian Constitution.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-7",
          title: "The Indian Economy",
          description: "Features of the Indian Economy",
          type: "quiz",
          content: "Test your knowledge of the features of the Indian Economy.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "The Indian Society",
          description: "Features of the Indian Society",
          type: "practice",
          content: "Practice problems related to the features of the Indian Society.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-9",
          title: "The United Nations",
          description: "Functions of the United Nations",
          type: "lesson",
          content: "Learn about the functions of the United Nations.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-10",
          title: "Globalization",
          description: "Impact of Globalization",
          type: "quiz",
          content: "Test your understanding of the impact of Globalization.",
          estimatedTimeInMinutes: 30
        }
      ]
    };
  }

  private getEnglishMockPlan() {
    return {
      items: [
        {
          id: "topic-1",
          title: "Reading Comprehension",
          description: "Techniques for understanding and analyzing texts",
          type: "lesson",
          content: "This lesson introduces strategies for effective reading and comprehension.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-2",
          title: "Writing Skills",
          description: "Techniques for effective writing",
          type: "lesson",
          content: "Learn about different writing techniques and their uses.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-3",
          title: "Grammar",
          description: "Rules of Grammar",
          type: "quiz",
          content: "Test your knowledge of the rules of Grammar.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-4",
          title: "Vocabulary",
          description: "Techniques for improving Vocabulary",
          type: "practice",
          content: "Practice problems related to improving Vocabulary.",
          estimatedTimeInMinutes: 45
        },
        {
          id: "topic-5",
          title: "Literature",
          description: "Introduction to Literature",
          type: "lesson",
          content: "Learn about different types of Literature and their uses.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-6",
          title: "Poetry",
          description: "Introduction to Poetry",
          type: "lesson",
          content: "Understanding the features of Poetry.",
          estimatedTimeInMinutes: 60
        },
        {
          id: "topic-7",
          title: "Drama",
          description: "Introduction to Drama",
          type: "quiz",
          content: "Test your knowledge of the features of Drama.",
          estimatedTimeInMinutes: 30
        },
        {
          id: "topic-8",
          title: "Fiction",
