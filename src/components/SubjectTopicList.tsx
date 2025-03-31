
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Calendar } from "lucide-react";

export interface SubjectTopic {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  estimatedTimeInMinutes: number;
  chapterNumber?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

interface SubjectTopicListProps {
  subject: string;
  className: string;
  topics: SubjectTopic[];
  onSelectTopic?: (topic: SubjectTopic) => void;
}

const SubjectTopicList: React.FC<SubjectTopicListProps> = ({ 
  subject, 
  className, 
  topics,
  onSelectTopic
}) => {
  // Function to get style based on topic type
  const getTopicTypeStyle = (type: string) => {
    switch (type) {
      case 'lesson':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'quiz':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'practice':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Function to format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hr ${remainingMinutes} min` 
        : `${hours} hr`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{subject} - Class {className}</h2>
        <Badge variant="outline" className="px-3 py-1">
          <BookOpen className="h-4 w-4 mr-1" />
          NCERT Curriculum
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {topics.map((topic, index) => (
          <Card 
            key={topic.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectTopic && onSelectTopic(topic)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {topic.chapterNumber && (
                      <span className="text-muted-foreground mr-2">
                        {topic.chapterNumber}.
                      </span>
                    )}
                    {topic.title}
                  </CardTitle>
                </div>
                <Badge variant="outline" className={`${getTopicTypeStyle(topic.type)}`}>
                  {topic.type === 'lesson' ? 'Lesson' : topic.type === 'quiz' ? 'Quiz' : 'Practice'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{topic.description}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatTime(topic.estimatedTimeInMinutes)}</span>
                
                {topic.difficulty && (
                  <Badge variant="outline" className="ml-3">
                    {topic.difficulty}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubjectTopicList;
