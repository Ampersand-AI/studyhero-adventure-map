
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TimelineCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "lesson" | "quiz" | "milestone" | "practice";
  status: "completed" | "in-progress" | "upcoming";
  onStart: (id: string) => void;
}

const TimelineCard = ({ 
  id,
  title, 
  description, 
  date,
  type,
  status,
  onStart 
}: TimelineCardProps) => {
  const statusIcon = {
    completed: <CheckCircle className="h-5 w-5 text-green-500" />,
    "in-progress": <PlayCircle className="h-5 w-5 text-blue-500 animate-pulse" />,
    upcoming: <Circle className="h-5 w-5 text-gray-300" />,
  };

  const typeColors = {
    lesson: "bg-blue-500 text-white",
    quiz: "bg-purple-500 text-white",
    milestone: "bg-orange-500 text-white",
    practice: "bg-green-500 text-white",
  };

  return (
    <Card className={`study-card relative border-l-4 ${
      status === 'completed' ? 'border-l-green-500' : 
      status === 'in-progress' ? 'border-l-blue-500' : 
      'border-l-gray-300'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge className={typeColors[type]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
          <span className="text-sm text-muted-foreground">{date}</span>
        </div>
        <CardTitle className="text-lg flex items-center gap-2">
          {statusIcon[status]}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        {status !== "completed" && (
          <Button 
            className={status === "in-progress" ? "w-full" : "w-full bg-gray-200 text-gray-500"}
            disabled={status !== "in-progress"}
            onClick={() => onStart(id)}
          >
            {status === "in-progress" ? "Start Now" : "Coming Soon"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineCard;
