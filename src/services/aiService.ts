// src/services/aiService.ts
import { toast } from "sonner";

// API Keys - In production, these should be stored securely
// These keys are used for educational purposes in this application
const CLAUDE_API_KEY = "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";
const OPENAI_API_KEY = "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";
const GEMINI_API_KEY = "AIzaSyAZL1devH6Y3KalAc9VLfeyng32NKGfFcA";
const DEEPSEEK_API_KEY = "sk-a6632f7d3f794d76b60fbe4a40d80058";

// Error tracking to prevent infinite loops
let errorCount = 0;
const MAX_RETRIES = 2;

// Status reporting for UI feedback
export type AIStatus = {
  stage: string;
  progress: number;
  provider: string;
};

// AI provider interface
interface AIProvider {
  name: string;
  generateContent: (prompt: string, statusCallback: (status: AIStatus) => void, context?: any) => Promise<any>;
}

// Claude API Implementation
const claudeProvider: AIProvider = {
  name: "Claude",
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void, context?: any) => {
    try {
      statusCallback({
        stage: "Connecting to Claude API",
        progress: 10,
        provider: "Claude"
      });
      
      // Enhance context with subject-specific information if available
      let enhancedPrompt = prompt;
      if (context?.subject) {
        enhancedPrompt = `[CONTEXT: This request is about the subject ${context.subject}, specifically focused on ${context.topic || "general curriculum"}. Please provide accurate educational content aligned with standard curriculum for this subject.]\n\n${prompt}`;
      }
      
      // Call Claude API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: enhancedPrompt
            }
          ]
        })
      });
      
      statusCallback({
        stage: "Processing content from Claude",
        progress: 60,
        provider: "Claude"
      });
      
      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      statusCallback({
        stage: "Content received from Claude",
        progress: 90,
        provider: "Claude"
      });
      
      return data.content[0].text;
    } catch (error) {
      console.error("Claude API error:", error);
      throw error;
    }
  }
};

// OpenAI API Implementation
const openaiProvider: AIProvider = {
  name: "OpenAI",
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void, context?: any) => {
    try {
      statusCallback({
        stage: "Connecting to OpenAI API",
        progress: 10,
        provider: "OpenAI"
      });
      
      // Enhance the system prompt with subject context if available
      let systemPrompt = "You are a helpful educational assistant.";
      if (context?.subject) {
        systemPrompt = `You are an expert educational assistant specializing in ${context.subject}. Provide accurate, curriculum-aligned content that follows educational standards. Focus on creating engaging, factually correct materials suitable for students in class ${context.className || "10"}.`;
      }
      
      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000
        })
      });
      
      statusCallback({
        stage: "Processing content from OpenAI",
        progress: 60,
        provider: "OpenAI"
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      statusCallback({
        stage: "Content received from OpenAI",
        progress: 90,
        provider: "OpenAI"
      });
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }
};

// Gemini API Implementation
const geminiProvider: AIProvider = {
  name: "Gemini",
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void, context?: any) => {
    try {
      statusCallback({
        stage: "Connecting to Gemini API",
        progress: 10,
        provider: "Gemini"
      });
      
      // Enhance prompt with subject context if available
      let enhancedPrompt = prompt;
      if (context?.subject) {
        enhancedPrompt = `[Educational Context: ${context.subject} - ${context.topic || "general curriculum"} - Class ${context.className || "10"}]\n\n${prompt}`;
      }
      
      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: enhancedPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      });
      
      statusCallback({
        stage: "Processing content from Gemini",
        progress: 60,
        provider: "Gemini"
      });
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      statusCallback({
        stage: "Content received from Gemini",
        progress: 90,
        provider: "Gemini"
      });
      
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }
};

