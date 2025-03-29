
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Award, Medal } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: "trophy" | "star" | "medal" | "award";
  color: string;
  earned: boolean;
}

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const icons = {
    trophy: Trophy,
    star: Star,
    medal: Medal,
    award: Award,
  };

  const Icon = icons[achievement.type];

  return (
    <Card className={`study-card ${achievement.earned ? "" : "opacity-50"}`}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className={`achievement-badge from-${achievement.color} to-${achievement.color}/50`}>
          <Icon className={`h-6 w-6 ${achievement.earned ? "text-white" : "text-gray-400"}`} />
        </div>
        <div>
          <CardTitle className="text-lg">{achievement.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
