
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import TimelineCard from './TimelineCard';

// Export the TimelineItem interface so it can be used in other files
export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'lesson' | 'quiz' | 'milestone';
  status: 'completed' | 'in-progress' | 'upcoming';
}

export interface StudyTimelineProps {
  items: TimelineItem[];
  onStartItem?: (id: string) => void;
}

const StudyTimeline: React.FC<StudyTimelineProps> = ({ items, onStartItem }) => {
  if (!items || items.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-center text-gray-500">No timeline items available</p>
        </CardContent>
      </Card>
    );
  }

  const handleStartItem = (id: string) => {
    if (onStartItem) {
      onStartItem(id);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <TimelineCard 
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          date={item.date}
          type={item.type}
          status={item.status}
          onStart={handleStartItem}
        />
      ))}
    </div>
  );
};

export default StudyTimeline;