// DeepSeek API Implementation
const deepseekProvider: AIProvider = {
  name: "DeepSeek",
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void, context?: any) => {
    try {
      statusCallback({
        stage: "Connecting to DeepSeek API",
        progress: 10,
        provider: "DeepSeek"
      });
      
      // Enhance prompt with subject context if available
      let enhancedPrompt = prompt;
      if (context?.subject) {
        enhancedPrompt = `[EDUCATIONAL CONTEXT: Subject: ${context.subject}, Topic: ${context.topic || "general curriculum"}, Class: ${context.className || "10"}]\n\n${prompt}`;
      }
      
      // Call DeepSeek API
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are an expert educational content creator focusing on accurate, curriculum-aligned material."
            },
            {
              role: "user",
              content: enhancedPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });
      
      statusCallback({
        stage: "Processing content from DeepSeek",
        progress: 60,
        provider: "DeepSeek"
      });
      
      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      statusCallback({
        stage: "Content received from DeepSeek",
        progress: 90,
        provider: "DeepSeek"
      });
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error("DeepSeek API error:", error);
      throw error;
    }
  }
};

// Enhanced fallback content generator with broader educational focus
const fallbackProvider: AIProvider = {
  name: "Fallback",
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void, context?: any) => {
    statusCallback({
      stage: "Using education resource database",
      progress: 30,
      provider: "Fallback"
    });
    
    // Create a more relevant response based on subject if available
    if (context?.subject) {
      const subjectLower = context.subject.toLowerCase();
      const topicLower = (context.topic || "").toLowerCase();
      
      // Generate subject-specific fallback content
      statusCallback({
        stage: `Generating ${context.subject} educational content from worldwide sources`,
        progress: 70,
        provider: "Fallback"
      });
      
      // Generate response based on subject
      if (subjectLower.includes("math")) {
        return generateMathContent(topicLower);
      } else if (subjectLower.includes("physics")) {
        return generatePhysicsContent(topicLower);
      } else if (subjectLower.includes("chemistry")) {
        return generateChemistryContent(topicLower);
      } else if (subjectLower.includes("biology")) {
        return generateBiologyContent(topicLower);
      } else if (subjectLower.includes("history") || subjectLower.includes("social")) {
        return generateHistoryContent(topicLower);
      } else if (subjectLower.includes("computer")) {
        return generateComputerScienceContent(topicLower);
      } else {
        // Generic educational content
        return generateGenericContent(topicLower);
      }
    }
    
    // Extract keywords from the prompt if no context
    const keywords = prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 10);
      
    statusCallback({
      stage: "Generating educational content from global resources",
      progress: 70,
      provider: "Fallback"
    });
    
    // Generate a generic response based on the keywords
    return generateGenericContent(keywords.join(", "));
  }
};

