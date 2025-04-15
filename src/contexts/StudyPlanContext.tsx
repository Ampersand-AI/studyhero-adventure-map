
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AIStatus } from '@/services/aiService';

// Interface for the Study Plan Context
interface StudyPlanContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  aiStatus: AIStatus;
  updateAIStatus: (status: AIStatus) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

// Create the context with default values
const StudyPlanContext = createContext<StudyPlanContextType>({
  isLoading: false,
  setIsLoading: () => {},
  aiStatus: { stage: "Idle", progress: 0, provider: "System" },
  updateAIStatus: () => {},
  error: null,
  setError: () => {},
});

// Provider component for wrapping parts of the app that need access to study plan state
export const StudyPlanProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAIStatus] = useState<AIStatus>({ 
    stage: "Idle", 
    progress: 0, 
    provider: "System" 
  });
  const [error, setError] = useState<string | null>(null);

  const updateAIStatus = (status: AIStatus) => {
    // Ensure provider is always present
    const updatedStatus = {
      ...status,
      provider: status.provider || "System"
    };
    setAIStatus(updatedStatus);
  };

  return (
    <StudyPlanContext.Provider value={{
      isLoading,
      setIsLoading,
      aiStatus,
      updateAIStatus,
      error,
      setError,
    }}>
      {children}
    </StudyPlanContext.Provider>
  );
};

// Custom hook for using the study plan context
export const useStudyPlan = () => useContext(StudyPlanContext);
