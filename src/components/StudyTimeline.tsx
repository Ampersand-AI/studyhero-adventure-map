
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, ArrowRight, Check, PlayCircle, FileText, FileQuestion } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Export the TimelineItem interface so it can be imported by other components
export interface TimelineItem {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'practice' | 'test';
  date?: string;
  completed?: boolean;
  progress?: number;
  subItems?: TimelineItem[];
  description?: string;
  estimatedTimeInMinutes?: number;
  subject?: string;
}

interface StudyTimelineProps {
  items: TimelineItem[];
  title?: string;
  compact?: boolean;
  onItemClick?: (item: TimelineItem) => void;
}

const StudyTimeline: React.FC<StudyTimelineProps> = ({
  items,
  title = "Your Learning Path",
  compact = false,
  onItemClick
}) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };
  
  // Default click handler if none provided
  const handleItemClick = (item: TimelineItem) => {
    if (onItemClick) {
      onItemClick(item);
    } else {
      // Store the current item in localStorage for the lesson page to access
      localStorage.setItem('currentStudyItem', JSON.stringify(item));
      
      if (item.type === 'lesson' || item.type === 'practice') {
        navigate('/lesson');
      } else if (item.type === 'quiz' || item.type === 'test') {
        navigate('/quiz');
      }
    }
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz':
        return <FileQuestion className="h-4 w-4" />;
      case 'practice':
        return <PlayCircle className="h-4 w-4" />;
      case 'test':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };
  
  const getItemColor = (type: string, completed?: boolean) => {
    if (completed) return 'bg-green-100 text-green-800 border-green-200';
    
    switch (type) {
      case 'lesson':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'quiz':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'practice':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'test':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Render an item and its sub-items recursively
  const renderItem = (item: TimelineItem, index: number, isLastItem: boolean) => {
    const isExpanded = expandedItems.has(item.id);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    
    return (
      <React.Fragment key={item.id}>
        <div className={`relative flex ${!isLastItem ? 'pb-5' : ''}`}>
          {!isLastItem && (
            <div className="absolute inset-0 flex items-center justify-center w-6" style={{ marginLeft: '14px' }}>
              <div className="h-full w-0.5 bg-gray-200"></div>
            </div>
          )}
          
          <div className="relative flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full">
            {item.completed ? (
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{index + 1}</span>
              </div>
            )}
          </div>
          
          <div 
            className={`ml-4 ${compact ? '' : 'p-3 rounded-lg border'} flex-1 cursor-pointer hover:bg-slate-50 transition-colors`}
            onClick={() => handleItemClick(item)}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h3 className={`font-medium ${item.completed ? 'text-gray-500 line-through' : ''}`}>
                    {item.title}
                  </h3>
                  <Badge className={`ml-2 text-xs ${getItemColor(item.type, item.completed)}`}>
                    <span className="flex items-center">
                      {getIcon(item.type)}
                      <span className="ml-1">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                    </span>
                  </Badge>
                </div>
                
                {item.description && !compact && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
                
                {item.progress !== undefined && item.progress > 0 && !compact && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-1" />
                  </div>
                )}
                
                {item.date && <p className="text-xs text-muted-foreground mt-1">Due: {item.date}</p>}
              </div>
              
              {item.estimatedTimeInMinutes && !compact && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{item.estimatedTimeInMinutes} min</span>
                </div>
              )}
            </div>
            
            {hasSubItems && !compact && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2 h-6 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(item.id);
                }}
              >
                {isExpanded ? 'Hide details' : 'Show details'}
              </Button>
            )}
          </div>
        </div>
        
        {hasSubItems && isExpanded && !compact && (
          <div className="ml-12 pl-6 border-l border-gray-200">
            {item.subItems!.map((subItem, subIndex) => (
              renderItem(subItem, subIndex, subIndex === item.subItems!.length - 1)
            ))}
          </div>
        )}
      </React.Fragment>
    );
  };
  
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">No learning activities scheduled yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={compact ? 'p-0' : ''}>
        <div className={compact ? 'px-6 py-2' : ''}>
          {items.map((item, index) => renderItem(item, index, index === items.length - 1))}
        </div>
        
        {compact && items.length > 0 && (
          <div className="p-4 border-t flex justify-center">
            <Button variant="outline" size="sm" className="text-sm">
              View all activities
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyTimeline;