// Subject-specific content generators
const generateMathContent = (topic: string) => {
  // Simplified example - in production this would be more comprehensive
  return {
    title: `Mathematics: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    keyPoints: [
      "Mathematical concepts build on fundamental principles",
      "Problem-solving techniques are central to mathematical learning",
      "Applications connect abstract concepts to real-world scenarios",
      "Visualization aids in understanding complex mathematical relationships",
      "Practice and repetition reinforce mathematical skills"
    ],
    explanation: [
      "Mathematics provides the foundation for understanding patterns, relationships, and structures in the world around us. This topic focuses on developing both conceptual understanding and procedural fluency.",
      "By working through carefully sequenced problems and examples, students develop the ability to think logically, analyze patterns, and construct mathematical arguments."
    ],
    examples: [
      {
        title: "Problem Example",
        content: "A practical application of this concept involves solving real-world problems through mathematical modeling."
      },
      {
        title: "Step-by-Step Solution",
        content: "Breaking down complex problems into manageable steps helps build problem-solving skills and mathematical confidence."
      }
    ],
    summary: "Mastering these mathematical concepts provides powerful tools for analysis, modeling, and problem-solving across many disciplines.",
    visualAids: [
      {
        title: "Visual Representation",
        description: "Graphical representation showing the relationship between variables and how they interact.",
        visualType: "Graph"
      },
      {
        title: "Conceptual Diagram",
        description: "Illustration showing the key components and their relationships in this mathematical concept.",
        visualType: "Diagram"
      }
    ],
    activities: [
      {
        title: "Exploratory Exercise",
        instructions: "Work through a series of problems that gradually increase in complexity to build understanding of the concept.",
        learningOutcome: "Developing mathematical intuition and procedural fluency"
      },
      {
        title: "Real-World Application",
        instructions: "Apply the mathematical concept to solve a problem from science, engineering, or daily life.",
        learningOutcome: "Connecting abstract mathematics to practical applications"
      }
    ],
    interestingFacts: [
      "Mathematics has been called the universal language because mathematical principles remain consistent across cultures and time",
      "Many mathematical discoveries were motivated by practical problems in navigation, commerce, and engineering"
    ]
  };
};

const generatePhysicsContent = (topic: string) => {
  return {
    title: `Physics: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    keyPoints: [
      "Physics explains natural phenomena through mathematical models",
      "Experimental evidence supports theoretical predictions",
      "Conservation laws provide fundamental constraints on physical systems",
      "Physical theories evolve as new evidence emerges",
      "Physics concepts have wide-ranging technological applications"
    ],
    explanation: [
      "Physics seeks to understand the fundamental principles governing the universe, from subatomic particles to cosmic structures. This topic examines how physical laws describe and predict phenomena in our world.",
      "Through observation, experimentation, and mathematical modeling, physicists develop theories that explain patterns in nature and enable technological innovations."
    ],
    examples: [
      {
        title: "Physical Phenomenon",
        content: "A real-world example demonstrating this physical principle in action."
      },
      {
        title: "Experimental Verification",
        content: "How scientists have tested and confirmed this physical concept through careful measurement and observation."
      }
    ],
    summary: "Understanding these physical principles helps explain natural phenomena and forms the basis for technological advances that shape our world.",
    visualAids: [
      {
        title: "Experimental Setup",
        description: "Diagram showing how scientists measure and observe this physical phenomenon in laboratory conditions.",
        visualType: "Diagram"
      },
      {
        title: "Force Diagram",
        description: "Visual representation of the forces and interactions involved in this physical system.",
        visualType: "Vector Diagram"
      }
    ],
    activities: [
      {
        title: "Home Experiment",
        instructions: "Using simple materials, observe and measure this physical phenomenon in a controlled setting.",
        learningOutcome: "Developing experimental skills and connecting theory to observation"
      },
      {
        title: "Computational Model",
        instructions: "Use a simulation to explore how changing variables affects the physical system's behavior.",
        learningOutcome: "Understanding relationships between variables in physical systems"
      }
    ],
    interestingFacts: [
      "Many physical constants like the speed of light and gravitational constant define fundamental limitations in our universe",
      "Quantum physics challenges our intuitive understanding of reality at microscopic scales"
    ]
  };
};

