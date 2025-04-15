
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import Dashboard from './pages/Dashboard';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';
import Onboarding from './pages/Onboarding';
import SubjectDetails from './pages/SubjectDetails';
import Settings from './pages/Settings';
import Index from './pages/Index';
import { StudyPlanProvider } from './contexts/StudyPlanContext';

// Initialize QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="theme-preference">
      <QueryClientProvider client={queryClient}>
        <StudyPlanProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lesson" element={<Lesson />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/subject/:subjectName" element={<SubjectDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster position="top-center" richColors />
        </StudyPlanProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
