
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressCardProps {
  title: string;
  percentage?: number;
  value?: string;
  description: string;
  icon: React.ReactNode;
  color?: "purple" | "blue" | "green" | "yellow" | "pink" | "orange";
}

const ProgressCard = ({ title, percentage, value, description, icon, color = "blue" }: ProgressCardProps) => {
  // If percentage is provided, use it; otherwise display value without progress bar
  const hasPercentage = percentage !== undefined;
  
  return (
    <Card className="study-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-full bg-study-${color}/10 flex items-center justify-center text-study-${color}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        {hasPercentage ? (
          <>
            <div className="text-2xl font-bold">{percentage}%</div>
            <Progress value={percentage} className="h-2 mt-2" />
          </>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
      <CardFooter className="p-2">
        <p className="text-xs text-muted-foreground">
          {hasPercentage ? 
            (percentage < 30 ? "Just starting" : 
             percentage < 70 ? "Making progress" : "Almost there!") 
            : description}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProgressCard;
