
import React from "react";
import { Subject } from "@/context/SubjectContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SubjectCardProps {
  subject: Subject;
  onClick?: () => void;
  onDelete?: () => void;
}

const DifficultyBadge = ({ level }: { level: number }) => {
  let bgColor;
  let label;

  switch (level) {
    case 1:
      bgColor = "bg-green-100 text-green-800";
      label = "Easy";
      break;
    case 2:
      bgColor = "bg-blue-100 text-blue-800";
      label = "Medium";
      break;
    case 3:
      bgColor = "bg-yellow-100 text-yellow-800";
      label = "Challenging";
      break;
    case 4:
      bgColor = "bg-orange-100 text-orange-800";
      label = "Hard";
      break;
    case 5:
      bgColor = "bg-red-100 text-red-800";
      label = "Very Hard";
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
      label = "Unknown";
  }

  return (
    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", bgColor)}>
      {label}
    </span>
  );
};

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick, onDelete }) => {
  // Calculate days remaining until exam
  const today = new Date();
  const examDate = new Date(subject.examDate);
  const differenceInTime = examDate.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

  // Get urgency color based on days remaining
  const getUrgencyColor = () => {
    if (differenceInDays < 0) return "text-gray-400"; // Past
    if (differenceInDays <= 3) return "text-red-500"; // Very urgent
    if (differenceInDays <= 7) return "text-orange-500"; // Urgent
    if (differenceInDays <= 14) return "text-yellow-500"; // Moderate
    return "text-green-500"; // Not urgent
  };

  return (
    <Card 
      className="w-full card-hover overflow-hidden neomorphism border-0"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold line-clamp-1 flex-1">{subject.name}</h3>
          <DifficultyBadge level={subject.difficulty} />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Exam: {format(new Date(subject.examDate), "MMM dd, yyyy")}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>Study time: {subject.timeToSpend || "Not set"} hours</span>
          </div>
          
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className={cn("text-sm font-medium", getUrgencyColor())}>
              {differenceInDays < 0
                ? `Exam passed ${Math.abs(differenceInDays)} days ago`
                : differenceInDays === 0
                ? "Exam is today!"
                : `${differenceInDays} days remaining`}
            </span>
          </div>
        </div>
      </CardContent>
      
      {onDelete && (
        <CardFooter className="p-4 pt-0 flex justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Remove
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SubjectCard;
