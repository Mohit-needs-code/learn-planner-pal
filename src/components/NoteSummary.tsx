
import React from "react";
import { Badge } from "@/components/ui/badge";

interface NoteSummaryProps {
  summary: string;
  importantTopics: string[];
}

const NoteSummary: React.FC<NoteSummaryProps> = ({ summary, importantTopics }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium mb-2">Important Topics</h3>
        <div className="flex flex-wrap gap-2">
          {importantTopics.map((topic, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {topic}
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-base font-medium mb-2">Summary</h3>
        <div className="text-sm bg-muted/30 p-4 rounded-md">
          {summary.split('\n').map((paragraph, index) => (
            <p key={index} className={index > 0 ? "mt-3" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteSummary;