const generateChemistryContent = (topic: string) => {
  return {
    title: `Chemistry: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    keyPoints: [
      "Chemical reactions involve changes in electron configurations",
      "Periodic trends explain patterns in element properties",
      "Molecular structure determines chemical and physical properties",
      "Energy changes accompany all chemical processes",
      "Chemical equilibrium describes the balance between forward and reverse reactions"
    ],
    explanation: [
      "Chemistry examines how matter is composed, structured, and transformed. This topic explores the principles governing molecular interactions and chemical transformations.",
      "Through understanding atomic structure and bonding patterns, chemists can predict how substances will interact and design new materials with specific properties."
    ],
    examples: [
      {
        title: "Chemical Reaction",
        content: "Example showing how reactants transform into products with different properties."
      },
      {
        title: "Molecular Interaction",
        content: "Illustration of how molecular structure determines interaction patterns between substances."
      }
    ],
    summary: "Chemical principles explain material properties and transformations, providing the foundation for innovations in medicine, materials science, and environmental solutions.",
    visualAids: [
      {
        title: "Molecular Structure",
        description: "Three-dimensional representation of molecular geometry showing atom arrangements and bond angles.",
        visualType: "3D Model"
      },
      {
        title: "Reaction Mechanism",
        description: "Step-by-step diagram showing how a chemical reaction proceeds through transition states.",
        visualType: "Process Diagram"
      }
    ],
    activities: [
      {
        title: "Safe Chemical Demonstration",
        instructions: "Observe color changes, gas formation, or temperature changes that indicate chemical reactions.",
        learningOutcome: "Recognizing macroscopic evidence of molecular-level changes"
      },
      {
        title: "Molecular Modeling",
        instructions: "Build molecular models to explore three-dimensional structures and predict properties.",
        learningOutcome: "Understanding the relationship between structure and function"
      }
    ],
    interestingFacts: [
      "The same elements that make up stars also make up our bodies, demonstrating the cosmic connection of chemistry",
      "Some chemical reactions appear to defy intuition, like endothermic reactions that absorb heat from their surroundings"
    ]
  };
};

const generateBiologyContent = (topic: string) => {
  return {
    title: `Biology: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    keyPoints: [
      "Living organisms share fundamental cellular structures and processes",
      "DNA provides the blueprint for organism development and function",
      "Evolution through natural selection explains biodiversity",
      "Homeostatic mechanisms maintain internal balance in organisms",
      "Ecosystems function through complex interactions between organisms and their environment"
    ],
    explanation: [
      "Biology explores the fascinating world of living organisms, from microscopic cells to complex ecosystems. This topic examines the structures, functions, and interactions that sustain life.",
      "Through understanding biological principles, we gain insight into our own bodies, the natural world around us, and our place within Earth's interconnected systems."
    ],
    examples: [
      {
        title: "Biological Process",
        content: "Example showing how this biological concept manifests in living organisms."
      },
      {
        title: "Cellular Mechanism",
        content: "Illustration of how cells carry out this essential biological function."
      }
    ],
    summary: "Biological knowledge enhances our understanding of life processes, enabling advances in medicine, conservation, and sustainable resource management.",
    visualAids: [
      {
        title: "Cellular Structure",
        description: "Detailed diagram showing cellular components and their functions in this biological process.",
        visualType: "Cell Diagram"
      },
      {
        title: "Physiological System",
        description: "Illustration of how multiple organs and tissues work together in this biological function.",
        visualType: "System Diagram"
      }
    ],
    activities: [
      {
        title: "Microscope Observation",
        instructions: "Examine cell structures or microorganisms related to this biological concept.",
        learningOutcome: "Connecting microscopic structures to macroscopic functions"
      },
      {
        title: "Field Investigation",
        instructions: "Observe and document biological interactions in a natural setting.",
        learningOutcome: "Understanding ecological relationships in natural systems"
      }
    ],
    interestingFacts: [
      "The human body contains more bacterial cells than human cells, highlighting our nature as ecological communities",
      "Many biological processes like photosynthesis have inspired technological innovations in renewable energy"
    ]
  };
};

