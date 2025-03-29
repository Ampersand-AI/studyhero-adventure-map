
import React from 'react';
import TimelineCard from "./TimelineCard";
import { Separator } from "@/components/ui/separator";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "future";
  dueDate: string;
  type: "lesson" | "quiz" | "practice";
}

interface StudyTimelineProps {
  items: TimelineItem[];
  onStartItem: (id: string) => void;
}

const StudyTimeline = ({ items, onStartItem }: StudyTimelineProps) => {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center w-full max-w-3xl">
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <div
                className={`milestone-node ${
                  item.status === "completed"
                    ? "milestone-completed"
                    : item.status === "current"
                    ? "milestone-current"
                    : "milestone-future"
                }`}
              >
                {index + 1}
              </div>
              {index < items.length - 1 && (
                <div
                  className={`milestone-line ${
                    item.status === "completed" ? "milestone-line-completed" : ""
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
