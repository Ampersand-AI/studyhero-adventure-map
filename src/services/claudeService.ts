import Anthropic from '@anthropic-ai/sdk';
import { toast } from "sonner";

// Define interfaces for better typing
interface Curriculum {
  subject: string;
  chapterNumber?: number;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  estimatedTimeInMinutes: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

// Create a service with methods to interact with Claude API
class ClaudeService {
  private anthropic: Anthropic;
  private apiKey: string;
  
  constructor() {
    // In a production app, you would use environment variables for API keys
    // For the demo, using a sample key (this will not work in production)
    this.apiKey = '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';
    
    try {
      this.anthropic = new Anthropic({
        apiKey: this.apiKey,
      });
    } catch (error) {
      console.error('Error initializing Anthropic SDK:', error);
    }
  }
  
  // Method to get subject topics based on curriculum details
  async getSubjectTopics(subject: string, className: string) {
    try {
      // First, check if we have cached topics
      const cachedTopics = localStorage.getItem(`topics_${subject}_${className}`);
      
      if (cachedTopics) {
        return JSON.parse(cachedTopics);
      }
      
      // Get board and school information if available
      const board = localStorage.getItem('selectedBoard') || 'CBSE';
      const state = localStorage.getItem('selectedState') || '';
      const city = localStorage.getItem('selectedCity') || '';
      const school = localStorage.getItem('selectedSchool') || '';
      
      // Show loading toast
      toast.loading("Generating Curriculum", {
        description: `Building ${subject} curriculum for Class ${className}...`,
      });
      
      // Get user message based on subject
      const userMessage = this.getUserMessageForSubject(subject, className, board, state, city, school);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: userMessage,
          }
        ],
      });
      
      // Parse the response
      const content = response.content[0].text;
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        let parsedData;
        
        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Attempt to find JSON in the content without code blocks
          const jsonRegex = /\{[\s\S]*\}/;
          const jsonString = content.match(jsonRegex);
          
          if (jsonString) {
            parsedData = JSON.parse(jsonString[0]);
          } else {
            throw new Error('Could not extract JSON from Claude response');
          }
        }
        
        // Close the loading toast
        toast.success("Curriculum Ready", {
          description: `${subject} curriculum for Class ${className} is ready.`,
        });
        
        // Cache the topics
        localStorage.setItem(`topics_${subject}_${className}`, JSON.stringify(parsedData));
        
        return parsedData;
      } catch (error) {
        console.error('Error parsing Claude response:', error);
        console.log('Raw response:', content);
        
        // Show error toast
        toast.error("Error", {
          description: "Failed to generate curriculum. Please try again.",
        });
        
        // Return fallback data
        return this.getFallbackTopics(subject, className);
      }
    } catch (error) {
      console.error('Error with Claude API:', error);
      
      // Show error toast
      toast.error("API Connection Error", {
        description: "Could not connect to AI service. Using sample data instead.",
      });
      
      // Return fallback data
      return this.getFallbackTopics(subject, className);
    }
  }
  
  // Method to get lesson content
  async getLessonContent(subject: string, topic: string, className: string = '10') {
    try {
      // First, check if we have cached lesson content
      const cachedContent = localStorage.getItem(`lesson_${subject}_${topic.replace(/\s+/g, '_')}`);
      
      if (cachedContent) {
        return JSON.parse(cachedContent);
      }
      
      // Get board and school information if available
      const board = localStorage.getItem('selectedBoard') || 'CBSE';
      const state = localStorage.getItem('selectedState') || '';
      const city = localStorage.getItem('selectedCity') || '';
      const school = localStorage.getItem('selectedSchool') || '';
      
      // Show loading toast
      toast.loading("Loading Lesson", {
        description: `Creating content for ${topic} in ${subject}...`,
      });
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator specializing in ${board} curriculum for ${subject}.
            Create detailed, engaging, and ACCURATE lesson content for the topic "${topic}" in ${subject}.
            Focus on providing information that would be found in actual ${board} textbooks for class ${className} in ${school ? school + ', ' : ''}${city ? city + ', ' : ''}${state}.
            
            Your response should be in JSON format with the following structure:
            {
              "title": "${topic}",
              "keyPoints": [array of 5-7 key concepts to understand, written in simple, clear language],
              "explanation": [array of 3-5 detailed explanatory paragraphs following the curriculum, written in an engaging, conversational style],
              "examples": [array of 2-3 objects with "title" and "content" properties using REAL examples that are relatable to students],
              "visualAids": [array of 3-4 objects with "title", "description", and "visualType" (diagram, chart, graph, illustration, etc.) properties that help visualize the concepts],
              "activities": [array of 2-3 objects with "title", "instructions" and "learningOutcome" properties that are similar to those found in textbooks],
              "summary": "a concluding paragraph summarizing the lesson in a motivational way",
              "textbookReferences": [array of objects with "chapter", "pageNumbers", and "description" properties that directly link to textbooks],
              "interestingFacts": [array of 2-3 facts related to the topic that will capture student interest]
            }
            
            Focus on making the content:
            1. Age-appropriate for class ${className} students
            2. Engaging with conversational language
            3. Visually rich with multiple types of visual aids
            4. Connected to real-world applications
            5. Including interesting facts that spark curiosity
            6. STRICTLY ADHERING to actual ${board} textbook content for Class ${className}`
          },
          {
            role: 'user',
            content: `Create engaging, AUTHENTIC ${board}-aligned lesson content for "${topic}" in ${subject} with multiple visual aids, interesting facts, and interactive elements that will make learning enjoyable for Class ${className} students in ${school ? school + ', ' : ''}${city ? city + ', ' : ''}${state}. ONLY include information that actually appears in ${board} textbooks.`,
          }
        ],
      });
      
      // Parse the response
      const content = response.content[0].text;
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        let parsedData;
        
        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Attempt to find JSON in the content without code blocks
          const jsonRegex = /\{[\s\S]*\}/;
          const jsonString = content.match(jsonRegex);
          
          if (jsonString) {
            parsedData = JSON.parse(jsonString[0]);
          } else {
            throw new Error('Could not extract JSON from Claude response');
          }
        }
        
        // Close the loading toast
        toast.success("Lesson Ready", {
          description: `Content for ${topic} is ready to learn.`,
        });
        
        // Cache the lesson content
        localStorage.setItem(`lesson_${subject}_${topic.replace(/\s+/g, '_')}`, JSON.stringify(parsedData));
        
        return parsedData;
      } catch (error) {
        console.error('Error parsing Claude response for lesson:', error);
        console.log('Raw response:', content);
        
        // Show error toast
        toast.error("Error", {
          description: "Failed to generate lesson content. Please try again.",
        });
        
        // Return fallback data
        return this.getFallbackLessonContent(subject, topic);
      }
    } catch (error) {
      console.error('Error with Claude API for lesson:', error);
      
      // Show error toast
      toast.error("API Connection Error", {
        description: "Could not connect to AI service. Using sample data instead.",
      });
      
      // Return fallback data
      return this.getFallbackLessonContent(subject, topic);
    }
  }

  // Method to get quiz questions
  async getQuizQuestions(subject: string, topic: string, questionCount: number = 10) {
    try {
      // First, check if we have cached quiz questions
      const cachedQuiz = localStorage.getItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`);
      
      if (cachedQuiz) {
        return JSON.parse(cachedQuiz);
      }
      
      // Get board and school information if available
      const board = localStorage.getItem('selectedBoard') || 'CBSE';
      const className = localStorage.getItem('selectedClass') || '10';
      
      // Show loading toast
      toast.loading("Creating Quiz", {
        description: `Generating ${questionCount} questions for ${topic}...`,
      });
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'system',
            content: `You are an expert educational assessment creator specializing in ${board} curriculum for ${subject}.
            Create a quiz with ${questionCount} questions for the topic "${topic}" in ${subject} Class ${className}.
            Your response should be in JSON format with a "questions" array containing question objects.
            Each question object should have:
            - id: a unique string identifier
            - question: the question text based directly on ${board} content
            - options: an array of 4 possible answers
            - correctAnswer: the text of the correct answer (must match exactly one of the options)
            - explanation: explanation of why the correct answer is right, with reference to textbook concepts`
          },
          {
            role: 'user',
            content: `Create a ${board}-aligned quiz with ${questionCount} questions for "${topic}" in ${subject} for Class ${className}.`
          }
        ],
      });
      
      // Parse the response
      const content = response.content[0].text;
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
        let parsedData;
        
        if (jsonMatch && jsonMatch[1]) {
          parsedData = JSON.parse(jsonMatch[1]);
        } else {
          // Attempt to find JSON in the content without code blocks
          const jsonRegex = /\{[\s\S]*\}/;
          const jsonString = content.match(jsonRegex);
          
          if (jsonString) {
            parsedData = JSON.parse(jsonString[0]);
          } else {
            throw new Error('Could not extract JSON from Claude response');
          }
        }
        
        // Close the loading toast
        toast.success("Quiz Ready", {
          description: `${questionCount} questions prepared for ${topic}.`,
        });
        
        // Cache the quiz questions
        localStorage.setItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`, JSON.stringify(parsedData));
        
        return parsedData;
      } catch (error) {
        console.error('Error parsing Claude response for quiz:', error);
        console.log('Raw response:', content);
        
        // Show error toast
        toast.error("Error", {
          description: "Failed to generate quiz questions. Please try again.",
        });
        
        // Return fallback data
        return this.getFallbackQuizQuestions(subject, topic);
      }
    } catch (error) {
      console.error('Error with Claude API for quiz:', error);
      
      // Show error toast
      toast.error("API Connection Error", {
        description: "Could not connect to AI service. Using sample data instead.",
      });
      
      // Return fallback data
      return this.getFallbackQuizQuestions(subject, topic);
    }
  }
  
  // Helper function to get user message for subject curriculum
  private getUserMessageForSubject(subject: string, className: string, board: string, state: string, city: string, school: string) {
    const schoolContext = school ? ` in ${school}, ${city}, ${state}` : '';
    
    switch (subject) {
      case 'Mathematics':
        return `Generate a comprehensive list of topics that would be covered in Mathematics for Class ${className} following the ${board} curriculum${schoolContext}. For each topic, include: title, brief description, estimated study time in minutes, type (lesson, quiz, or practice), and difficulty level.`;
      
      case 'Science':
        return `Generate a comprehensive list of topics that would be covered in Science for Class ${className} following the ${board} curriculum${schoolContext}. Include physics, chemistry, and biology topics. For each topic, include: title, brief description, estimated study time in minutes, type (lesson, quiz, or practice), and whether it includes lab work.`;
      
      case 'English':
        return `Generate a comprehensive list of topics that would be covered in English for Class ${className} following the ${board} curriculum${schoolContext}. Include grammar, literature, writing, and comprehension topics. For each topic, include: title, brief description, estimated study time in minutes, type (lesson, quiz, or practice), and relevant literature references.`;
      
      case 'Social Studies':
        return `Generate a comprehensive list of topics that would be covered in Social Studies for Class ${className} following the ${board} curriculum${schoolContext}. Include history, geography, civics, and economics topics. For each topic, include: title, brief description, estimated study time in minutes, type (lesson, quiz, or practice), and historical period if applicable.`;
      
      case 'Computer Science':
        return `Generate a comprehensive list of topics that would be covered in Computer Science for Class ${className} following the ${board} curriculum${schoolContext}. For each topic, include: title, brief description, estimated study time in minutes, type (lesson, quiz, or practice), and whether it includes practical coding exercises.`;
      
      default:
        return `Generate a comprehensive list of topics that would be covered in ${subject} for Class ${className} following the ${board} curriculum${schoolContext}. For each topic, include: title, brief description, estimated study time in minutes, type (lesson, quiz, or practice), and difficulty level.`;
    }
  }
  
  // Fallback data methods in case API fails
  private getFallbackTopics(subject: string, className: string): { topics: Curriculum[] } {
    
    switch (subject) {
      case 'Mathematics':
        return {
          topics: [
            {
              id: 'math-01',
              title: 'Real Numbers',
              description: 'Understanding irrational numbers, decimal expansions, and fundamental operations.',
              type: 'lesson',
              estimatedTimeInMinutes: 45,
              difficulty: 'beginner',
              chapterNumber: 1
            },
            {
              id: 'math-02',
              title: 'Polynomials',
              description: 'Learn about quadratic and cubic polynomials, their zeros, and relationships.',
              type: 'lesson',
              estimatedTimeInMinutes: 60,
              difficulty: 'intermediate',
              chapterNumber: 2
            },
            {
              id: 'math-03',
              title: 'Pair of Linear Equations',
              description: 'Methods to solve pairs of linear equations including substitution, elimination and graphical.',
              type: 'lesson',
              estimatedTimeInMinutes: 75,
              difficulty: 'intermediate',
              chapterNumber: 3
            },
            {
              id: 'math-04',
              title: 'Quadratic Equations',
              description: 'Solving quadratic equations using factorization, completing the square, and quadratic formula.',
              type: 'quiz',
              estimatedTimeInMinutes: 30,
              difficulty: 'intermediate',
              chapterNumber: 4
            },
            {
              id: 'math-05',
              title: 'Arithmetic Progressions',
              description: 'Understanding AP, common difference, nth term, and sum of n terms.',
              type: 'lesson',
              estimatedTimeInMinutes: 50,
              difficulty: 'intermediate',
              chapterNumber: 5
            },
            {
              id: 'math-06',
              title: 'Triangles',
              description: 'Similarity of triangles, Pythagoras theorem, and other properties.',
              type: 'practice',
              estimatedTimeInMinutes: 90,
              difficulty: 'intermediate',
              chapterNumber: 6
            },
            {
              id: 'math-07',
              title: 'Coordinate Geometry',
              description: 'Distance formula, section formula, area of triangle, and more.',
              type: 'lesson',
              estimatedTimeInMinutes: 60,
              difficulty: 'advanced',
              chapterNumber: 7
            }
          ]
        };
        
      case 'Science':
        return {
          topics: [
            {
              id: 'sci-01',
              title: 'Chemical Reactions and Equations',
              description: 'Balancing chemical equations and types of chemical reactions.',
              type: 'lesson',
              estimatedTimeInMinutes: 60,
              difficulty: 'intermediate',
              chapterNumber: 1
            },
            {
              id: 'sci-02',
              title: 'Acids, Bases and Salts',
              description: 'Properties, reactions, and pH of acids, bases, and salts.',
              type: 'lesson',
              estimatedTimeInMinutes: 50,
              difficulty: 'intermediate',
              chapterNumber: 2
            },
            {
              id: 'sci-03',
              title: 'Metals and Non-metals',
              description: 'Physical and chemical properties, reactivity series, and extraction of metals.',
              type: 'quiz',
              estimatedTimeInMinutes: 30,
              difficulty: 'intermediate',
              chapterNumber: 3
            },
            {
              id: 'sci-04',
              title: 'Life Processes',
              description: 'Nutrition, respiration, transportation, and excretion in organisms.',
              type: 'lesson',
              estimatedTimeInMinutes: 75,
              difficulty: 'advanced',
              chapterNumber: 6
            },
            {
              id: 'sci-05',
              title: 'Heredity and Evolution',
              description: 'Mendel\'s laws, inheritance, and human evolution.',
              type: 'practice',
              estimatedTimeInMinutes: 90,
              difficulty: 'advanced',
              chapterNumber: 9
            }
          ]
        };
        
      default:
        return {
          topics: [
            {
              id: `${subject.toLowerCase()}-01`,
              title: 'Introduction to the Subject',
              description: `Basic concepts of ${subject} for Class ${className}.`,
              type: 'lesson',
              estimatedTimeInMinutes: 45,
              difficulty: 'beginner',
              chapterNumber: 1
            },
            {
              id: `${subject.toLowerCase()}-02`,
              title: 'Core Principles',
              description: `Fundamental principles of ${subject} for this grade level.`,
              type: 'lesson',
              estimatedTimeInMinutes: 60,
              difficulty: 'intermediate',
              chapterNumber: 2
            },
            {
              id: `${subject.toLowerCase()}-03`,
              title: 'Practical Applications',
              description: `How to apply ${subject} concepts in real-world scenarios.`,
              type: 'practice',
              estimatedTimeInMinutes: 75,
              difficulty: 'intermediate',
              chapterNumber: 3
            },
            {
              id: `${subject.toLowerCase()}-04`,
              title: 'Advanced Topics',
              description: `More complex areas of ${subject} for this grade level.`,
              type: 'quiz',
              estimatedTimeInMinutes: 30,
              difficulty: 'advanced',
              chapterNumber: 4
            }
          ]
        };
    }
  }

  private getFallbackLessonContent(subject: string, topic: string) {
    
    return {
      title: topic,
      keyPoints: [
        `This is a key point about ${topic} in ${subject}`,
        "Important concept to understand from the curriculum",
        "Another essential concept covered in textbooks",
        "Practical application of the theory",
        "Common misconception clarified"
      ],
      explanation: [
        `${topic} is an important concept in ${subject} that helps students understand fundamental principles. The curriculum covers this topic to build a strong foundation for advanced concepts.`,
        "This paragraph would contain detailed explanation with examples and clear language. It would follow the official curriculum requirements and use appropriate terminology.",
        "This section would connect the concept to real-world applications and practical scenarios that students can relate to, making the learning more engaging and relevant."
      ],
      examples: [
        {
          title: "Basic Example",
          content: `A straightforward example of ${topic} that illustrates the core concept.`
        },
        {
          title: "Real-world Application",
          content: "An example showing how this concept is used in everyday situations or modern technology."
        }
      ],
      visualAids: [
        {
          title: "Conceptual Diagram",
          description: `A visual representation of how ${topic} works, showing the key components and their relationships.`,
          visualType: "diagram"
        },
        {
          title: "Process Flowchart",
          description: "A step-by-step visual guide to understanding the procedure or method.",
          visualType: "flowchart"
        },
        {
          title: "Comparative Analysis",
          description: "A visual comparison between different aspects or applications of the concept.",
          visualType: "comparison chart"
        }
      ],
      activities: [
        {
          title: "Hands-on Experiment",
          instructions: `Perform this simple activity to observe ${topic} in action and verify the principles learned.`,
          learningOutcome: "Students will be able to demonstrate the concept through practical observation."
        },
        {
          title: "Problem-solving Challenge",
          instructions: "Solve these problems by applying the concepts learned in this lesson.",
          learningOutcome: "Students will strengthen their analytical skills and application of the theory."
        }
      ],
      summary: `In this lesson, we explored ${topic} in ${subject}, covering key concepts, examples, and practical applications. Understanding this topic is essential for building your knowledge in this subject area.`,
      textbookReferences: [
        {
          chapter: "4",
          pageNumbers: "42-48",
          description: "Comprehensive explanation of the concepts with diagrams"
        },
        {
          chapter: "5",
          pageNumbers: "53-55",
          description: "Practice problems and additional examples"
        }
      ],
      interestingFacts: [
        `An interesting historical fact about ${topic} and its discovery or development.`,
        "A surprising application of this concept in modern technology or research.",
        "A connection between this topic and another field of study that might surprise students."
      ]
    };
  }

  private getFallbackQuizQuestions(subject: string, topic: string) {
    
    return {
      questions: [
        {
          id: "q1",
          question: `What is the primary concept of ${topic} in ${subject}?`,
          options: [
            "The correct definition based on curriculum",
            "A common misconception",
            "An unrelated concept",
            "A partially correct statement"
          ],
          correctAnswer: "The correct definition based on curriculum",
          explanation: "This is the standard definition as per the textbook and curriculum requirements."
        },
        {
          id: "q2",
          question: "Which of the following is an application of this concept?",
          options: [
            "A relevant real-world application",
            "An unrelated process",
            "A different concept altogether",
            "A historical event unrelated to the topic"
          ],
          correctAnswer: "A relevant real-world application",
          explanation: "This application directly demonstrates how the concept is used practically."
        },
        {
          id: "q3",
          question: "What is the correct procedure for solving this type of problem?",
          options: [
            "The correct step-by-step approach",
            "An incorrect approach",
            "A method for a different type of problem",
            "A made-up procedure"
          ],
          correctAnswer: "The correct step-by-step approach",
          explanation: "This follows the standard methodology taught in the curriculum."
        }
      ]
    };
  }
}

export const claudeService = new ClaudeService();
