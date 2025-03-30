
// src/services/claudeService.ts

import axios from 'axios';

// Vite uses import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface ClaudeService {
  generateStudyPlan: (board: string, className: string, subject: string) => Promise<any>;
  generateLessonContent: (subject: string, topic: string) => Promise<any>;
  generateQuizQuestion: (subject: string, topic: string) => Promise<any>;
  generateLessonTest: (subject: string, topic: string, questionCount: number) => Promise<any>;
  clearAllUserData: () => void;
}

export const claudeService: ClaudeService = {
  generateStudyPlan: async (board: string, className: string, subject: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/claude/studyplan`, {
        board,
        className,
        subject
      });
      return response.data;
    } catch (error) {
      console.error("Error generating study plan:", error);
      throw error;
    }
  },

  generateLessonContent: async (subject: string, topic: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/claude/lesson`, {
        subject,
        topic
      });
      return response.data;
    } catch (error) {
      console.error("Error generating lesson content:", error);
      throw error;
    }
  },

  generateQuizQuestion: async (subject: string, topic: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/claude/quiz`, {
        subject,
        topic
      });
      return response.data;
    } catch (error) {
      console.error("Error generating quiz question:", error);
      throw error;
    }
  },

  generateLessonTest: async (subject: string, topic: string, questionCount: number) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/claude/lessonTest`, {
        subject,
        topic,
        questionCount
      });
      return response.data;
    } catch (error) {
      console.error("Error generating lesson test:", error);
      throw error;
    }
  },

  clearAllUserData: () => {
    localStorage.clear();
  }
};
