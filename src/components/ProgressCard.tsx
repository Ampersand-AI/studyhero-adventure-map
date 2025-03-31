
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProgressCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  total?: string; // Make the total prop optional
}

const ProgressCard = ({ title, value, description, icon, total }: ProgressCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          {total && <span className="text-sm font-normal text-muted-foreground">/{total}</span>}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
