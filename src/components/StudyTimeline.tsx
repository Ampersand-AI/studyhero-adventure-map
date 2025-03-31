
import React from 'react';
import TimelineCard from "./TimelineCard";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "future";
  dueDate: string;
  type: "lesson" | "quiz" | "practice";
}

interface StudyTimelineProps {
  items?: TimelineItem[];
  onStartItem?: (id: string) => void;
}

const StudyTimeline: React.FC<StudyTimelineProps> = ({ 
  items = [], 
  onStartItem = () => {} 
}) => {
  // Show placeholder message if no items
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>Your personalized schedule will appear here soon.</p>
        <p className="text-sm mt-2">Check back after selecting your subjects!</p>
      </div>
    );
  }

  // Calculate overall progress based on completed items
  const completedItems = items.filter(item => item.status === "completed").length;
  const progressPercentage = items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0;

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="w-full max-w-md mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Learning Progress</h3>
            <span className="text-sm font-medium">{progressPercentage}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center w-full max-w-3xl">
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                  item.status === "completed"
                    ? "bg-green-500"
                    : item.status === "current"
                    ? "bg-blue-500 animate-pulse"
                    : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              {index < items.length - 1 && (
                <div
                  className={`h-1 flex-grow mx-2 ${
                    item.status === "completed" ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <TimelineCard
            key={item.id}
            item={item}
            onStart={() => onStartItem(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default StudyTimeline;
