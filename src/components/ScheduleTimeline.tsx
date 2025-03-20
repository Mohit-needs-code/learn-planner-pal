
import React, { useState } from "react";
import { format, isToday, isPast, isThisWeek, isSameDay } from "date-fns";
import { Subject } from "@/context/SubjectContext";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleEntry {
  id: string;
  subjectId: string;
  date: Date;
  duration: number;
  completed: boolean;
}

interface ScheduleTimelineProps {
  schedule: ScheduleEntry[];
  subjects: Subject[];
  onMarkCompleted: (id: string, completed: boolean) => void;
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  schedule,
  subjects,
  onMarkCompleted,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Group schedule by date
  const groupedSchedule = schedule.reduce((groups, entry) => {
    const date = new Date(entry.date);
    const dateString = format(date, "yyyy-MM-dd");
    
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    
    groups[dateString].push(entry);
    return groups;
  }, {} as Record<string, ScheduleEntry[]>);

  // Filter dates for navigation
  const dates = Object.keys(groupedSchedule).sort();
  
  // Get subject name by ID
  const getSubjectName = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? subject.name : "Unknown Subject";
  };

  // Filter entries for the selected date
  const filteredEntries = selectedDate
    ? groupedSchedule[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
        {dates.map(dateStr => {
          const date = new Date(dateStr);
          const formattedDate = format(date, "EEE, MMM d");
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          
          return (
            <Button
              key={dateStr}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "flex-shrink-0 transition-all",
                isToday(date) && !isSelected && "border-primary text-primary",
                isPast(date) && !isToday(date) && !isSelected && "text-muted-foreground"
              )}
              onClick={() => setSelectedDate(date)}
            >
              {formattedDate}
            </Button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="p-4 bg-muted border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-medium">
                {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select a date"}
              </h3>
            </div>
            {isToday(selectedDate as Date) && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                Today
              </span>
            )}
          </div>
        </div>

        {filteredEntries.length > 0 ? (
          <div className="divide-y">
            {filteredEntries.map(entry => {
              const entryDate = new Date(entry.date);
              const isPastEntry = isPast(entryDate) && !isToday(entryDate);
              
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "p-4 transition-colors",
                    entry.completed ? "bg-gray-50" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onMarkCompleted(entry.id, !entry.completed)}
                      className={cn(
                        "mt-1 transition-colors",
                        entry.completed ? "text-green-500" : "text-gray-300 hover:text-gray-400"
                      )}
                    >
                      {entry.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={cn(
                          "font-medium",
                          entry.completed && "line-through text-muted-foreground"
                        )}>
                          {getSubjectName(entry.subjectId)}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {format(entryDate, "h:mm a")}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.duration} hour{entry.duration !== 1 ? "s" : ""} study session
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No study sessions scheduled for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTimeline;
