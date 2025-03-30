
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center font-display text-3xl">Study AI</CardTitle>
          <CardDescription className="text-center">Your personal AI-powered study assistant</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center gap-4">
          <p>Welcome to Study AI, where we help you master any subject with personalized study plans, interactive lessons, and adaptive quizzes.</p>
          <div className="w-full max-w-[250px] h-[200px] bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <span className="text-5xl font-display text-primary">AI</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full" 
            onClick={() => navigate('/onboarding')}
          >
            Get Started
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/dashboard')}
          >
            I Already Have an Account
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
