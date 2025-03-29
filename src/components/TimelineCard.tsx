
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "future";
  dueDate: string;
  type: "lesson" | "quiz" | "practice";
}

interface TimelineCardProps {
  item: TimelineItem;
  onStart: () => void;
}

const TimelineCard = ({ item, onStart }: TimelineCardProps) => {
  const statusIcon = {
    completed: <CheckCircle className="h-5 w-5 text-study-green" />,
    current: <PlayCircle className="h-5 w-5 text-study-blue animate-pulse" />,
    future: <Circle className="h-5 w-5 text-gray-300" />,
  };

  const typeColors = {
    lesson: "bg-study-blue text-white",
    quiz: "bg-study-purple text-white",
    practice: "bg-study-orange text-white",
  };

  return (
    <Card className={`study-card relative border-l-4 ${
      item.status === 'completed' ? 'border-l-study-green' : 
      item.status === 'current' ? 'border-l-study-blue' : 
      'border-l-gray-300'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className={typeColors[item.type]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Badge>
          <span className="text-sm text-muted-foreground">{item.dueDate}</span>
        </div>
        <CardTitle className="text-lg flex items-center gap-2">
          {statusIcon[item.status]}
          {item.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
        {item.status !== "completed" && (
          <Button 
            className={item.status === "current" ? "w-full" : "w-full bg-gray-200 text-gray-500"}
            disabled={item.status !== "current"}
            onClick={onStart}
          >
            {item.status === "current" ? "Start Now" : "Coming Soon"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineCard;
