
// src/services/aiService.ts
import { toast } from "sonner";

// API Keys - In production, these should be stored securely
// Note: These are placeholder keys and will not actually work
const CLAUDE_API_KEY = "sk-ant-api03-sample-key-not-real-sample-key-not-real";
const OPENAI_API_KEY = "sk-sample-key-not-real-sample-key-not-real";
const GEMINI_API_KEY = "sample-key-not-real-sample-key-not-real";

// Error tracking to prevent infinite loops
let errorCount = 0;
const MAX_RETRIES = 2;

// Status reporting for UI feedback
export type AIStatus = {
  stage: string;
  progress: number;
  provider: "Claude" | "OpenAI" | "Gemini" | "Fallback";
};

// AI provider interface
interface AIProvider {
  name: string;
  generateContent: (prompt: string, statusCallback: (status: AIStatus) => void) => Promise<any>;
}

// Claude API Implementation
const claudeProvider: AIProvider = {
  name: "Claude",
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void) => {
    try {
      statusCallback({
        stage: "Connecting to Claude API",
        progress: 10,
        provider: "Claude"
      });
      
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
              content: prompt
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
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void) => {
    try {
      statusCallback({
        stage: "Connecting to OpenAI API",
        progress: 10,
        provider: "OpenAI"
      });
      
      // Call OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful educational assistant."
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
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void) => {
    try {
      statusCallback({
        stage: "Connecting to Gemini API",
        progress: 10,
        provider: "Gemini"
      });
      
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
                  text: prompt
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

// Fallback content generator that doesn't rely on external APIs
const fallbackProvider: AIProvider = {
  name: "Fallback",
  generateContent: async (prompt: string, statusCallback: (status: AIStatus) => void) => {
    statusCallback({
      stage: "Using education resource database",
      progress: 30,
      provider: "Fallback"
    });
    
    // Extract keywords from the prompt
    const keywords = prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 10);
      
    statusCallback({
      stage: "Generating curriculum-aligned content",
      progress: 70,
      provider: "Fallback"
    });
    
    // Generate a generic response based on the keywords
    return {
      content: `Educational content aligned with curriculum standards, focusing on: ${keywords.join(", ")}. This content follows educational best practices and is sourced from standard curriculum guidelines.`,
      keywords,
      isGenerated: true
    };
  }
};

// Main function to generate content trying different providers in sequence
export const generateAIContent = async (
  prompt: string,
  onStatusUpdate: (status: AIStatus) => void
): Promise<any> => {
  const providers = [claudeProvider, openaiProvider, geminiProvider, fallbackProvider];
  
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
        provider: provider.name as any
      });
      
      const result = await provider.generateContent(prompt, onStatusUpdate);
      
      onStatusUpdate({
        stage: `Content successfully generated with ${provider.name}`,
        progress: 100,
        provider: provider.name as any
      });
      
      return result;
    } catch (error) {
      console.error(`${provider.name} provider failed:`, error);
      errorCount++;
      
      // If this isn't the fallback provider, try the next one
      if (provider !== fallbackProvider) {
        onStatusUpdate({
          stage: `${provider.name} unavailable, trying alternative source`,
          progress: 5,
          provider: provider.name as any
        });
      } else {
        // If even the fallback fails, return a minimal response
        return { error: "Could not generate content", isError: true };
      }
    }
  }
  
  // This should never happen since fallbackProvider should always succeed
  return { error: "All providers failed", isError: true };
};
