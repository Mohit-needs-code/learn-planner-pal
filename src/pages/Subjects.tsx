
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubjectContext } from "@/context/SubjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import SubjectCard from "@/components/SubjectCard";
import DifficultyQuestion from "@/components/DifficultyQuestion";

const Subjects = () => {
  const navigate = useNavigate();
  const { subjects, addSubject, removeSubject } = useSubjectContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form state
  const [subjectName, setSubjectName] = useState("");
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [difficulty, setDifficulty] = useState(3); // Default to medium
  
  const handleAddSubject = () => {
    if (step === 1) {
      if (!subjectName.trim()) {
        toast.error("Please enter a subject name");
        return;
      }
      if (!examDate) {
        toast.error("Please select an exam date");
        return;
      }
      
      setStep(2);
      return;
    }
    
    // Final submission
    addSubject({
      name: subjectName,
      examDate: examDate,
      difficulty,
      timeToSpend: null,
    });
    
    toast.success(`${subjectName} added successfully`);
    
    // Reset form
    setSubjectName("");
    setExamDate(undefined);
    setDifficulty(3);
    setStep(1);
    setDialogOpen(false);
  };
  
  const handleRemoveSubject = (id: string) => {
    removeSubject(id);
    toast.success("Subject removed");
  };
  
  const resetForm = () => {
    setSubjectName("");
    setExamDate(undefined);
    setDifficulty(3);
    setStep(1);
  };
  
  // Sort subjects by nearest exam date
  const sortedSubjects = [...subjects].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold">Your Subjects</h1>
              <p className="text-muted-foreground mt-1">
                Add and manage your subjects here
              </p>
            </div>
            <Button 
              onClick={() => setDialogOpen(true)} 
              className="mt-4 md:mt-0 rounded-full" 
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </header>
          
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
              {sortedSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onClick={() => navigate(`/flashcards?subject=${subject.id}`)}
                  onDelete={() => handleRemoveSubject(subject.id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-12 text-center animate-fade-in">
              <h3 className="text-lg font-medium mb-2">No subjects added yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your first subject to get started with creating your study plan
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Subject Dialog */}
      <Dialog 
        open={dialogOpen} 
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 1 ? "Add New Subject" : "Subject Difficulty"}
            </DialogTitle>
          </DialogHeader>
          
          {step === 1 ? (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label htmlFor="subject-name" className="text-sm font-medium">
                  Subject Name
                </label>
                <Input
                  id="subject-name"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g., Calculus, Biology"
                  className="input-focus-effect"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="exam-date" className="text-sm font-medium">
                  Exam Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      id="exam-date"
                      className={cn(
                        "w-full justify-start text-left font-normal input-focus-effect",
                        !examDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate ? format(examDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ) : (
            <DifficultyQuestion value={difficulty} onChange={setDifficulty} />
          )}
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
            <Button onClick={handleAddSubject}>
              {step === 1 ? "Next" : "Add Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subjects;