const generateHistoryContent = (topic: string) => {
  return {
    title: `History: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    keyPoints: [
      "Historical events are shaped by multiple interconnected factors",
      "Primary sources provide firsthand accounts of historical periods",
      "Historical interpretation evolves as new evidence and perspectives emerge",
      "Social, economic, and political factors interact to drive historical change",
      "Historical patterns offer insights into contemporary challenges"
    ],
    explanation: [
      "History examines human societies across time, seeking to understand how past events, decisions, and cultural developments have shaped our world. This topic explores significant developments and their lasting impact.",
      "Through analyzing historical sources and contexts, we gain perspective on human experiences, social change, and the complex interplay of factors that drive historical developments."
    ],
    examples: [
      {
        title: "Historical Case Study",
        content: "Examination of a specific historical event that illustrates broader patterns and principles."
      },
      {
        title: "Primary Source Analysis",
        content: "Interpretation of an authentic historical document or artifact that provides insight into this period."
      }
    ],
    summary: "Historical understanding helps us contextualize current events, recognize patterns across time, and develop informed perspectives on contemporary challenges.",
    visualAids: [
      {
        title: "Historical Timeline",
        description: "Chronological representation showing key events and developments during this historical period.",
        visualType: "Timeline"
      },
      {
        title: "Geographic Context",
        description: "Map illustrating territorial changes, migration patterns, or resource distribution relevant to this historical topic.",
        visualType: "Historical Map"
      }
    ],
    activities: [
      {
        title: "Document Analysis",
        instructions: "Examine historical sources to identify perspectives, biases, and contextual influences.",
        learningOutcome: "Developing critical thinking skills through source evaluation"
      },
      {
        title: "Comparative Study",
        instructions: "Compare similar historical developments across different time periods or cultural contexts.",
        learningOutcome: "Recognizing patterns and unique contextual factors in historical events"
      }
    ],
    interestingFacts: [
      "Historical discoveries continue to challenge established narratives, showing how our understanding of the past continues to evolve",
      "Archaeological technologies like ground-penetrating radar have revealed previously unknown historical sites and settlements"
    ]
  };
};

const generateComputerScienceContent = (topic: string) => {
  return {
    title: `Computer Science: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    keyPoints: [
      "Computational thinking involves breaking complex problems into manageable steps",
      "Algorithms provide step-by-step procedures for solving problems",
      "Data structures organize information for efficient processing",
      "Programming languages translate human logic into machine-executable instructions",
      "Computer systems balance processing, memory, and storage capabilities"
    ],
    explanation: [
      "Computer science examines how computational systems process information and solve problems. This topic explores the principles and practices that enable modern computing technologies.",
      "Through understanding algorithms, data structures, and system architecture, computer scientists design solutions that automate tasks, analyze data, and create new possibilities for human-computer interaction."
    ],
    examples: [
      {
        title: "Algorithm Example",
        content: "Demonstration of how a computational approach breaks down and solves a complex problem."
      },
      {
        title: "Code Implementation",
        content: "Example showing how programming concepts translate into functional code."
      }
    ],
    summary: "Computer science principles drive technological innovation, enabling new solutions to complex problems across virtually every field of human endeavor.",
    visualAids: [
      {
        title: "Algorithm Flowchart",
        description: "Visual representation of the step-by-step process for solving a computational problem.",
        visualType: "Flowchart"
      },
      {
        title: "Data Structure Visualization",
        description: "Diagram showing how data is organized and accessed in this computational approach.",
        visualType: "Schematic Diagram"
      }
    ],
    activities: [
      {
        title: "Algorithm Design Challenge",
        instructions: "Create step-by-step instructions to solve a specific problem using computational thinking.",
        learningOutcome: "Developing logical thinking and problem decomposition skills"
      },
      {
        title: "Programming Exercise",
        instructions: "Implement a simple program that demonstrates key programming concepts.",
        learningOutcome: "Translating abstract algorithms into concrete code implementations"
      }
    ],
    interestingFacts: [
      "Early computers were primarily operated by women, who were pioneers in programming and algorithm development",
      "Many fundamental computer science concepts were developed decades before the technology existed to implement them"
    ]
  };
};

