
import React, { useState } from "react";
import { useSubjectContext } from "@/context/SubjectContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateSchedule } from "@/utils/scheduleGenerator";
import ScheduleTimeline from "@/components/ScheduleTimeline";

const Schedule = () => {
  const { subjects, schedule, updateSchedule, markScheduleCompleted } = useSubjectContext();
  
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 14));
  const [dailyHours, setDailyHours] = useState<number>(2);
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'distributed'>('distributed');
  
  const handleGenerateSchedule = () => {
    if (subjects.length === 0) {
      toast.error("Add subjects before generating a schedule");
      return;
    }
    
    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }
    
    const newSchedule = generateSchedule({
      subjects,
      startDate,
      endDate,
      dailyHours,
      preferredTimeOfDay,
    });
    
    updateSchedule(newSchedule);
    toast.success("Study schedule generated successfully");
  };
  
  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Your Study Schedule</h1>
            <p className="text-muted-foreground mt-1">
              Plan and track your study sessions
            </p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Schedule generator */}
            <Card className="lg:col-span-1 neomorphism border-0 animate-fade-in">
              <CardHeader>
                <CardTitle>Generate Schedule</CardTitle>
                <CardDescription>
                  Create a personalized study plan based on your subjects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    className="border rounded-md p-3 w-full pointer-events-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    className="border rounded-md p-3 w-full pointer-events-auto"
                    disabled={(date) => date < startDate}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Study Hours</label>
                  <Select
                    value={dailyHours.toString()}
                    onValueChange={(value) => setDailyHours(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hours" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8].map((hours) => (
                        <SelectItem key={hours} value={hours.toString()}>
                          {hours} hour{hours !== 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Time</label>
                  <Select
                    value={preferredTimeOfDay}
                    onValueChange={(value) => setPreferredTimeOfDay(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time of day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="distributed">Distributed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleGenerateSchedule} 
                  className="w-full"
                  disabled={subjects.length === 0}
                >
                  Generate Schedule
                </Button>
              </CardFooter>
            </Card>
            
            {/* Schedule timeline */}
            <div className="lg:col-span-2 animate-fade-in">
              {schedule.length > 0 ? (
                <ScheduleTimeline
                  schedule={schedule}
                  subjects={subjects}
                  onMarkCompleted={markScheduleCompleted}
                />
              ) : (
                <div className="bg-muted/30 rounded-lg p-12 text-center h-full flex flex-col items-center justify-center">
                  <h3 className="text-lg font-medium mb-2">No schedule generated yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {subjects.length > 0
                      ? "Set your date range and preferences, then generate a schedule"
                      : "Add subjects first, then generate your personalized study plan"}
                  </p>
                  {subjects.length === 0 && (
                    <Button onClick={() => window.location.href = "/subjects"}>
                      Add Subjects
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
