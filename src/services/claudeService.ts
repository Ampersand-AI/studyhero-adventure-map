import { toast } from "sonner";

// Create a service with methods to interact with Claude API
class ClaudeService {
  // Method to generate a test/quiz for a lesson
  async generateLessonTest(subject: string, topic: string) {
    try {
      // First, check if we have cached quiz questions
      const cachedQuiz = localStorage.getItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`);
      if (cachedQuiz) {
        return JSON.parse(cachedQuiz);
      }

      // Get class information if available
      const className = localStorage.getItem('selectedClass') || '10';
      
      // Use fallback data since we're not making actual API calls
      const quizData = this.getFallbackQuizQuestions(subject, topic);
      
      // Cache the quiz questions
      localStorage.setItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`, JSON.stringify(quizData));
      
      return quizData;
    } catch (error) {
      console.error('Error generating lesson test:', error);
      // Return fallback data
      return this.getFallbackQuizQuestions(subject, topic);
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

      // Use fallback data since we're not making actual API calls
      const topicsData = this.getFallbackTopics(subject, className);
      
      // Cache the topics
      localStorage.setItem(`topics_${subject}_${className}`, JSON.stringify(topicsData));
      
      return topicsData;
    } catch (error) {
      console.error('Error with Claude API:', error);
      // Return fallback data
      return this.getFallbackTopics(subject, className);
    }
  }

  // Method to get lesson content
  async getLessonContent(subject: string, topic: string, className = '10') {
    try {
      // First, check if we have cached lesson content
      const cachedContent = localStorage.getItem(`lesson_${subject}_${topic.replace(/\s+/g, '_')}`);
      if (cachedContent) {
        return JSON.parse(cachedContent);
      }

      // Use fallback data since we're not making actual API calls
      const lessonData = this.getFallbackLessonContent(subject, topic);
      
      // Cache the lesson content
      localStorage.setItem(`lesson_${subject}_${topic.replace(/\s+/g, '_')}`, JSON.stringify(lessonData));
      
      return lessonData;
    } catch (error) {
      console.error('Error with Claude API for lesson:', error);
      // Return fallback data
      return this.getFallbackLessonContent(subject, topic);
    }
  }

  // Method to get quiz questions
  async getQuizQuestions(subject: string, topic: string, questionCount = 10) {
    try {
      // First, check if we have cached quiz questions
      const cachedQuiz = localStorage.getItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`);
      if (cachedQuiz) {
        return JSON.parse(cachedQuiz);
      }

      // Use fallback data since we're not making actual API calls
      const quizData = this.getFallbackQuizQuestions(subject, topic);
      
      // Cache the quiz questions
      localStorage.setItem(`quiz_${subject}_${topic.replace(/\s+/g, '_')}`, JSON.stringify(quizData));
      
      return quizData;
    } catch (error) {
      console.error('Error with Claude API for quiz:', error);
      // Return fallback data
      return this.getFallbackQuizQuestions(subject, topic);
    }
  }

  // Fallback data methods
  getFallbackTopics(subject: string, className: string) {
    switch(subject){
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
              description: 'Zeros of a polynomial, relationship between zeros and coefficients.',
              type: 'lesson',
              estimatedTimeInMinutes: 50,
              difficulty: 'intermediate',
              chapterNumber: 2
            },
            {
              id: 'math-03',
              title: 'Pair of Linear Equations in Two Variables',
              description: 'Solving systems of linear equations using various methods.',
              type: 'lesson',
              estimatedTimeInMinutes: 55,
              difficulty: 'advanced',
              chapterNumber: 3
            },
            {
              id: 'math-04',
              title: 'Quadratic Equations',
              description: 'Methods to find the roots of quadratic equations.',
              type: 'lesson',
              estimatedTimeInMinutes: 60,
              difficulty: 'intermediate',
              chapterNumber: 4
            },
            {
              id: 'math-05',
              title: 'Arithmetic Progressions',
              description: 'Understanding sequences and series, and calculating sums.',
              type: 'lesson',
              estimatedTimeInMinutes: 45,
              difficulty: 'beginner',
              chapterNumber: 5
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
              description: 'Properties, reactions, and uses of acids, bases, and salts.',
              type: 'lesson',
              estimatedTimeInMinutes: 55,
              difficulty: 'intermediate',
              chapterNumber: 2
            },
            {
              id: 'sci-03',
              title: 'Metals and Non-metals',
              description: 'Physical and chemical properties of metals and non-metals.',
              type: 'lesson',
              estimatedTimeInMinutes: 50,
              difficulty: 'intermediate',
              chapterNumber: 3
            },
            {
              id: 'sci-04',
              title: 'Carbon and Its Compounds',
              description: 'Covalent bonding, versatile nature of carbon, and homologous series.',
              type: 'lesson',
              estimatedTimeInMinutes: 65,
              difficulty: 'advanced',
              chapterNumber: 4
            },
            {
              id: 'sci-05',
              title: 'Life Processes',
              description: 'Nutrition, respiration, transportation, and excretion in living organisms.',
              type: 'lesson',
              estimatedTimeInMinutes: 70,
              difficulty: 'intermediate',
              chapterNumber: 5
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
              title: 'Key Concepts',
              description: `Important topics in ${subject} for Class ${className}.`,
              type: 'lesson',
              estimatedTimeInMinutes: 50,
              difficulty: 'intermediate',
              chapterNumber: 2
            },
            {
              id: `${subject.toLowerCase()}-03`,
              title: 'Advanced Topics',
              description: `In-depth study of ${subject} for Class ${className}.`,
              type: 'lesson',
              estimatedTimeInMinutes: 55,
              difficulty: 'advanced',
              chapterNumber: 3
            },
            {
              id: `${subject.toLowerCase()}-04`,
              title: 'Practical Applications',
              description: `Real-world uses of ${subject} for Class ${className}.`,
              type: 'lesson',
              estimatedTimeInMinutes: 60,
              difficulty: 'intermediate',
              chapterNumber: 4
            },
            {
              id: `${subject.toLowerCase()}-05`,
              title: 'Review and Practice',
              description: `Recap and exercises for ${subject} for Class ${className}.`,
              type: 'lesson',
              estimatedTimeInMinutes: 45,
              difficulty: 'beginner',
              chapterNumber: 5
            }
          ]
        };
    }
  }

  getFallbackLessonContent(subject: string, topic: string) {
    // Create a more complete fallback lesson structure that matches our expected format
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
        `${topic} is a fundamental concept in ${subject} that covers many important principles.`,
        "Understanding this topic requires careful attention to the underlying theories and their practical applications.",
        "Many students find this topic challenging at first, but with practice, the concepts become clearer."
      ],
      examples: [
        {
          title: "Basic Example",
          content: "Here's a simple example that demonstrates the core concept."
        },
        {
          title: "Advanced Application",
          content: "This example shows how the concept works in a more complex scenario."
        }
      ],
      visualAids: [
        {
          title: "Concept Diagram",
          visualType: "Flowchart",
          description: "This diagram illustrates the relationship between key components."
        },
        {
          title: "Process Visualization",
          visualType: "Infographic",
          description: "A step-by-step visualization of how the process works."
        }
      ],
      activities: [
        {
          title: "Hands-on Exercise",
          instructions: "Follow these steps to complete the exercise and reinforce your understanding.",
          learningOutcome: "Apply theoretical knowledge to practical situations"
        },
        {
          title: "Group Discussion",
          instructions: "Discuss these questions with peers to explore different perspectives.",
          learningOutcome: "Develop critical thinking skills"
        }
      ],
      summary: `This lesson covered ${topic} in ${subject}, explaining the key concepts, providing examples, and offering activities for practice.`,
      textbookReferences: [
        {
          chapter: "4",
          pageNumbers: "45-52",
          description: "Fundamentals and basic explanations"
        },
        {
          chapter: "7",
          pageNumbers: "98-103",
          description: "Advanced applications and examples"
        }
      ],
      interestingFacts: [
        `An interesting historical fact about ${topic} and its development`,
        "Recent discoveries that have changed our understanding of this concept",
        "Real-world applications you might not have expected"
      ]
    };
  }

  getFallbackQuizQuestions(subject: string, topic: string) {
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