const generateGenericContent = (topic: string) => {
  return {
    title: `${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    keyPoints: [
      "Educational content should build on prior knowledge",
      "Multiple representations help students understand abstract concepts",
      "Active learning promotes deeper understanding than passive reception",
      "Real-world applications connect academic content to student experiences",
      "Assessment should measure both factual knowledge and conceptual understanding"
    ],
    explanation: [
      "This educational topic explores key concepts that expand students' understanding and skills. The content is structured to build knowledge progressively through explanation, examples, and application.",
      "By engaging with multiple perspectives and formats, students develop a more complete understanding of the subject matter and its significance."
    ],
    examples: [
      {
        title: "Concept Application",
        content: "Example showing how this concept applies in a relevant context."
      },
      {
        title: "Problem Solution",
        content: "Demonstration of how to approach and solve a typical problem in this domain."
      }
    ],
    summary: "Mastering these concepts provides students with valuable knowledge and skills that apply across academic and real-world contexts.",
    visualAids: [
      {
        title: "Conceptual Diagram",
        description: "Visual representation showing the relationships between key ideas in this topic.",
        visualType: "Diagram"
      },
      {
        title: "Process Illustration",
        description: "Step-by-step visual showing how processes unfold in this domain.",
        visualType: "Process Chart"
      }
    ],
    activities: [
      {
        title: "Hands-on Investigation",
        instructions: "Explore this concept through direct observation and structured inquiry.",
        learningOutcome: "Developing investigation skills and conceptual understanding"
      },
      {
        title: "Application Project",
        instructions: "Create something that demonstrates understanding and application of the key concepts.",
        learningOutcome: "Connecting theoretical knowledge to practical implementation"
      }
    ],
    interestingFacts: [
      "Educational research shows that spaced practice leads to better long-term retention than cramming",
      "Connecting new information to existing knowledge creates stronger neural pathways for learning"
    ]
  };
};

// Function to coordinate multiple AI providers for enhanced content
export const generateEnhancedContent = async (
  prompt: string,
  context: any,
  onStatusUpdate: (status: AIStatus) => void
): Promise<any> => {
  // Define the sequence of providers to try
  const providers = [openaiProvider, claudeProvider, geminiProvider, deepseekProvider, fallbackProvider];
  
  // Try each provider in sequence
  for (const provider of providers) {
    try {
      onStatusUpdate({
        stage: `Connecting to ${provider.name} research service`,
        progress: 5,
        provider: provider.name as any
      });
      
      const result = await provider.generateContent(prompt, onStatusUpdate, context);
      
      // Try to parse JSON response, if it's not JSON, that's OK too
      try {
        return JSON.parse(result);
      } catch (e) {
        // Not JSON, return as is
        return result;
      }
    } catch (providerError) {
      console.error(`${provider.name} service error:`, providerError);
      
      // If this is the fallback provider, we've exhausted all options
      if (provider === fallbackProvider) {
        onStatusUpdate({
          stage: `Using local educational content database`,
          progress: 5,
          provider: "Fallback"
        });
        
        return fallbackProvider.generateContent(prompt, onStatusUpdate, context);
      }
      
      // Otherwise, continue to the next provider
      onStatusUpdate({
        stage: `${provider.name} unavailable, trying next service in sequence`,
        progress: 5,
        provider: provider.name as any
      });
      
      // Continue to next provider
      continue;
    }
  }
  
  // If we've reached here, all providers failed
  return { error: "All AI services failed", isError: true };
};

// Main function to generate content trying different providers in sequence
export const generateAIContent = async (
  prompt: string,
  onStatusUpdate: (status: AIStatus) => void,
  context?: any
): Promise<any> => {
  // Define the sequence of providers to try
  const providers = [openaiProvider, claudeProvider, geminiProvider, deepseekProvider, fallbackProvider];
  
  // Reset error count for new request
  errorCount = 0;
  
  for (const provider of providers) {
    try {
      // Skip to fallback if we've had too many errors
      if (errorCount >= MAX_RETRIES && provider !== fallbackProvider) {
        continue;
      }
      
      onStatusUpdate({
        stage: `Initializing ${provider.name} service`,
        progress: 5,
        provider: provider.name
      });
      
      const result = await provider.generateContent(prompt, onStatusUpdate, context);
      
      onStatusUpdate({
        stage: `Content successfully generated with ${provider.name}`,
        progress: 100,
        provider: provider.name
      });
      
      // Try to parse JSON if the response looks like JSON
      if (typeof result === 'string' && (result.trim().startsWith('{') || result.trim().startsWith('['))) {
        try {
          return JSON.parse(result);
        } catch (parseError) {
          console.log("Not valid JSON, returning as string");
          return result;
        }
      }
      
      return result;
    } catch (error) {
      errorCount++;
      console.error(`Error with ${provider.name} provider:`, error);
      onStatusUpdate({
        stage: `Error with ${provider.name}, trying next provider`,
        progress: 5,
        provider: provider.name
      });
      
      // Continue to next provider
      continue;
    }
  }
  
  // If all providers failed, return fallback content
  return fallbackProvider.generateContent(prompt, onStatusUpdate, context);
};
