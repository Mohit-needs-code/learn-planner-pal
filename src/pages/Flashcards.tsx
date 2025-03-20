
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSubjectContext } from "@/context/SubjectContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Book } from "lucide-react";
import FlashcardComponent from "@/components/FlashcardComponent";

const Flashcards = () => {
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subject");
  
  const { subjects, flashcards, addFlashcard, removeFlashcard } = useSubjectContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId || "");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  
  // Filter flashcards by selected subject
  const filteredFlashcards = selectedSubjectId
    ? flashcards.filter((f) => f.subjectId === selectedSubjectId)
    : flashcards;
  
  // Get name of selected subject
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  
  useEffect(() => {
    // Set selected subject from URL parameter
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    } else if (subjects.length > 0 && !selectedSubjectId) {
      // Default to first subject if none selected
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjectId, subjects]);
  
  const handleAddFlashcard = () => {
    if (!selectedSubjectId) {
      toast.error("Please select a subject");
      return;
    }
    
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    if (!answer.trim()) {
      toast.error("Please enter an answer");
      return;
    }
    
    addFlashcard({
      subjectId: selectedSubjectId,
      question,
      answer,
    });
    
    // Reset form
    setQuestion("");
    setAnswer("");
    setDialogOpen(false);
    
    toast.success("Flashcard added successfully");
  };
  
  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">Flashcards</h1>
                <p className="text-muted-foreground mt-1">
                  Create and study flashcards for better retention
                </p>
              </div>
              <Button 
                onClick={() => setDialogOpen(true)} 
                className="mt-4 md:mt-0 rounded-full" 
                size="lg"
                disabled={subjects.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Flashcard
              </Button>
            </div>
          </header>
          
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Subject selection sidebar */}
              <div className="animate-fade-in">
                <Card className="neomorphism border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Book className="h-5 w-5 mr-2" />
                      Subjects
                    </CardTitle>
                    <CardDescription>
                      Select a subject to view its flashcards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {subjects.map((subject) => (
                        <Button
                          key={subject.id}
                          variant={selectedSubjectId === subject.id ? "default" : "outline"}
                          className="w-full justify-start text-left"
                          onClick={() => setSelectedSubjectId(subject.id)}
                        >
                          {subject.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => setSelectedSubjectId("")}
                      disabled={!selectedSubjectId}
                    >
                      View All Flashcards
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Flashcards section */}
              <div className="md:col-span-2 animate-fade-in">
                <Card className="neomorphism border-0">
                  <CardHeader>
                    <CardTitle>
                      {selectedSubject ? `${selectedSubject.name} Flashcards` : "All Flashcards"}
                    </CardTitle>
                    <CardDescription>
                      {filteredFlashcards.length} 
                      {filteredFlashcards.length === 1 ? " flashcard" : " flashcards"} available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FlashcardComponent 
                      flashcards={filteredFlashcards}
                      subjectName={selectedSubject?.name}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-12 text-center animate-fade-in">
              <h3 className="text-lg font-medium mb-2">No subjects available</h3>
              <p className="text-muted-foreground mb-6">
                Add subjects first before creating flashcards
              </p>
              <Button asChild>
                <Link to="/subjects">Add Subjects</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Flashcard Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Flashcard</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select
                value={selectedSubjectId}
                onValueChange={setSelectedSubjectId}
                disabled={subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question"
                className="input-focus-effect"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter the answer"
                className="resize-none input-focus-effect"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleAddFlashcard}>
              Add Flashcard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Flashcards;
