
// A mock Claude API service for demonstration purposes

interface LessonContent {
  title: string;
  keyPoints: string[];
  explanation: string[];
  examples: {
    title: string;
    content: string;
  }[];
  visualAids: {
    title: string;
    description: string;
  }[];
  activities: {
    title: string;
    instructions: string;
  }[];
  summary: string;
}

interface TestContent {
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

interface StudyPlanItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  estimatedTimeInMinutes: number;
  content?: string;
}

interface StudyPlan {
  items: StudyPlanItem[];
}

class ClaudeService {
  async generateLessonContent(subject: string, title: string): Promise<LessonContent> {
    console.log(`Generating lesson content for ${subject}: ${title}`);
    
    // In a real app, this would call the Claude API
    // For now, return mock data
    return {
      title: title,
      keyPoints: [
        "Key point 1 about " + title,
        "Key point 2 about " + title,
        "Key point 3 about " + title,
        "Key point 4 about " + title
      ],
      explanation: [
        "This is the first paragraph explaining " + title + " in the context of " + subject + ". It provides an overview of the concept and its importance.",
        "The second paragraph goes deeper into the details of " + title + ". It examines specific aspects and their relationships.",
        "The third paragraph discusses applications of " + title + " in real-world scenarios and how it's used in practice."
      ],
      examples: [
        {
          title: "Example 1: Basic application",
          content: "This example shows a simple application of " + title + " in a straightforward scenario."
        },
        {
          title: "Example 2: Advanced scenario",
          content: "This example demonstrates a more complex application of " + title + " in an advanced setting."
        }
      ],
      visualAids: [
        {
          title: "Visual Representation",
          description: "This would be a diagram showing the key components of " + title + " and how they interact."
        },
        {
          title: "Process Flow",
          description: "This would illustrate the step-by-step process involved in applying " + title + "."
        }
      ],
      activities: [
        {
          title: "Practice Exercise 1",
          instructions: "Complete this exercise to practice the basic concepts of " + title + "."
        },
        {
          title: "Challenge Problem",
          instructions: "Solve this more difficult problem to test your understanding of " + title + "."
        }
      ],
      summary: "This lesson covered the fundamental concepts of " + title + " in " + subject + ". We explored its definition, key characteristics, applications, and practiced with examples."
    };
  }

  async generateLessonTest(subject: string, title: string, questionCount: number): Promise<TestContent> {
    console.log(`Generating test for ${subject}: ${title} with ${questionCount} questions`);
    
    // Mock test generation
    const questions = Array(questionCount).fill(0).map((_, index) => {
      const options = [
        `Option A for question ${index + 1}`,
        `Option B for question ${index + 1}`,
        `Option C for question ${index + 1}`,
        `Option D for question ${index + 1}`
      ];
      const correctAnswerIndex = Math.floor(Math.random() * 4);
      return {
        id: `q${index + 1}`,
        question: `Question ${index + 1} about ${title}?`,
        options: options,
        correctAnswer: options[correctAnswerIndex],
        explanation: `Explanation for why option ${['A', 'B', 'C', 'D'][correctAnswerIndex]} is correct for question ${index + 1}.`
      };
    });
    
    return { questions };
  }

  async generateQuizQuestion(subject: string, topic: string): Promise<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }> {
    console.log(`Generating quiz question for ${subject}: ${topic}`);
    
    // Mock question generation
    const options = [
      `Option A for ${topic}`,
      `Option B for ${topic}`,
      `Option C for ${topic}`,
      `Option D for ${topic}`
    ];
    
    const correctAnswerIndex = Math.floor(Math.random() * 4);
    
    return {
      question: `What is a key concept in ${topic}?`,
      options: options,
      correctAnswer: options[correctAnswerIndex],
      explanation: `Option ${['A', 'B', 'C', 'D'][correctAnswerIndex]} is correct because it correctly explains an aspect of ${topic} within ${subject}.`,
    };
  }

  async generateStudyPlan(board: string, className: string, subject: string): Promise<StudyPlan> {
    console.log(`Generating study plan for ${subject}, Class ${className}, ${board}`);
    
    // Mock study plan generation
    const itemCount = 10; // Number of items in the study plan
    
    const items = Array(itemCount).fill(0).map((_, index) => ({
      id: `${subject.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
      title: `Topic ${index + 1} in ${subject}`,
      description: `Learn about an important concept in ${subject} for Class ${className}.`,
      type: ["lesson", "quiz", "practice"][index % 3] as "lesson" | "quiz" | "practice",
      estimatedTimeInMinutes: 20 + (index * 5),
      content: ""
    }));
    
    return { items };
  }

  clearAllUserData() {
    // Clear all localStorage data
    localStorage.clear();
    console.log("All user data has been cleared");
  }
}

export const claudeService = new ClaudeService();
